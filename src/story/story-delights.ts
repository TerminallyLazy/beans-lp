import * as THREE from 'three';
import gsap from 'gsap';
import { createButterfly } from '../three/garden-models';

/** A real-time foreground with articulated wings, depth and pointer-aware flight. */
export function createStoryDelights(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0, 0); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .1, 40);
  camera.position.z = 9;
  scene.add(new THREE.HemisphereLight('#fff4dc', '#869981', 3));
  const sun = new THREE.DirectionalLight('#ffead1', 2.5); sun.position.set(-3, 5, 5); scene.add(sun);
  const flock = Array.from({ length: 9 }, (_, i) => {
    const insect = createButterfly((['honey', 'coral', 'sky'] as const)[i % 3]);
    insect.group.scale.setScalar(.07 + (i % 3) * .025); scene.add(insect.group); return insect;
  });
  const pointer = new THREE.Vector3(100, 100, 1), spread = { value: 0 };
  let width = 1, height = 1, enabled = true, progress = 0, elapsed = 0, disposed = false;
  const resize = () => {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
    renderer.setSize(width, height, false); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  const move = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / width - .5) * camera.aspect * 6, (.5 - (event.clientY - rect.top) / height) * 6, 1);
  };
  const leave = () => pointer.set(100, 100, 1);
  const parent = canvas.parentElement!;
  parent.addEventListener('pointermove', move); parent.addEventListener('pointerleave', leave);
  const render = (_time: number, delta: number) => {
    if (disposed || !enabled || document.hidden) return;
    elapsed += Math.min(delta, 50) / 1000;
    flock.forEach(({ group, leftWing, rightWing }, i) => {
      group.visible = width > 700 || i < 5;
      const phase = elapsed * (.28 + i * .016) + i * 1.8;
      const side = i % 2 ? 1 : -1;
      const radius = 1.2 + spread.value * 1.4;
      group.position.set(side * (camera.aspect * 2.3 - .6) + Math.sin(phase) * radius * .55,
        Math.sin(phase * .73 + i) * 1.7 + Math.sin(progress * Math.PI * 4 + i) * .25,
        .3 + Math.cos(phase) * 1.2);
      if (spread.value > 0) {
        const spiral = new THREE.Vector3(Math.sin(phase * 1.7) * camera.aspect * 1.7,
          Math.cos(phase * 1.3 + i) * 1.8, 1.5 + Math.sin(phase));
        group.position.lerp(spiral, spread.value);
      }
      // Near the pointer, approach gently and orbit it; no sudden repulsion or screen blocking.
      if (group.position.distanceTo(pointer) < 1.3) group.position.lerp(pointer, .25);
      group.rotation.set(.35 + Math.sin(phase) * .3, Math.cos(phase) * .7, Math.cos(phase * .73) * .4);
      const wing = .2 + Math.sin(elapsed * (21 + i * .8) + i) * .85;
      leftWing.rotation.y = wing; rightWing.rotation.y = -wing;
    });
    renderer.render(scene, camera);
  };
  gsap.ticker.add(render);
  return {
    setProgress(value: number) { progress = value; },
    setEnabled(value: boolean) { enabled = value; canvas.hidden = !value; },
    flourish() { gsap.killTweensOf(spread); gsap.timeline().to(spread, { value: 1, duration: .9, ease: 'sine.inOut' }).to(spread, { value: 0, duration: 2.5, ease: 'sine.inOut' }); },
    dispose() {
      disposed = true; gsap.ticker.remove(render); gsap.killTweensOf(spread); observer.disconnect();
      parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', leave);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => { if (object instanceof THREE.Mesh) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m)); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose();
    },
  };
}
