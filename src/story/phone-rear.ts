import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { glMatrix, inverseProjection, screenProjection, type ScreenQuad } from './screen-projection';

const WIDTH = .073, HEIGHT = .158, SOURCE_WIDTH = 960, SOURCE_HEIGHT = 544, FOCAL = 768;

/** Hard-surface handset in metres. Camera pose is recovered from the measured
 * plane; a projective correction preserves its exact filmed corners. */
export class PhoneRear {
  readonly canvas = document.createElement('canvas');
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly root = new THREE.Group();
  private readonly camera = new THREE.PerspectiveCamera(2 * Math.atan(SOURCE_HEIGHT / (2 * FOCAL)) * 180 / Math.PI, SOURCE_WIDTH / SOURCE_HEIGHT, .001, 100);
  private readonly correction = { value: new THREE.Matrix3() };
  private readonly environment: THREE.WebGLRenderTarget;
  private readonly key = new THREE.DirectionalLight('#ffedcf', 3.1);
  private lastQuad = '';

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setSize(2048,2048,false); this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0,0); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const pmrem = new THREE.PMREMGenerator(this.renderer), room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room,.09); room.dispose(); pmrem.dispose();
    this.scene.environment = this.environment.texture; this.scene.environmentIntensity = .8;
    this.scene.add(this.root, new THREE.HemisphereLight('#fff2d7','#446249',1.4));
    this.key.castShadow = true; this.key.shadow.mapSize.set(1024,1024);
    Object.assign(this.key.shadow.camera, { left:-.14,right:.14,top:.14,bottom:-.14,near:.1,far:6 });
    this.key.shadow.bias = -.000015; this.key.shadow.normalBias = .0001;
    this.scene.add(this.key,this.key.target);
    const fill = new THREE.DirectionalLight('#b6c7d1',1.1); fill.position.set(2,1,1); this.scene.add(fill);

    const material = (parameters: THREE.MeshPhysicalMaterialParameters) => {
      const result = new THREE.MeshPhysicalMaterial(parameters);
      result.onBeforeCompile = shader => {
        shader.uniforms.rearCorrection = this.correction;
        shader.vertexShader = 'uniform mat3 rearCorrection;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
          vec2 rearUV = vec2((gl_Position.x/gl_Position.w+1.0)*0.5,(1.0-gl_Position.y/gl_Position.w)*0.5);
          vec3 corrected = rearCorrection * vec3(rearUV,1.0);
          rearUV = corrected.xy / corrected.z;
          gl_Position.xy = vec2(rearUV.x*2.0-1.0,1.0-rearUV.y*2.0)*gl_Position.w;
        `);
      };
      result.customProgramCacheKey = () => 'beans-physical-rear-v1';
      return result;
    };
    const metal = material({ color:'#888984',metalness:.92,roughness:.25 });
    const back = material({ color:'#777d7f',metalness:.3,roughness:.4,clearcoat:.7,clearcoatRoughness:.2 });
    const island = material({ color:'#656e72',metalness:.65,roughness:.26,clearcoat:.7 });
    const dark = material({ color:'#070d13',metalness:.4,roughness:.24 });
    const glass = material({ color:'#111d28',metalness:.7,roughness:.095,clearcoat:1,clearcoatRoughness:.07,ior:1.52 });
    const flash = material({ color:'#ede8d2',roughness:.4,metalness:.1,clearcoat:.4 });
    const mesh = (geometry: THREE.BufferGeometry, surface: THREE.Material, x=0,y=0,z=0) => {
      const object = new THREE.Mesh(geometry,surface); object.position.set(x,y,z);
      object.castShadow = true; object.receiveShadow = true; this.root.add(object); return object;
    };
    const box = (w:number,h:number,d:number,r:number,surface:THREE.Material,x=0,y=0,z=0) => mesh(new RoundedBoxGeometry(w,h,d,3,r),surface,x,y,z);
    const disc = (radius:number,depth:number,surface:THREE.Material,x:number,y:number,z:number) => {
      const object = mesh(new THREE.CylinderGeometry(radius,radius,depth,48),surface,x,y,z);
      object.rotation.x = Math.PI/2; return object;
    };
    box(WIDTH,HEIGHT,.0075,.0065,metal,0,0,-.0039);
    box(WIDTH-.0017,HEIGHT-.0017,.001,.006,back,0,0,-.00035);
    box(.038,.040,.0023,.007,island,-.014,.051,.001);
    for (const [x,y] of [[-.025,.062],[-.025,.041],[-.006,.0515]]) {
      disc(.0071,.003,metal,x,y,.0037);
      disc(.00645,.0005,dark,x,y,.00535);
      disc(.00585,.00035,glass,x,y,.00565);
      // Nested optical elements sit beneath the clear front lens, giving the
      // camera visible depth and view-dependent sapphire reflections.
      disc(.0042,.0002,dark,x,y,.00588);
      disc(.0027,.00015,glass,x,y,.00602);
    }
    disc(.00215,.0007,flash,-.006,.0655,.0027);
    disc(.0019,.0006,dark,-.006,.0375,.0027);
    // Physical side buttons and antenna seams, rather than painted outlines.
    box(.0011,.017,.002,.0004,metal,WIDTH/2,.026,-.003);
    box(.0011,.012,.002,.0004,metal,-WIDTH/2,.032,-.003);
  }

  render(quad: ScreenQuad) {
    const signature = quad.flat().join(',');
    if (signature === this.lastQuad) return this.canvas;
    this.lastQuad = signature;
    const h = screenProjection(quad); if (!h) return this.canvas;
    const plane = new THREE.Matrix3().fromArray(glMatrix(h));
    const pixels = new THREE.Matrix3().set(SOURCE_WIDTH,0,0,0,SOURCE_HEIGHT,0,0,0,1);
    const physical = new THREE.Matrix3().set(1/WIDTH,0,.5,0,-1/HEIGHT,.5,0,0,1);
    const intrinsicsInverse = new THREE.Matrix3().set(1/FOCAL,0,-SOURCE_WIDTH/(2*FOCAL),0,1/FOCAL,-SOURCE_HEIGHT/(2*FOCAL),0,0,1);
    const pose = intrinsicsInverse.multiply(pixels).multiply(plane).multiply(physical).elements;
    const a = new THREE.Vector3(pose[0],pose[1],pose[2]), b = new THREE.Vector3(pose[3],pose[4],pose[5]);
    const scale = 2 / (a.length()+b.length());
    const x = a.normalize(), y = b.addScaledVector(x,-b.dot(x)).normalize(), z = new THREE.Vector3().crossVectors(x,y).normalize();
    const rotation = new THREE.Matrix4().makeBasis(new THREE.Vector3(x.x,-x.y,-x.z),new THREE.Vector3(y.x,-y.y,-y.z),new THREE.Vector3(z.x,-z.y,-z.z));
    this.root.quaternion.setFromRotationMatrix(rotation);
    this.root.position.set(pose[6]*scale,-pose[7]*scale,-pose[8]*scale);
    this.root.updateMatrixWorld(true); this.camera.updateMatrixWorld(true);
    const physicalCorners = [[-WIDTH/2,HEIGHT/2],[WIDTH/2,HEIGHT/2],[WIDTH/2,-HEIGHT/2],[-WIDTH/2,-HEIGHT/2]];
    const projected = physicalCorners.map(([x,y]) => {
      const p = new THREE.Vector3(x,y,0).applyMatrix4(this.root.matrixWorld).project(this.camera);
      return [(p.x+1)/2,(1-p.y)/2] as const;
    }) as unknown as ScreenQuad;
    const projection = screenProjection(projected), inverse = projection && inverseProjection(projection);
    if (!inverse) return this.canvas;
    this.correction.value.copy(plane).multiply(new THREE.Matrix3().fromArray(glMatrix(inverse)));
    this.key.target.position.copy(this.root.position);
    this.key.position.copy(this.root.position).add(new THREE.Vector3(-1,1.6,2));
    this.renderer.render(this.scene,this.camera);
    return this.canvas;
  }

  dispose() {
    this.root.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const material = object.material as THREE.Material; material.dispose(); } });
    this.key.shadow.map?.dispose(); this.environment.dispose(); this.renderer.dispose();
  }
}
