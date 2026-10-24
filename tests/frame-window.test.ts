import { describe, expect, it } from 'vitest';
import { farthestFrames, packetWindow, type FilmPacket } from '../src/story/frame-window';
import { settlingTime } from '../src/story/story-clock';

describe('random access film windows', () => {
  // Decode order deliberately differs from presentation order (B frames).
  const packets: FilmPacket[] = [0,3,1,2,4,7,5,6,8,11,9,10].map((frame, i) => [100 + i * 20, 20, frame * 31250, 31250, frame % 4 === 0 ? 1 : 0]);
  it('starts at a keyframe and includes a complete GOP around a reverse target', () => {
    expect(packetWindow(packets, 6, 32, 1)).toEqual({ start:4, end:8, first:180, last:259 });
    expect(packetWindow(packets, 0, 32, 2)).toEqual({ start:0, end:4, first:100, last:179 });
    expect(packetWindow(packets, 11, 32, 2).end).toBe(12);
  });
  it('bounds memory while retaining the nearest frames on either side', () => {
    expect(new Set(farthestFrames([0,1,2,3,4,5,6],3,3))).toEqual(new Set([0,1,5,6]));
  });
});

describe('cinematic settling timing', () => {
  it('retains exact duration, monotonic motion and continuous speed at both joins', () => {
    for (const hold of [2,3,5]) {
      const span = 2 + hold, step = .00001;
      expect(settlingTime(0,2,hold)).toBe(0);
      expect(settlingTime(span,2,hold)).toBe(2);
      expect(settlingTime(step,2,hold) / step).toBeCloseTo(1,4);
      expect((2 - settlingTime(span-step,2,hold)) / step).toBeCloseTo(1,4);
      for (let t=0;t<span;t+=.03) expect(settlingTime(t+.03,2,hold)).toBeGreaterThan(settlingTime(t,2,hold));
    }
  });
});
