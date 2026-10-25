import { describe, expect, it } from 'vitest';
import { familyFraming, mobileFraming } from '../src/story/mobile-framing';

describe('mobile story camera', () => {
  it('keeps the final app readable before following the walking family', () => {
    expect(familyFraming(1424,1425,1589,.71)).toBe(.71);
    expect(familyFraming(1425,1425,1589,.71)).toBe(.5);
    expect(familyFraming(1589,1425,1589,.71)).toBeCloseTo(.6);
    const samples = [1424,1425,1500,1589,1500,1425,1424].map(frame=>familyFraming(frame,1425,1589,.71));
    expect(samples).toEqual([...samples].reverse());
  });
  it('preserves the phone framing across every chapter boundary', () => {
    for (let index = 1; index <= 4; index++) {
      const ending = mobileFraming({ index: index - 1, local: 12, held: 5, filmTime: 12 }, .61, 3.3);
      const beginning = mobileFraming({ index, local: 0, held: 0, filmTime: 12 }, .61, 3.3);
      expect(ending).toBeCloseTo(beginning, 8);
    }
  });
  it('does not jump when the phone display first becomes measurable', () => {
    expect(mobileFraming({ index: 0, local: 3.3, held: 0, filmTime: 3.3 }, .38, 3.3)).toBe(.55);
    expect(mobileFraming({ index: 0, local: 3.31, held: 0, filmTime: 3.31 }, .38, 3.3)).toBeCloseTo(.55, 3);
  });
  it('is reversible and returns to the phone for registration', () => {
    const times = [0, .5, 2, 4, 6, 4, 2, .5, 0];
    const path = times.map(local => mobileFraming({ index: 1, local, held: Math.max(0, local - 5), filmTime: local }, .53, 3.3));
    expect(path).toEqual([...path].reverse());
    expect(path[4]).toBe(.53);
  });
});
