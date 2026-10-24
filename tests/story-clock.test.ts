import { describe, expect, it } from 'vitest';
import { createStoryClock, storyFrame, STORY_DURATION } from '../src/story/story-clock';

describe('complete encounter clock', () => {
  it('reverses registrations without retaining pets from later scenes', () => {
    expect([0, 19.9, 30.9, 41.9, 57, 14, 0].map(t => storyFrame(t).petCount)).toEqual([0, 1, 2, 3, 3, 0, 0]);
    expect(storyFrame(18.5).screen).toBe('add-cat');
    expect(storyFrame(29.5).screen).toBe('add-dog');
    expect(storyFrame(40.5).screen).toBe('add-horse');
  });
  it('retimes real settling movement while the app registration progresses', () => {
    expect(storyFrame(18.5).filmTime).toBeLessThan(storyFrame(20).filmTime);
    expect(storyFrame(20).filmTime - storyFrame(18.5).filmTime).toBeGreaterThan(.3);
    expect(storyFrame(20).filmTime - storyFrame(18.5).filmTime).toBeLessThan(.6);
    expect(storyFrame(10).filmTime).toBe(8);
    expect(storyFrame(STORY_DURATION).filmTime).toBeCloseTo(42 - 1 / 24);
  });
  it('bounds malformed input and exposes the complete family at the end', () => {
    for (const t of [-1, NaN, Infinity]) expect(storyFrame(t).time).toBe(0);
    expect(storyFrame(1000).time).toBe(STORY_DURATION);
    expect(storyFrame(STORY_DURATION).screen).toBe('horse-activity');
  });
  it('uses the actual delivered frame rate and scene lengths across forward and reverse seeks', () => {
    const ids = ['phone', 'kitten', 'puppy', 'pony', 'family'];
    let offset = 0;
    const scenes = ids.map(id => {
      const frames = id === 'family' ? 97 : 81;
      const scene = { id, start_frame: offset, frames }; offset += frames; return scene;
    });
    const clock = createStoryClock({ fps: 16, frame_count: offset, scenes });
    expect(clock.labels.kitten).toBe(81 / 16 + 2);
    expect(clock.frame(clock.labels.puppy).filmTime).toBe(162 / 16);
    expect(clock.frame(clock.duration).filmTime).toBe((offset - 1) / 16);
    expect(clock.frame(clock.labels.kitten + 81 / 16 + 2).petCount).toBe(1);
    expect(clock.frame(0).petCount).toBe(0);
    expect(() => createStoryClock({ fps: 16, frame_count: offset + 1, scenes })).toThrow();
    expect(() => createStoryClock({ fps: 16, frame_count: offset, scenes: [...scenes].reverse() })).toThrow();
  });
});
