/** GOP packet metadata is generated offline, so no MP4 parser runs in the page. */
export type FilmPacket = readonly [offset: number, bytes: number, timestamp: number, duration: number, key: number];
export type FilmIndex = {
  version: number; media: string; bytes: number; sha256: string; codec: string; width: number; height: number;
  description: string; fps: number; packets: FilmPacket[];
};

export function packetWindow(packets: readonly FilmPacket[], frame: number, fps: number, radius: number) {
  const timestamp = Math.max(0, frame) / fps * 1e6;
  let start = 0;
  for (let i = 0; i < packets.length; i++) {
    if (packets[i][4] && packets[i][2] <= timestamp - radius / fps * 1e6) start = i;
  }
  let end = packets.length;
  for (let i = start + 1; i < packets.length; i++) {
    if (packets[i][4] && packets[i][2] > timestamp + radius / fps * 1e6) { end = i; break; }
  }
  return { start, end, first: packets[start][0], last: packets[end - 1][0] + packets[end - 1][1] - 1 };
}

/** Evict the farthest images, retaining both sides of the displayed frame. */
export function farthestFrames(keys: number[], frame: number, capacity: number) {
  return keys.sort((a, b) => Math.abs(b - frame) - Math.abs(a - frame)).slice(0, Math.max(0, keys.length - capacity));
}
