import type { ScreenQuad } from './screen-projection';

/** A decode belongs to the request that started it, even if scrolling has
 * already requested a later chapter. Never pair that picture with future UI. */
export function decodedPresentation<T extends { filmTime: number }>(target: T, decoding: T, mediaTime: number, fps: number): T | null {
  const matches = (state: T) => Math.abs(Math.round(state.filmTime * fps) / fps - mediaTime) < .51 / fps;
  return matches(target) ? target : matches(decoding) ? decoding : null;
}

/** The outward-facing handset is a case during the family walk. App pixels
 * belong only on the close, readable display after the camera turns around. */
export function phoneFace(frame: number, fps: number, familyStart: number, quad: ScreenQuad | null, authoredFaces?: readonly ('app' | 'case')[]): 'app' | 'case' {
  if (authoredFaces?.[frame]) return authoredFaces[frame];
  if (frame >= familyStart) return frame >= familyStart + 37 / 16 * fps && frame < familyStart + 122 / 16 * fps ? 'case' : 'app';
  if (quad && Math.max(...quad.map(p => p[1])) - Math.min(...quad.map(p => p[1])) < .22) return 'case';
  return 'app';
}
