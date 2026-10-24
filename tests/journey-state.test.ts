import { describe, expect, it } from 'vitest';
import { CHAPTER_COUNT, JOURNEY_DURATION, chapterForTime } from '../src/animation/journey-state';

describe('scroll journey position', () => {
  it('enters each chapter exactly at its boundary and keeps the final chapter at the end', () => {
    expect(CHAPTER_COUNT).toBe(6);
    expect(JOURNEY_DURATION).toBe(6);
    for (let chapter = 0; chapter < CHAPTER_COUNT; chapter++) {
      expect(chapterForTime(chapter)).toBe(chapter);
      expect(chapterForTime(chapter + 0.999)).toBe(chapter);
    }
    expect(chapterForTime(JOURNEY_DURATION)).toBe(5);
  });

  it('can jump and reverse without retaining an earlier chapter', () => {
    const times = [0, 4.2, 1.9, 5.7, 2, 1.999, 0];
    expect(times.map(chapterForTime)).toEqual([0, 4, 1, 5, 2, 1, 0]);
  });

  it('clamps overscroll and rejects nonfinite positions', () => {
    expect(chapterForTime(-200)).toBe(0);
    expect(chapterForTime(200)).toBe(5);
    for (const time of [NaN, Infinity, -Infinity]) expect(chapterForTime(time)).toBe(0);
  });
});
