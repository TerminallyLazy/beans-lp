import { packetWindow, type FilmIndex } from './frame-window';

type Request = { index?: FilmIndex; frame: number; radius: number };
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage: (value: unknown, transfer?: Transferable[]) => void;
};
let index: FilmIndex, desired: Request | null = null, working = false;
let decoder: VideoDecoder | undefined;
let images: { frame: number; image: VideoFrame }[] = [];
let failure: Error | undefined;
const BLOCK = 1024 * 1024;
const compressed = new Map<number, Uint8Array>();
const inflight = new Map<number, Promise<void>>();
let focusBlock = 0;
const protectedBlocks = new Set<number>();

function trimBlocks() {
  const candidates = [...compressed.keys()].filter(key => !protectedBlocks.has(key))
    .sort((a,b) => Math.abs(b-focusBlock)-Math.abs(a-focusBlock));
  for (const key of candidates.slice(0,Math.max(0,compressed.size-12))) compressed.delete(key);
}

/** Keep up to 12 MiB of encoded look-ahead. Decoded image windows can then be
 * refreshed without a network round trip at every few scroll frames. */
async function loadBlock(number: number) {
  if (compressed.has(number)) return;
  if (inflight.has(number)) return inflight.get(number);
  const task = (async () => {
    const first = number * BLOCK, last = Math.min(index.bytes - 1,first + BLOCK - 1);
    const response = await fetch(index.media, { headers: { Range: `bytes=${first}-${last}` } });
    // A host that ignores Range should use the HTML video fallback instead of
    // downloading an entire HD film for each small look-ahead block.
    if (response.status !== 206) { await response.body?.cancel(); throw new Error('Film range unavailable.'); }
    const payload = new Uint8Array(await response.arrayBuffer());
    const data = payload;
    if (data.length !== last-first+1) throw new Error('Incomplete film range.');
    compressed.set(number,data);
    trimBlocks();
  })();
  inflight.set(number,task);
  try { await task; } finally { inflight.delete(number); }
}

async function bytesFor(first: number, last: number) {
  const start = Math.floor(first/BLOCK), end = Math.floor(last/BLOCK);
  focusBlock = Math.floor((start+end)/2);
  protectedBlocks.clear();
  for (let key=start;key<=end;key++) protectedBlocks.add(key);
  await Promise.all(Array.from({length:end-start+1},(_,i)=>loadBlock(start+i)));
  const result = new Uint8Array(last-first+1);
  for (let key=start;key<=end;key++) {
    const data = compressed.get(key)!;
    const from = Math.max(first,key*BLOCK), to = Math.min(last+1,key*BLOCK+data.length);
    result.set(data.subarray(from-key*BLOCK,to-key*BLOCK),from-first);
  }
  // Warm both sides so wheel pulses and immediate reversals share encoded data.
  protectedBlocks.clear(); trimBlocks();
  for (const key of [start-1,end+1,end+2]) if (inflight.size<4 && key>=0 && key*BLOCK<index.bytes) void loadBlock(key).catch(()=>{});
  return result;
}

async function decodeWindow(request: Request) {
  const began = performance.now();
  const window = packetWindow(index.packets, request.frame, index.fps, request.radius);
  const payload = await bytesFor(window.first,window.last);
  images = []; failure = undefined;
  if (!decoder) {
    decoder = new VideoDecoder({
    output: picture => {
      const frame = Math.round(picture.timestamp / 1e6 * index.fps);
      // Transfer decoder surfaces directly. Converting every picture to an
      // ImageBitmap introduces a GPU readback/copy before it can be displayed.
      images.push({ frame, image: picture });
    },
    error: error => { failure = error; },
    });
    const config: VideoDecoderConfig = { codec: index.codec, codedWidth: index.width, codedHeight: index.height,
      description: Uint8Array.from(atob(index.description), c => c.charCodeAt(0)), optimizeForLatency: true };
    const support = await VideoDecoder.isConfigSupported(config);
    if (!support.supported) throw new Error('Film decoder unsupported.');
    decoder.configure(config);
  }
  for (let i = window.start; i < window.end; i++) {
    const [offset, bytes, timestamp, duration, key] = index.packets[i];
    decoder.decode(new EncodedVideoChunk({ type: key ? 'key' : 'delta', timestamp, duration,
      data: payload.subarray(offset - window.first, offset - window.first + bytes) }));
  }
  await decoder.flush();
  const ready = images;
  if (failure) { ready.forEach(item => item.image.close()); throw failure; }
  scope.postMessage({ type: 'frames', frames: ready, decodeMs: performance.now()-began }, ready.map(item => item.image));
}

scope.onmessage = event => {
  if (event.data.index) index = event.data.index;
  desired = event.data;
  if (working) return;
  working = true;
  void (async () => {
    try {
      while (desired) { const request = desired; desired = null; await decodeWindow(request); }
    } catch {
      if (decoder && decoder.state !== 'closed') decoder.close();
      for (const item of images) { try { item.image.close(); } catch { /* Already transferred. */ } }
      scope.postMessage({ type: 'unavailable' }); desired = null;
    } finally { working = false; }
  })();
};
