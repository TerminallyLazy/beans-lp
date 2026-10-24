import type { AppScreen, Pet } from './story-clock';

export const PETS: { id: Pet; name: string; species: string; image: string }[] = [
  { id: 'cat', name: 'Cleo', species: 'Cat', image: '/assets/story/pets/cat.webp' },
  { id: 'dog', name: 'Willow', species: 'Dog', image: '/assets/story/pets/dog.webp' },
  { id: 'horse', name: 'Bert', species: 'Horse', image: '/assets/story/pets/horse.webp' },
];

const NATIVE_SCREENS: Record<AppScreen, string> = {
  welcome: 'welcome', empty: 'empty',
  'add-cat': 'add-cat', 'add-dog': 'add-dog', 'add-horse': 'add-horse',
  cat: 'cat', dog: 'dog', horse: 'horse',
  'cat-activity': 'cat-activity', 'dog-activity': 'dog-activity', 'horse-activity': 'horse-activity',
  family: 'family-menu',
};

/** Saved pixels from an isolated build of the native app, using its synthetic
 * onboarding and pet fixtures. No account, provider connection or real records.
 * See docs/story/encounters/native-captures.json for source and capture receipts.
 */
export async function createNativeScreenArt() {
  const entries = await Promise.all(Object.entries(NATIVE_SCREENS).map(async ([key, filename]) => {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Beans native screen unavailable: ${key}`));
      image.src = `/assets/story/native/${filename}.webp`;
    });
    return [key, image] as const;
  }));
  return Object.fromEntries(entries) as Record<AppScreen, HTMLImageElement>;
}
