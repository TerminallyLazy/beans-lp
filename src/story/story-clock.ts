export const FPS = 24;
export const STORY_SHOTS = [
  { id: 'phone', seconds: 8, hold: 2 },
  { id: 'kitten', seconds: 8, hold: 3 },
  { id: 'puppy', seconds: 8, hold: 3 },
  { id: 'pony', seconds: 8, hold: 3 },
  { id: 'family', seconds: 10, hold: 5 },
] as const;
export type Pet = 'cat' | 'dog' | 'horse';
export type AppScreen = 'welcome' | 'empty' | 'add-cat' | 'add-dog' | 'add-horse' | 'cat' | 'dog' | 'horse' | 'cat-activity' | 'dog-activity' | 'horse-activity' | 'family';
export const STORY_DURATION = STORY_SHOTS.reduce((sum, shot) => sum + shot.seconds + shot.hold, 0);
type StoryShot = { id: typeof STORY_SHOTS[number]['id']; seconds: number; hold: number; holdEnd?: number };
type FilmTiming = { fps: number; frame_count: number; scenes: { id: string; start_frame: number; frames: number; hold_end_frame?: number }[] };

/** Retain velocity at both ends of a settling beat. Hard linear retiming made
 * every registration feel like a sudden brake followed by an acceleration. */
export function settlingTime(time: number, performed: number, hold: number) {
  const span = performed + hold, t = Math.max(0, Math.min(span, time));
  if (hold <= 0) return t;
  const ramp = Math.min(.7, performed * .35);
  const slow = (performed - ramp) / (span - ramp);
  const first = (u: number) => slow * u + (1 - slow) * (u / 2 + ramp / (2 * Math.PI) * Math.sin(Math.PI * u / ramp));
  if (t < ramp) return first(t);
  if (t <= span - ramp) return first(ramp) + slow * (t - ramp);
  // Symmetry gives the final camera approach the same continuous speed ramp.
  return performed - first(span - t);
}

/** Derive the story from the delivered film rather than assuming a model's frame rate. */
export function createStoryClock(film: FilmTiming) {
  if (!Number.isFinite(film.fps) || film.fps <= 0 || film.scenes.length !== STORY_SHOTS.length) throw new Error('Invalid film timing.');
  let nextFrame = 0, nextStoryTime = 0;
  const labels: Record<string, number> = {};
  const shots: StoryShot[] = film.scenes.map((scene, index) => {
    const intended = STORY_SHOTS[index];
    if (scene.id !== intended.id || scene.start_frame !== nextFrame || !Number.isInteger(scene.frames) || scene.frames < 2) throw new Error('Story scenes are incomplete or out of order.');
    nextFrame += scene.frames;
    const shot: StoryShot = { id: intended.id, seconds: scene.frames / film.fps, hold: intended.hold };
    if (scene.hold_end_frame !== undefined) {
      if (!Number.isInteger(scene.hold_end_frame) || scene.hold_end_frame <= scene.start_frame || scene.hold_end_frame >= nextFrame) throw new Error('Invalid authored settling beat.');
      shot.holdEnd = (scene.hold_end_frame - scene.start_frame) / film.fps;
    }
    labels[scene.id] = nextStoryTime; nextStoryTime += shot.seconds + shot.hold;
    return shot;
  });
  if (nextFrame !== film.frame_count) throw new Error('Story scenes do not cover the delivered film.');
  const sample = (time: number) => frameAt(time, shots, film.fps, nextStoryTime);
  return { duration: nextStoryTime, labels, frame: sample,
    forFilmFrame: (frame: number, hint: ReturnType<typeof frameAt>) => {
      if (Math.round(hint.filmTime * film.fps) === frame) return hint;
      let low = 0, high = nextStoryTime;
      for (let i=0;i<32;i++) {
        const middle = (low+high)/2;
        if (Math.round(sample(middle).filmTime * film.fps) < frame) low = middle; else high = middle;
      }
      return sample(high);
    },
  };
}

/** A reversible clock: registration has no hidden state and never changes a real account. */
export function storyFrame(input: number) {
  return frameAt(input, STORY_SHOTS, FPS, STORY_DURATION);
}

function frameAt(input: number, shots: readonly StoryShot[], fps: number, duration: number) {
  const time = Number.isFinite(input) ? Math.max(0, Math.min(duration, input)) : 0;
  let storyStart = 0, filmStart = 0;
  for (const [index, shot] of shots.entries()) {
    const end = storyStart + shot.seconds + shot.hold;
    if (time < end || index === shots.length - 1) {
      const local = time - storyStart, holdEnd = shot.holdEnd ?? shot.seconds;
      const held = Math.min(shot.hold, Math.max(0, local - holdEnd));
      let screen: AppScreen = index === 0 ? 'welcome' : index === 1 ? 'empty' : index === 2 ? 'cat' : index === 3 ? 'dog' : 'horse';
      if (index === 0 && held > .8) screen = 'empty';
      if (index > 0 && index < 4 && held > .15) {
        const pet = (['cat', 'dog', 'horse'] as const)[index - 1];
        screen = held < 1.8 ? `add-${pet}` : pet;
      }
      if (index === 4) screen = held <= 0 ? 'cat-activity' : held < 1.1 ? 'family' : (['cat-activity', 'dog-activity', 'horse-activity'] as const)[Math.min(2, Math.floor((held - 1.1) / 1.3))];
      // Give registration room by slowing the performed settling beat, retaining breathing,
      // ears and butterfly motion instead of freezing a character into a cutout.
      const settlingLength = shot.holdEnd === undefined ? Math.min(2, shot.seconds / 2) : Math.min(2, holdEnd);
      const settlingStart = holdEnd - settlingLength;
      const filmLocal = local < settlingStart ? local : local <= holdEnd + shot.hold
        ? settlingStart + settlingTime(local - settlingStart, settlingLength, shot.hold)
        : local - shot.hold;
      return { time, shot: shot.id, index, local, held, screen,
        filmTime: filmStart + Math.min(shot.seconds - 1 / fps, Math.max(0, filmLocal)),
        petCount: Math.min(3, Math.max(0, index - 1) + (index > 0 && index < 4 && held >= 1.8 ? 1 : 0)),
        progress: time / duration,
      };
    }
    storyStart = end; filmStart += shot.seconds;
  }
  throw new Error('Story clock has no scenes.');
}
