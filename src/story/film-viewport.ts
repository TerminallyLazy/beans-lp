export type FilmViewport = readonly [left: number, top: number, width: number, height: number];

/** Cover the visible surface in the shader, avoiding a second browser upscale
 * of a large, mostly clipped landscape canvas on portrait phones. */
export function filmViewport(width: number, height: number, filmWidth: number, filmHeight: number, position = .5): FilmViewport {
  const scale = Math.max(width / filmWidth, height / filmHeight);
  const visibleWidth = width / (filmWidth * scale), visibleHeight = height / (filmHeight * scale);
  return [(1 - visibleWidth) * Math.max(0, Math.min(1, position)), (1 - visibleHeight) / 2, visibleWidth, visibleHeight];
}
