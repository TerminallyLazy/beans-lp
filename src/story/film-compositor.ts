import { glMatrix, inverseProjection, screenProjection, type ScreenQuad } from './screen-projection';
import type { FilmViewport } from './film-viewport';

const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main(){uv=(position+1.0)*0.5;gl_Position=vec4(position,0.0,1.0);}`;
const FRAGMENT = `
precision highp float;
uniform sampler2D film;
uniform sampler2D app;
uniform sampler2D rear;
uniform mat3 inversePlane;
uniform float tracked;
uniform float casing;
uniform vec4 frameRect;
varying vec2 uv;
void main(){
  vec2 source=vec2(frameRect.x+uv.x*frameRect.z,frameRect.y+(1.0-uv.y)*frameRect.w);
  vec3 original=texture2D(film,vec2(source.x,1.0-source.y)).rgb;
  vec3 plane=inversePlane*vec3(source,1.0);
  vec2 p=plane.xy/plane.z;
  float inside=step(0.0,p.x)*step(p.x,1.0)*step(0.0,p.y)*step(p.y,1.0);
  // The original image remains the occlusion source: fingers and the dark bezel stay in front.
  float ivory=smoothstep(0.74,0.9,original.g)*(1.0-smoothstep(0.09,0.18,original.r-original.g));
  vec2 q=abs(vec2(p.x-0.5,(p.y-0.5)*2.1727))-vec2(0.44,1.02635);
  float distanceToGlass=length(max(q,0.0))+min(max(q.x,q.y),0.0)-0.06;
  float rounded=1.0-smoothstep(-0.003,0.003,distanceToGlass);
  vec3 interfaceColor=texture2D(app,vec2(p.x,1.0-p.y)).rgb;
  vec3 rearColor=texture2D(rear,vec2(p.x,1.0-p.y)).rgb;
  float light=clamp(dot(original,vec3(0.2126,0.7152,0.0722))/0.97,0.87,1.04);
  vec3 surfaceColor=mix(interfaceColor*light,rearColor*clamp(light,.75,1.08),casing);
  gl_FragColor=vec4(mix(original,surfaceColor,tracked*inside*ivory*rounded),1.0);
}`;

/** Native app pixels projected onto measured glass; never paints over the Human's hands. */
export class FilmCompositor {
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly film: WebGLTexture;
  private readonly app: WebGLTexture;
  private readonly rear: WebGLTexture;
  private readonly inverse: WebGLUniformLocation;
  private readonly tracked: WebGLUniformLocation;
  private readonly casing: WebGLUniformLocation;
  private readonly frameRect: WebGLUniformLocation;
  private crop: FilmViewport = [0,0,1,1];
  private readonly screenBuffer = document.createElement('canvas');
  private previousSource: HTMLVideoElement | HTMLImageElement | null = null;
  private previousTime = -1;

  constructor(canvas: HTMLCanvasElement, appImage: HTMLImageElement | HTMLCanvasElement, rearImage?: HTMLImageElement) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('This browser cannot display the composited phone preview.');
    this.gl = gl;
    const compile = (kind: number, source: string) => {
      const shader = gl.createShader(kind)!; gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message || 'Phone compositor shader failed.');
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX), fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram()!; gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program); gl.deleteProgram(program); throw new Error(message || 'Phone compositor linking failed.');
    }
    this.program = program; gl.useProgram(program);
    this.buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = (unit: number) => {
      const target = gl.createTexture()!; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, target);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return target;
    };
    this.film = texture(0); this.app = texture(1); this.rear = texture(2);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    this.screenBuffer.width = 1024; this.screenBuffer.height = 2048;
    this.setScreen(appImage);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.rear);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, rearImage || this.screenBuffer);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'film'), 0); gl.uniform1i(gl.getUniformLocation(program, 'app'), 1); gl.uniform1i(gl.getUniformLocation(program, 'rear'), 2);
    this.inverse = gl.getUniformLocation(program, 'inversePlane')!; this.tracked = gl.getUniformLocation(program, 'tracked')!;
    this.casing = gl.getUniformLocation(program, 'casing')!;
    this.frameRect = gl.getUniformLocation(program, 'frameRect')!;
  }

  setScreen(source: HTMLImageElement | HTMLCanvasElement) {
    const gl = this.gl;
    const context = this.screenBuffer.getContext('2d')!;
    context.drawImage(source, 0, 0, this.screenBuffer.width, this.screenBuffer.height);
    // Simulator captures omit the physical camera cutout. It belongs to the
    // handset, so add it at the measured position above the untouched native UI.
    const w = this.screenBuffer.width, h = this.screenBuffer.height;
    context.fillStyle = '#080a0c'; context.beginPath();
    context.roundRect(w * .345, h * .017, w * .31, h * .039, h * .0195);
    context.fill();
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.app);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.screenBuffer);
    // Small perspective lettering needs mipmaps; a single bilinear sample aliases native text.
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');
    if (anisotropy) gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  }

  setViewport(viewport: FilmViewport) { this.crop = viewport; }
  getViewport() { return this.crop; }

  draw(source: HTMLVideoElement | HTMLImageElement, quad: ScreenQuad | null, opacity = 1, face: 'app' | 'case' = 'app') {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.film);
    const time = source instanceof HTMLVideoElement ? source.currentTime : 0;
    if (source !== this.previousSource || time !== this.previousTime) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      this.previousSource = source; this.previousTime = time;
    }
    this.redraw(quad, opacity, face);
  }

  /** Resize or change pet UI without sampling a video that is still seeking. */
  redraw(quad: ScreenQuad | null, opacity = 1, face: 'app' | 'case' = 'app') {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const h = quad && screenProjection(quad), inverse = h && inverseProjection(h);
    gl.useProgram(this.program); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.film);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.app);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.rear);
    gl.uniform1f(this.tracked, inverse ? opacity : 0);
    gl.uniform1f(this.casing, face === 'case' ? 1 : 0);
    gl.uniform4f(this.frameRect, ...this.crop);
    gl.uniformMatrix3fv(this.inverse, false, glMatrix(inverse || [1, 0, 0, 0, 1, 0, 0, 0, 1]));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    this.gl.deleteTexture(this.film); this.gl.deleteTexture(this.app); this.gl.deleteTexture(this.rear);
    this.gl.deleteBuffer(this.buffer); this.gl.deleteProgram(this.program);
  }
}
