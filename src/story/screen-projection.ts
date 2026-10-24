export type Point = readonly [number, number];
/** Clockwise, starting at the upper-left display corner. Coordinates use the frame's top-left origin. */
export type ScreenQuad = readonly [Point, Point, Point, Point];
export type Homography = readonly [number, number, number, number, number, number, number, number, number];

/** Maps unit app coordinates to the measured screen plane. Rejects crossed or collapsed planes. */
export function screenProjection(quad: ScreenQuad): Homography | null {
  if (quad.some(point => point.some(value => !Number.isFinite(value)))) return null;
  const turns = quad.map((p, i) => {
    const q = quad[(i + 1) % 4], r = quad[(i + 2) % 4];
    return (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]);
  });
  if (turns.some(turn => Math.abs(turn) < 1e-9) || !turns.every(turn => Math.sign(turn) === Math.sign(turns[0]))) return null;
  const source: ScreenQuad = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const equations = source.flatMap(([x, y], i) => {
    const [u, v] = quad[i];
    return [[x, y, 1, 0, 0, 0, -x * u, -y * u, u], [0, 0, 0, x, y, 1, -x * v, -y * v, v]];
  });
  for (let column = 0; column < 8; column++) {
    let pivot = column;
    for (let row = column + 1; row < 8; row++) {
      if (Math.abs(equations[row][column]) > Math.abs(equations[pivot][column])) pivot = row;
    }
    if (Math.abs(equations[pivot][column]) < 1e-12) return null;
    [equations[pivot], equations[column]] = [equations[column], equations[pivot]];
    const divisor = equations[column][column];
    equations[column] = equations[column].map(value => value / divisor);
    for (let row = 0; row < 8; row++) {
      if (row === column) continue;
      const factor = equations[row][column];
      equations[row] = equations[row].map((value, i) => value - factor * equations[column][i]);
    }
  }
  return [...equations.map(row => row[8]), 1] as unknown as Homography;
}

export function projectPoint(h: Homography, [x, y]: Point): Point {
  const w = h[6] * x + h[7] * y + h[8];
  return [(h[0] * x + h[1] * y + h[2]) / w, (h[3] * x + h[4] * y + h[5]) / w];
}

export function inverseProjection(h: Homography): Homography | null {
  const [a, b, c, d, e, f, g, j, k] = h;
  const values = [e * k - f * j, c * j - b * k, b * f - c * e,
    f * g - d * k, a * k - c * g, c * d - a * f,
    d * j - e * g, b * g - a * j, a * e - b * d];
  const determinant = a * values[0] + b * values[3] + c * values[6];
  if (Math.abs(determinant) < 1e-12) return null;
  return values.map(value => value / determinant) as unknown as Homography;
}

export function glMatrix(h: Homography): Float32Array {
  return new Float32Array([h[0], h[3], h[6], h[1], h[4], h[7], h[2], h[5], h[8]]);
}
