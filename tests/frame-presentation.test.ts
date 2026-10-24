import { describe, expect, it } from 'vitest';
import { decodedPresentation, phoneFace } from '../src/story/frame-presentation';
import type { ScreenQuad } from '../src/story/screen-projection';

describe('decoded story presentation', () => {
  it('presents completed pictures while a continuous scroll is still requesting later chapters', () => {
    const completed = { filmTime: 4, screen: 'welcome' };
    const latest = { filmTime: 13, screen: 'add-cat' };
    expect(decodedPresentation(latest, completed, 4, 32)).toBe(completed);
    expect(decodedPresentation(completed, latest, 13, 32)).toBe(latest);
  });
  it('updates registration during a held frame without waiting for another decode', () => {
    const started = { filmTime: 4, screen: 'welcome' };
    const held = { filmTime: 4, screen: 'empty' };
    expect(decodedPresentation(held, started, 4, 32)).toBe(held);
  });
  it('does not paint unrelated or partly decoded timestamps with the current app UI', () => {
    expect(decodedPresentation({ filmTime: 4 }, { filmTime: 2 }, 1, 32)).toBeNull();
    expect(decodedPresentation({ filmTime: 4.01 }, { filmTime: 2 }, 4, 32)).not.toBeNull();
  });
});

describe('phone face direction', () => {
  const close: ScreenQuad = [[.6,.2],[.8,.2],[.8,.8],[.6,.8]];
  const distant: ScreenQuad = [[.6,.2],[.64,.2],[.64,.3],[.6,.3]];
  it('uses authored handset orientation after an editorial source cut', () => {
    const faces = ['app', 'case', 'case', 'app'] as const;
    expect(phoneFace(1,60,1,close,faces)).toBe('case');
    expect(phoneFace(2,60,1,close,faces)).toBe('case');
    expect(phoneFace(3,60,1,close,faces)).toBe('app');
  });
  it('keeps the app off the outward-facing handset throughout the family walk at either frame rate', () => {
    for (const fps of [16,32]) {
      const start = 356 / 16 * fps;
      expect(phoneFace(start + 60 / 16 * fps, fps, start, close)).toBe('case');
      expect(phoneFace(start + 150 / 16 * fps, fps, start, close)).toBe('app');
      expect(phoneFace(start + 128 / 16 * fps, fps, start, close)).toBe('app');
    }
  });
  it('keeps tiny distant phones quiet and preserves readable close app views', () => {
    expect(phoneFace(60,16,356,distant)).toBe('case');
    expect(phoneFace(75,16,356,close)).toBe('app');
  });
});
