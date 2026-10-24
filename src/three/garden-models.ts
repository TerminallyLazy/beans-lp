import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type Instance = {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  scale: THREE.Vector3;
  color?: THREE.ColorRepresentation;
};

/** An open-centred meadow in a 16 × 9 stage; the caller owns lighting and disposal. */
export function createGarden(): {
  group: THREE.Group;
  butterfly: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
} {
  const group = new THREE.Group();
  group.name = 'garden';
  const meadow = new THREE.Group();
  meadow.name = 'meadow-frame';
  group.add(meadow);
  const leftCorner = new THREE.Group();
  leftCorner.name = 'garden-left';
  leftCorner.position.x = -7;
  const rightCorner = new THREE.Group();
  rightCorner.name = 'garden-right';
  rightCorner.position.x = 7;
  meadow.add(leftCorner, rightCorner);
  const groundY = -3.4;
  let seed = 261024;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const material = (color: THREE.ColorRepresentation, roughness = .84) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
  const grassMaterial = material('#ffffff');
  grassMaterial.side = THREE.DoubleSide;
  const leafMaterial = material('#ffffff');
  leafMaterial.side = THREE.DoubleSide;
  const stemMaterial = material('#718561');
  const branchMaterial = material('#a68b70');
  const petalMaterial = material('#ffffff', .7);
  const pollenMaterial = material('#e9b567', .88);
  const stoneMaterial = material('#ffffff', .95);

  function mesh(geometry: THREE.BufferGeometry, surface: THREE.Material, name: string) {
    const result = new THREE.Mesh(geometry, surface);
    result.name = name;
    result.castShadow = true;
    result.receiveShadow = true;
    return result;
  }

  function instances(geometry: THREE.BufferGeometry, surface: THREE.Material, data: Instance[], name: string) {
    for (const corner of [leftCorner, rightCorner]) {
      const entries = data.filter(item => Math.sign(item.position.x) === Math.sign(corner.position.x));
      if (!entries.length) continue;
      const result = new THREE.InstancedMesh(geometry, surface, entries.length);
      result.name = `${corner.name}-${name}`;
      result.castShadow = true;
      result.receiveShadow = true;
      const transform = new THREE.Object3D();
      entries.forEach((item, index) => {
        transform.position.copy(item.position).sub(corner.position);
        transform.rotation.copy(item.rotation ?? new THREE.Euler());
        transform.scale.copy(item.scale);
        transform.updateMatrix();
        result.setMatrixAt(index, transform.matrix);
        result.setColorAt(index, new THREE.Color(item.color ?? '#ffffff'));
      });
      result.instanceMatrix.needsUpdate = true;
      if (result.instanceColor) result.instanceColor.needsUpdate = true;
      result.computeBoundingSphere();
      corner.add(result);
    }
  }

  function placeInMeadow(object: THREE.Mesh) {
    object.geometry.computeBoundingBox();
    const centre = object.geometry.boundingBox!.getCenter(new THREE.Vector3()).add(object.position);
    const corner = centre.x < 0 ? leftCorner : rightCorner;
    object.position.sub(corner.position);
    corner.add(object);
  }

  // A folded centre ridge catches the light; the blade narrows into a curved tip.
  function bladeGeometry(width: number, bend: number): THREE.BufferGeometry {
    const positions: number[] = [];
    const indices: number[] = [];
    const sections = 10;
    for (let row = 0; row <= sections; row++) {
      const t = row / sections;
      const halfWidth = width * Math.pow(Math.sin(Math.PI * t), .7) + .001;
      const curve = bend * t * t;
      for (let column = -1; column <= 1; column++) {
        positions.push(column * halfWidth + t * t * .12, t, curve + (column === 0 ? halfWidth * .35 : 0));
      }
      if (row < sections) {
        for (let column = 0; column < 2; column++) {
          const a = row * 3 + column;
          indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function curvedStem(points: THREE.Vector3[], radius: number, surface: THREE.Material, name: string) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 16, radius, 7, false), surface, name);
  }

  const stoneGeometry = new THREE.SphereGeometry(1, 28, 18);
  const stonePositions = stoneGeometry.getAttribute('position');
  for (let i = 0; i < stonePositions.count; i++) {
    const x = stonePositions.getX(i), y = stonePositions.getY(i), z = stonePositions.getZ(i);
    const swell = 1 + .075 * Math.sin(x * 3.1 + z * 2) * Math.cos(y * 2.6 - z);
    stonePositions.setXYZ(i, x * swell, y * swell, z * swell);
  }
  stoneGeometry.computeVertexNormals();

  // No ground discs: the illustrated park supplies the floor beneath this edge planting.
  const stones: Instance[] = [
    { position: new THREE.Vector3(-7.3, groundY + .2, 1.05), scale: new THREE.Vector3(.77, .47, .6), color: '#c3c0a8', rotation: new THREE.Euler(.1, -.3, .12) },
    { position: new THREE.Vector3(-6.55, groundY + .02, 1.7), scale: new THREE.Vector3(.49, .29, .38), color: '#d9cbb4', rotation: new THREE.Euler(.2, .3, -.17) },
    { position: new THREE.Vector3(-8.05, groundY + .08, .35), scale: new THREE.Vector3(.72, .34, .5), color: '#b6bd9e' },
    { position: new THREE.Vector3(7.6, groundY + .16, 1.25), scale: new THREE.Vector3(.83, .4, .57), color: '#cec6af', rotation: new THREE.Euler(.2, .4, -.12) },
    { position: new THREE.Vector3(6.85, groundY + .02, 1.75), scale: new THREE.Vector3(.39, .22, .32), color: '#e5d7bf' },
    { position: new THREE.Vector3(8.2, groundY + .35, .55), scale: new THREE.Vector3(.76, .6, .55), color: '#b4b99c', rotation: new THREE.Euler(.1, -.2, .12) },
  ];
  instances(stoneGeometry, stoneMaterial, stones, 'river-stones');

  const grass: Instance[] = [];
  const grassColors = ['#7a8d65', '#98a77b', '#b3b88a', '#6e835f', '#c0c399'];
  for (const side of [-1, 1]) {
    // Irregular clumps instead of a uniform lawn or a solid decorative border.
    for (let tuft = 0; tuft < 19; tuft++) {
      const x = side * (5.5 + random() * 3.3);
      const z = .1 + random() * 2;
      const height = .35 + random() * .6;
      for (let blade = 0; blade < 7; blade++) {
        grass.push({
          position: new THREE.Vector3(x + (random() - .5) * .2, groundY - .1 + random() * .1, z),
          rotation: new THREE.Euler((random() - .5) * .4, random() * Math.PI * 2, (random() - .5) * .8),
          scale: new THREE.Vector3(.65 + random() * .7, height * (.65 + random() * .6), 1),
          color: grassColors[Math.floor(random() * grassColors.length)],
        });
      }
    }
  }
  instances(bladeGeometry(.042, .23), grassMaterial, grass, 'curved-meadow-grass');

  const leaves: Instance[] = [];
  const petals: Instance[] = [];
  const pollen: Instance[] = [];
  const petalGeometry = new THREE.SphereGeometry(1, 16, 10);
  const pollenGeometry = new THREE.SphereGeometry(1, 16, 10);
  // Heights and gaps are composed rather than filled uniformly with flowers.
  const flowers: Array<[number, number, number, number, boolean]> = [
    [-7.65, .25, 1.32, .3, false], [-6.75, .4, .94, .23, false],
    [-6.2, 1.15, .57, .2, true], [-8.15, .1, 1.7, .25, true],
    [-5.52, 1.48, .38, .15, false], [-7.2, 1.85, .58, .19, true],
    [-8.5, .5, .88, .24, false], [-6.1, .12, .72, .16, false],
    [7.55, .1, 1.4, .3, true], [6.72, .6, .94, .25, false],
    [5.8, 1.2, .53, .18, false], [8.25, .45, 1.79, .27, false],
    [7.28, 1.75, .61, .2, true], [6.25, .12, .86, .17, true],
    [5.4, 1.55, .29, .13, false], [8.6, 1.1, 1.01, .22, false],
  ];
  flowers.forEach(([x, z, height, radius, coral], flowerIndex) => {
    const lean = Math.sin(flowerIndex * 2.4) * .16;
    const start = new THREE.Vector3(x, groundY, z);
    const head = new THREE.Vector3(x + lean, groundY + height, z + .06);
    placeInMeadow(curvedStem([start, new THREE.Vector3(x - lean * .5, groundY + height * .55, z - .04), head], .016 + radius * .025, stemMaterial, `flower-stem-${flowerIndex}`));
    const tilt = new THREE.Euler(-.16 - random() * .28, (random() - .5) * .65, lean);
    const face = new THREE.Quaternion().setFromEuler(tilt);
    const petalCount = coral ? 7 : 10;
    for (let i = 0; i < petalCount; i++) {
      const angle = i / petalCount * Math.PI * 2;
      const petalPosition = new THREE.Vector3(Math.sin(angle) * radius * .59, Math.cos(angle) * radius * .59, .015).applyQuaternion(face).add(head);
      const petalRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle).premultiply(face);
      petals.push({
        position: petalPosition,
        rotation: new THREE.Euler().setFromQuaternion(petalRotation),
        scale: new THREE.Vector3(radius * (coral ? .3 : .2), radius * .56, radius * .13),
        color: coral ? ['#ed8b78', '#f1a08b', '#e98370'][i % 3] : ['#fff5dc', '#f7edd4', '#fff9e9'][i % 3],
      });
    }
    pollen.push({ position: new THREE.Vector3(0, 0, radius * .12).applyQuaternion(face).add(head), rotation: tilt, scale: new THREE.Vector3(radius * .3, radius * .3, radius * .18) });
    for (const side of [-1, 1]) {
      leaves.push({
        position: new THREE.Vector3(x + lean * .25, groundY + height * (side > 0 ? .32 : .5), z),
        rotation: new THREE.Euler(.1, side * .3, side * -.9),
        scale: new THREE.Vector3(.65, height * .34, .75),
        color: side > 0 ? '#9aa97b' : '#7d9269',
      });
    }
  });
  instances(petalGeometry, petalMaterial, petals, 'ivory-and-coral-petals');
  instances(pollenGeometry, pollenMaterial, pollen, 'flower-centres');

  // Two slender peripheral sprigs add a nearer plane without filling the middle.
  for (const side of [-1, 1]) {
    const branchX = side * 8.15;
    placeInMeadow(curvedStem([
      new THREE.Vector3(branchX, groundY - .15, .35),
      new THREE.Vector3(branchX - side * .35, -2.1, .32),
      new THREE.Vector3(branchX - side * .72, -.8, .1),
    ], .036, branchMaterial, `meadow-sprig-${side}`));
    for (let i = 0; i < 7; i++) {
      const t = (i + 1) / 8;
      const leafSide = i % 2 === 0 ? -1 : 1;
      leaves.push({
        position: new THREE.Vector3(branchX - side * .72 * t, groundY + 2.6 * t, .3 - t * .2),
        rotation: new THREE.Euler(-.2, leafSide * .35, leafSide * .85),
        scale: new THREE.Vector3(.85, .4 + Math.sin(t * Math.PI) * .2, .8),
        color: i % 2 === 0 ? '#a3ad84' : '#8e9d73',
      });
    }
  }
  instances(bladeGeometry(.23, .12), leafMaterial, leaves, 'folded-sage-leaves');

  const { group: butterfly, leftWing, rightWing } = createButterfly();
  butterfly.position.set(-4.6, -.8, 2.8);
  butterfly.scale.setScalar(.52);
  group.add(butterfly);
  return { group, butterfly, leftWing, rightWing };
}

export type ButterflyPalette = 'coral' | 'honey' | 'sky';

/** Three meshes per butterfly; wing groups hinge around Y and retain their own pivots. */
export function createButterfly(palette: ButterflyPalette = 'coral'): {
  group: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
} {
  const colors = {
    coral: { rim: '#ac604c', wing: '#ec926d', light: '#ffd0a0', lower: '#ffdab0', vein: '#d47b5b', body: '#805b43' },
    honey: { rim: '#a67c43', wing: '#e9b754', light: '#ffe5aa', lower: '#ffedbf', vein: '#ce9c51', body: '#77603e' },
    sky: { rim: '#597d86', wing: '#8bbbc4', light: '#d6eee3', lower: '#d4e8da', vein: '#78a3ad', body: '#596e69' },
  }[palette];
  const group = new THREE.Group();
  group.name = 'butterfly';
  group.userData.palette = palette;
  const leftWing = new THREE.Group();
  const rightWing = new THREE.Group();
  leftWing.name = 'butterfly-left-wing';
  rightWing.name = 'butterfly-right-wing';
  leftWing.position.x = -.035;
  rightWing.position.x = .035;
  group.add(leftWing, rightWing);

  function colored(geometry: THREE.BufferGeometry, color: string, upperColor?: string) {
    const result = geometry.index ? geometry.toNonIndexed() : geometry;
    if (result !== geometry) geometry.dispose();
    result.deleteAttribute('uv');
    const positions = result.getAttribute('position');
    const values = new Float32Array(positions.count * 3);
    const lower = new THREE.Color(color);
    const upper = new THREE.Color(upperColor ?? color);
    const vertex = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      vertex.copy(lower).lerp(upper, THREE.MathUtils.clamp((positions.getY(i) + .7) / 1.55, 0, 1));
      vertex.toArray(values, i * 3);
    }
    result.setAttribute('color', new THREE.BufferAttribute(values, 3));
    return result;
  }

  function merge(parts: THREE.BufferGeometry[]) {
    const geometry = mergeGeometries(parts, false);
    parts.forEach(part => part.dispose());
    if (!geometry) throw new Error('Butterfly geometry could not be combined.');
    geometry.computeBoundingSphere();
    return geometry;
  }

  function ellipse(x: number, y: number, rx: number, ry: number, rotation: number, z: number) {
    return new THREE.CircleGeometry(1, 18).scale(rx, ry, 1).rotateZ(rotation).translate(x, y, z);
  }

  function tube(points: THREE.Vector3[], radius: number) {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 8, radius, 4, false);
  }

  const wingShape = new THREE.Shape();
  wingShape.moveTo(.035, .19);
  wingShape.bezierCurveTo(.26, .75, .72, 1.08, 1.02, .84);
  wingShape.bezierCurveTo(1.29, .59, 1.15, .19, .72, -.02);
  wingShape.bezierCurveTo(1.02, -.24, .88, -.62, .58, -.7);
  wingShape.bezierCurveTo(.28, -.78, .1, -.38, .035, -.19);
  wingShape.quadraticCurveTo(.11, 0, .035, .19);
  const wingParts: THREE.BufferGeometry[] = [
    colored(new THREE.ExtrudeGeometry(wingShape, { depth: .015, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .008, bevelThickness: .006, curveSegments: 12 }), colors.rim),
  ];
  // Both sides carry the same pattern, so a turn in flight never reveals a blank back.
  for (const side of [-1, 1]) {
    const z = side > 0 ? .027 : -.011;
    wingParts.push(colored(new THREE.ShapeGeometry(wingShape, 12).scale(.925, .93, 1).translate(.012, .008, z), colors.wing, colors.light));
    wingParts.push(colored(ellipse(.68, .48, .255, .28, -.45, z + side * .002), colors.light));
    wingParts.push(colored(ellipse(.55, -.37, .17, .19, .35, z + side * .002), colors.lower));
    // The crescent and cream edge marks read at flight size without extra meshes.
    wingParts.push(colored(ellipse(.81, .53, .075, .105, -.4, z + side * .004), colors.rim));
    wingParts.push(colored(ellipse(.81, .53, .043, .065, -.4, z + side * .006), '#fff3d6'));
    for (const [x, y, radius] of [[.77, .75, .036], [.99, .46, .04], [.89, .2, .029], [.74, -.46, .032], [.52, -.57, .028]]) {
      wingParts.push(colored(new THREE.CircleGeometry(radius, 10).translate(x, y, z + side * .004), '#fff0d1'));
    }
    for (const [x, y] of [[.87, .7], [.96, .28], [.66, -.53]]) {
      wingParts.push(colored(tube([
        new THREE.Vector3(.1, 0, z + side * .004),
        new THREE.Vector3(x * .5, y * .3, z + side * .006),
        new THREE.Vector3(x, y, z + side * .004),
      ], .006), colors.vein));
    }
  }
  const wingGeometry = merge(wingParts);
  const surface = new THREE.MeshStandardMaterial({
    vertexColors: true, side: THREE.DoubleSide, roughness: .62, metalness: 0,
    envMapIntensity: .6,
  });
  for (const [hinge, side] of [[leftWing, -1], [rightWing, 1]] as const) {
    const wing = new THREE.Mesh(wingGeometry, surface);
    wing.name = 'patterned-wing';
    wing.scale.x = side;
    // A small flying subject does not need an additional shadow pass for each detail.
    wing.castShadow = false;
    wing.receiveShadow = false;
    hinge.add(wing);
  }

  const bodyParts: THREE.BufferGeometry[] = [
    colored(new THREE.CapsuleGeometry(.065, .55, 4, 8).translate(0, 0, .065), colors.body),
    colored(new THREE.SphereGeometry(.092, 10, 8).translate(0, .37, .075), colors.body),
  ];
  for (const side of [-1, 1]) {
    bodyParts.push(colored(new THREE.SphereGeometry(.026, 8, 6).translate(side * .065, .39, .132), '#343f38'));
    bodyParts.push(colored(tube([
      new THREE.Vector3(side * .035, .43, .08),
      new THREE.Vector3(side * .11, .62, .05),
      new THREE.Vector3(side * .19, .65, .065),
    ], .011), colors.body));
    bodyParts.push(colored(new THREE.SphereGeometry(.022, 8, 6).translate(side * .19, .65, .065), colors.body));
  }
  const body = new THREE.Mesh(merge(bodyParts), surface);
  body.name = 'butterfly-body-and-antennae';
  body.castShadow = false;
  body.receiveShadow = false;
  group.add(body);
  return { group, leftWing, rightWing };
}
