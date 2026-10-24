import { farthestFrames, type FilmIndex } from './frame-window';

/** A bounded, reversible frame cache. Seeking and decoding stay off the UI thread. */
export class CachedFilm {
  private readonly worker = new Worker(new URL('./film-decoder.worker.ts', import.meta.url), { type: 'module' });
  private readonly frames = new Map<number, VideoFrame>();
  private frame = 0;
  private pending = false;
  private requested = -1;
  private disposed = false;
  readonly capacity: number;
  decodeMs = 0;
  onFrames: (() => void) | undefined;
  onUnavailable: (() => void) | undefined;
  private readonly ready: Promise<void>;

  constructor(readonly index: FilmIndex) {
    this.capacity = Math.max(4, Math.min(32, Math.floor(96 * 1024 * 1024 / (index.width * index.height * 4))));
    this.ready = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Frame decoder timed out.')), 12000);
      this.worker.onerror = () => { clearTimeout(timeout); reject(new Error('Frame worker unavailable.')); this.onUnavailable?.(); };
      this.worker.onmessage = (event: MessageEvent<{ type: string; decodeMs?: number; frames?: { frame: number; image: VideoFrame }[] }>) => {
        this.pending = false;
        this.decodeMs = event.data.decodeMs || 0;
        if (event.data.type === 'unavailable') { clearTimeout(timeout); reject(new Error('Frame decoder unavailable.')); this.onUnavailable?.(); return; }
        for (const item of event.data.frames || []) {
          if (this.disposed) { item.image.close(); continue; }
          if (this.frames.has(item.frame)) item.image.close();
          else this.frames.set(item.frame, item.image);
        }
        for (const key of farthestFrames([...this.frames.keys()], this.frame, this.capacity)) {
          this.frames.get(key)!.close(); this.frames.delete(key);
        }
        if (this.frames.has(0)) { clearTimeout(timeout); resolve(); }
        this.onFrames?.(); this.prefetch();
      };
    });
    this.pending = true; this.requested = 0;
    this.worker.postMessage({ index, frame: 0, radius: 3 });
  }

  static async open(name: string, signal: AbortSignal) {
    if (typeof VideoDecoder === 'undefined' || typeof VideoFrame === 'undefined') throw new Error('Frame decoding unsupported.');
    const response = await fetch(`/assets/story/${name}.index.json`, { signal });
    if (!response.ok) throw new Error('Film index unavailable.');
    const index = await response.json() as FilmIndex;
    if (index.version !== 1 || !index.packets.length || index.media !== `/assets/story/${name}.mp4`) throw new Error('Invalid film index.');
    const film = new CachedFilm(index);
    const abort = () => film.dispose(); signal.addEventListener('abort', abort, { once: true });
    try { await film.ready; if (signal.aborted) throw new Error('Film load aborted.'); return film; }
    catch (error) { film.dispose(); throw error; }
    finally { signal.removeEventListener('abort', abort); }
  }

  get(frame: number) {
    this.frame = frame; const image = this.frames.get(frame);
    this.prefetch(); return image;
  }
  nearest(frame: number) {
    this.frame = frame; this.prefetch();
    let closest = -1;
    for (const key of this.frames.keys()) if (closest < 0 || Math.abs(key-frame) < Math.abs(closest-frame)) closest = key;
    return closest < 0 ? undefined : { frame:closest, image:this.frames.get(closest)! };
  }
  private prefetch() {
    if (this.pending || this.disposed) return;
    const radius = Math.max(2, Math.floor(this.capacity / 3));
    const missing = !this.frames.has(this.frame) || !this.frames.has(Math.max(0, this.frame - 2)) ||
      !this.frames.has(Math.min(this.index.packets.length - 1, this.frame + 2));
    if (missing && this.requested !== this.frame) {
      this.pending = true; this.requested = this.frame;
      this.worker.postMessage({ frame: this.frame, radius });
    }
  }
  get size() { return this.frames.size; }
  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.worker.terminate();
    this.frames.forEach(frame => frame.close()); this.frames.clear();
  }
}
