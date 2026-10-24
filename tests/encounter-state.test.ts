import { describe, expect, it } from 'vitest';
import { encounterState, PROOF_BEATS } from '../src/story/encounter-state';

describe('Human–phone–kitten proof clock', () => {
  it('makes registration deterministic on reverse and arbitrary seeks', () => {
    const times = [0, 18, 15, 22, 7, 17, 16.999, 0];
    expect(times.map(t => encounterState(t).petCount)).toEqual([0, 1, 0, 1, 0, 1, 0, 0]);
    expect(encounterState(15).screen).toBe('add-kitten');
    expect(encounterState(7).screen).toBe('welcome');
    expect(encounterState(8).screen).toBe('empty');
  });
  it('holds root position and walk phase through draw, roll, reaction and registration', () => {
    const stopped = encounterState(PROOF_BEATS.stop);
    for (const t of [5, 7, 9, 12, 14, 17, 19]) {
      const frame = encounterState(t);
      expect(frame.root.distanceTo(stopped.root)).toBeLessThan(1e-10);
      expect(frame.walkCycles).toBe(stopped.walkCycles);
      expect(frame.walking).toBe(false);
    }
    expect(encounterState(5).holding).toBe(0);
    expect(encounterState(7).holding).toBe(1);
  });
  it('keeps visible cast and action phase consistent with the same story time', () => {
    expect(encounterState(8.999).kittenVisible).toBe(false);
    expect(encounterState(9).kittenVisible).toBe(true);
    expect(encounterState(9).kittenRoll).toBe(0);
    expect(encounterState(11).kittenRoll).toBe(1);
    expect(encounterState(22).distance).toBeGreaterThan(encounterState(19).distance);
    for (const t of [-100, NaN, Infinity]) expect(encounterState(t).time).toBe(0);
    expect(encounterState(100).time).toBe(22);
  });
});
