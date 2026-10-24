const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

type FramingState = { index: number; local: number; held: number; filmTime: number };

/** Keep chapter boundaries on the held phone, then follow the arriving animal.
 * The return to the display is tied to registration, so reversing the scroll
 * traces the same camera path without a stored or accumulated offset.
 */
export function mobileFraming(state: FramingState, phoneX: number, firstPhoneTime: number) {
  if (state.index === 0) return .55 + (phoneX - .55) * ease((state.filmTime - firstPhoneTime) / .7);
  // Match the delivered performances: the kitten reaches the path early,
  // while the puppy approaches from behind it near the middle of the frame.
  const actor = state.index === 1 ? .06 + .15 * ease(state.local) + .05 * ease((state.local - 2.5) / 2)
    : state.index === 2 ? .34 + .03 * ease(state.local / 2)
    : state.index === 3 ? .45 + .08 * ease((state.local - 1.5) / 2)
    : .2 + .4 * ease(state.local / 4);
  const arrival = phoneX + (actor - phoneX) * ease(state.local / 1.1);
  return arrival + (phoneX - arrival) * ease(state.held / .85);
}
