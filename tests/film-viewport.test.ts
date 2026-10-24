import { describe, expect, it } from 'vitest';
import { filmViewport } from '../src/story/film-viewport';

describe('visible film viewport', () => {
  it('keeps the whole film at its native aspect ratio', () => {
    expect(filmViewport(1920,1088,960,544)).toEqual([0,0,1,1]);
  });
  it('crops horizontally on portrait phones and follows the same reversible focus', () => {
    const left = filmViewport(390,844,960,544,0);
    const right = filmViewport(390,844,960,544,1);
    expect(left[0]).toBe(0);
    expect(left[1]).toBe(0);
    expect(left[2]).toBeCloseTo(.26185,4);
    expect(left[3]).toBe(1);
    expect(right[0] + right[2]).toBeCloseTo(1);
  });
  it('centers the vertical crop on short landscape screens', () => {
    const crop = filmViewport(844,390,960,544);
    expect(crop[0]).toBe(0);
    expect(crop[2]).toBe(1);
    expect(crop[1] * 2 + crop[3]).toBeCloseTo(1);
  });
});
