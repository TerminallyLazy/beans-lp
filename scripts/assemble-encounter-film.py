"""Package only hash-verified, visually reviewed Wan performances for the web story."""
import hashlib
import json
import subprocess
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINALS = ROOT / 'docs/assets/originals/encounters/kaggle/wan-approved/shots'
TRACKS = ROOT / 'docs/story/encounters/kaggle/wan-approved/tracks'
DEST = ROOT / 'public/assets/story'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    paths, frames, scenes, offset = [], [], [], 0
    dimensions = None
    for name in ['phone', 'kitten', 'puppy', 'pony', 'family']:
        source = ORIGINALS / name
        receipt = json.loads((source / 'receipt.json').read_text())
        review = json.loads((source / 'review.json').read_text())
        assert receipt.get('model_license') == 'Apache-2.0' and receipt.get('tool') == 'WanGP offline production', 'Excluded production source'
        assert Path(receipt['video']).name == receipt['video'], 'Unexpected video path'
        video = source / 'outputs' / receipt['video']
        digest = sha(video)
        assert digest == receipt['video_sha256'] == review['video_sha256'], f'{name}: source or review hash mismatch'
        assert review['approved'] is True and review['anatomy_checked'] is True and review['motion_checked'] is True, f'{name}: incomplete visual review'
        track = json.loads((TRACKS / f'{name}-screen-track.json').read_text())
        assert track.get('review_required') is False, f'{name}: phone geometry still requires review'
        assert track.get('source_sha256') == digest, f'{name}: phone tracking belongs to another take'
        probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(video)], text=True))
        stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        fps, count = float(Fraction(stream['r_frame_rate'])), int(stream['nb_frames'])
        current = (int(stream['width']), int(stream['height']), fps)
        if dimensions is None:
            dimensions = current
        assert current == dimensions == (track['width'], track['height'], track['fps']), f'{name}: inconsistent media geometry or clock'
        assert count == track['frame_count'] == len(track['frames']), f'{name}: incomplete phone tracking'
        assert track['frames'][-1], f'{name}: final phone has no reviewed geometry'
        paths.append(video)
        frames.extend(track['frames'])
        scenes.append(dict(id=name, start_frame=offset, frames=count, video_sha256=digest))
        offset += count
    width, height, fps = dimensions
    DEST.mkdir(parents=True, exist_ok=True)
    list_file = TRACKS / 'concat-inputs.txt'
    list_file.write_text(''.join("file '" + str(path).replace("'", "'\\''") + "'\n" for path in paths))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(list_file),
                    '-map', '0:v:0', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p',
                    '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-movflags', '+faststart', str(DEST / 'journey.mp4')], check=True)
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(DEST/'journey.mp4')], text=True))
    assert int(probe['streams'][0]['nb_frames']) == len(frames)
    for filename, selection in [('journey-start.webp', 'select=eq(n\\,0)'), ('journey-end.webp', f'select=eq(n\\,{offset-1})')]:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(DEST/'journey.mp4'), '-vf', selection,
                        '-frames:v', '1', '-c:v', 'libwebp', '-quality', '92', str(DEST/filename)], check=True)
    (DEST/'journey-track.json').write_text(json.dumps(dict(width=width, height=height, fps=fps, frame_count=len(frames), scenes=scenes, frames=frames), separators=(',', ':')))
    # Final browser acceptance, a composited fallback and release hashes are recorded separately.
    print(f'Packaged {len(frames)} reviewed frames at {fps:g} fps across {len(paths)} scenes. Browser acceptance remains required.')


if __name__ == '__main__':
    main()
