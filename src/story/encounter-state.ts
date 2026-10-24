import { CatmullRomCurve3, Vector3 } from 'three';

/** Seconds are a seekable story clock, not wall time. No mutation on crossings. */
export const PROOF_BEATS = {
  alone: 0, stop: 4, draw: 5, screen: 7, kitten: 9, recover: 11,
  meet: 12, add: 14, saved: 17, together: 19, end: 22,
} as const;
export type DeviceScreen = 'welcome' | 'empty' | 'add-kitten' | 'kitten';
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ramp = (t: number, a: number, b: number) => {
  const p = clamp((t - a) / (b - a));
  return p * p * (3 - 2 * p);
};

// Traversed in meters with getPointAt(): walk phase is derived from arc length.
export const walkingPath = new CatmullRomCurve3([
  new Vector3(-2.8, 0, -3.6), new Vector3(-1.8, 0, -1.8),
  new Vector3(-.65, 0, -.45), new Vector3(0, 0, .15),
  new Vector3(1.4, 0, 1.8), new Vector3(3, 0, 3.4),
]);
const stopDistance = walkingPath.getLength() * .56;

export function encounterState(input: number) {
  const t = Number.isFinite(input) ? Math.min(PROOF_BEATS.end, Math.max(0, input)) : 0;
  // Ease to a stop before reaching into the pocket; both endpoints have zero velocity.
  const distance = stopDistance * ramp(t, 0, PROOF_BEATS.stop)
    + (walkingPath.getLength() - stopDistance) * ramp(t, PROOF_BEATS.together, PROOF_BEATS.end);
  const pathProgress = distance / walkingPath.getLength();
  const root = walkingPath.getPointAt(pathProgress);
  const tangent = walkingPath.getTangentAt(pathProgress);
  const holding = ramp(t, PROOF_BEATS.draw, PROOF_BEATS.screen);
  const crouch = ramp(t, PROOF_BEATS.recover, PROOF_BEATS.meet + 1)
    * (1 - ramp(t, PROOF_BEATS.saved, PROOF_BEATS.together));
  const screen: DeviceScreen = t < PROOF_BEATS.screen + 1 ? 'welcome'
    : t < PROOF_BEATS.add ? 'empty'
      : t < PROOF_BEATS.saved ? 'add-kitten' : 'kitten';
  return {
    time: t, root, heading: Math.atan2(tangent.x, tangent.z), distance,
    // Step length is an explicit rig calibration input, never elapsed wall time.
    walkCycles: distance / 1.08,
    walking: t > 0 && t < PROOF_BEATS.stop || t > PROOF_BEATS.together && t < PROOF_BEATS.end,
    holding, crouch, screen,
    kittenVisible: t >= PROOF_BEATS.kitten,
    kittenRoll: ramp(t, PROOF_BEATS.kitten, PROOF_BEATS.recover),
    petCount: t >= PROOF_BEATS.saved ? 1 : 0,
    // Screen finger motion is authored inside the same clock as the Add action.
    addPress: ramp(t, PROOF_BEATS.saved - .35, PROOF_BEATS.saved - .1)
      * (1 - ramp(t, PROOF_BEATS.saved, PROOF_BEATS.saved + .2)),
  };
}
