export const CHAPTER_COUNT = 6;
export const JOURNEY_DURATION = 6;

export function chapterForTime(time: number): number {
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, Math.min(CHAPTER_COUNT - 1, Math.floor(time)));
}
