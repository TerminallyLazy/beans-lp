import { describe, expect, it } from 'vitest';
import { inverseProjection, projectPoint, screenProjection, type Point, type ScreenQuad } from '../src/story/screen-projection';

function close(actual: Point, expected: Point) {
  expect(actual[0]).toBeCloseTo(expected[0], 8);
  expect(actual[1]).toBeCloseTo(expected[1], 8);
}

describe('physical phone screen projection', () => {
  it('maps all four image corners to a skewed display without affine distortion', () => {
    const quad: ScreenQuad = [[0.36, 0.14], [0.5, 0.13], [0.54, 0.7], [0.39, 0.73]];
    const h = screenProjection(quad)!;
    const source: ScreenQuad = [[0, 0], [1, 0], [1, 1], [0, 1]];
    source.forEach((point, i) => close(projectPoint(h, point), quad[i]));
    const inverse = inverseProjection(h)!;
    for (const p of [[0.1, 0.2], [0.5, 0.5], [0.83, 0.91]] as Point[]) close(projectPoint(inverse, projectPoint(h, p)), p);
  });

  it('keeps known screen-center coordinates through a rectangular projection', () => {
    const h = screenProjection([[100, 200], [300, 200], [300, 640], [100, 640]])!;
    close(projectPoint(h, [0.5, 0.5]), [200, 420]);
    close(projectPoint(h, [0.25, 0.75]), [150, 530]);
  });

  it('rejects edge-on, crossed and invalid tracks instead of placing UI across the scene', () => {
    expect(screenProjection([[0, 0], [1, 1], [2, 2], [3, 3]])).toBeNull();
    expect(screenProjection([[0, 0], [1, 1], [1, 0], [0, 1]])).toBeNull();
    expect(screenProjection([[0, 0], [1, 0], [NaN, 1], [0, 1]])).toBeNull();
  });
});
