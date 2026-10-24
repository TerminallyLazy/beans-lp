import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const release = JSON.parse(await readFile(new URL('docs/story/encounters/release-media.json', root), 'utf8'));
if (!release.agentVisualReviewComplete) throw new Error('Story media has not completed visual review.');
for (const path of ['journey.mp4', 'journey-hd.mp4', 'journey.index.json', 'journey-hd.index.json', 'journey-track.json', 'journey-start.webp', 'journey-end.webp', 'journey-poster.webp', 'pets/cat.webp', 'pets/dog.webp', 'pets/horse.webp']) {
  if (!release.files[`public/assets/story/${path}`]) throw new Error(`Missing reviewed release asset: ${path}`);
}
for (const [path, expected] of Object.entries(release.files)) {
  if (!path.startsWith('public/assets/') || path.includes('..')) throw new Error('Unexpected release asset path.');
  const data = await readFile(new URL(path, root));
  const sha = createHash('sha256').update(data).digest('hex');
  if (sha !== expected.sha256 || data.byteLength !== expected.bytes) throw new Error(`Unreviewed media change: ${path}`);
}
const track = JSON.parse(await readFile(new URL('public/assets/story/journey-track.json', root), 'utf8'));
if (!Number.isFinite(track.fps) || track.fps <= 0 || track.fps !== release.fps || track.frame_count !== release.frameCount || track.frames.length !== release.frameCount) throw new Error('Film and screen-tracking clocks differ.');
if (track.faces?.length !== track.frame_count || track.faces.some(face => !['app','case'].includes(face))) throw new Error('Film handset orientation is incomplete.');
let offset = 0;
for (const [index, id] of ['phone', 'kitten', 'puppy', 'pony', 'family'].entries()) {
  const scene = track.scenes[index];
  if (!scene || scene.id !== id || scene.start_frame !== offset || !Number.isInteger(scene.frames) || scene.frames < 2) throw new Error('Incomplete story scene timing.');
  offset += scene.frames;
}
if (offset !== release.frameCount || track.scenes.length !== 5) throw new Error('Scene timing does not cover the film.');
for (const quad of track.frames) if (quad && (quad.length !== 4 || quad.some(p => p.length !== 2 || p.some(v => !Number.isFinite(v))))) throw new Error('Malformed phone plane.');
for (const name of ['journey','journey-hd']) {
  const index = JSON.parse(await readFile(new URL(`public/assets/story/${name}.index.json`, root),'utf8'));
  const film = release.files[`public/assets/story/${name}.mp4`];
  if (index.version !== 1 || index.media !== `/assets/story/${name}.mp4` || index.sha256 !== film.sha256 || index.bytes !== film.bytes || index.fps !== track.fps || index.packets.length !== track.frame_count || !index.codec.startsWith('avc1.') || !index.packets[0][4]) throw new Error(`Film index differs from reviewed media: ${name}`);
  const frames = new Set();
  for (const [offset,bytes,timestamp,duration,key] of index.packets) {
    const frame = Math.round(timestamp/1e6*index.fps);
    if (![offset,bytes,timestamp,duration,key].every(Number.isFinite) || offset < 0 || bytes < 1 || offset+bytes > index.bytes || duration <= 0 || ![0,1].includes(key) || frame < 0 || frame >= track.frame_count || frames.has(frame)) throw new Error(`Malformed indexed film packet: ${name}`);
    frames.add(frame);
  }
}
const nativeScreens = ['welcome','empty','add-cat','add-dog','add-horse','cat','dog','horse','cat-activity','dog-activity','horse-activity','family-menu'].map(name => `story/native/${name}.webp`);
for (const path of ['beans-logo-light.webp','beans-mark-light.png','fonts/manrope-variable.ttf','story/pets/cat.webp','story/pets/dog.webp','story/pets/horse.webp','story/apple-testflight.png','story/beans-public-beta-qr.svg',...nativeScreens]) {
  if ((await stat(new URL(`public/assets/${path}`, root))).size < 100) throw new Error(`Missing runtime artwork: ${path}`);
}
console.log(`Verified ${Object.keys(release.files).length} reviewed media assets and ${release.frameCount} tracking frames.`);
