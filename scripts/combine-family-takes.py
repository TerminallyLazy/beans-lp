"""Remux two reviewed family performances, proving every decoded frame is retained."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

import cv2


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def decoded_hashes(path):
    capture = cv2.VideoCapture(str(path))
    assert capture.isOpened()
    hashes = []
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        hashes.append(hashlib.sha256(frame.tobytes()).hexdigest())
    capture.release()
    return hashes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path, help='Private shots directory containing family-walk and family-close.')
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    private = (root / 'docs/assets/originals/encounters/kaggle').resolve()
    assert args.source.resolve().is_relative_to(private) and args.output.resolve().is_relative_to(private)
    assert not args.output.exists(), 'Preserve any earlier combined take'
    sources, receipts, reviews, frame_hashes = [], [], [], []
    for name in ['family-walk', 'family-close']:
        folder = args.source / name
        receipt = json.loads((folder / 'receipt.json').read_text())
        review = json.loads((folder / 'review.json').read_text())
        assert receipt['model_license'] == 'Apache-2.0' and receipt['scene']['id'] == name
        video = folder / 'outputs' / receipt['video']
        assert sha(video) == receipt['video_sha256'] == review['video_sha256']
        assert all(review.get(key) is True for key in ['approved', 'anatomy_checked', 'motion_checked'])
        sources.append(video.resolve()); receipts.append(receipt); reviews.append(review)
        frame_hashes.extend(decoded_hashes(video))
    args.output.mkdir(parents=True)
    (args.output / 'outputs').mkdir()
    inputs = args.output / 'concat-inputs.txt'
    inputs.write_text(''.join("file '" + str(path).replace("'", "'\\''") + "'\n" for path in sources))
    video = args.output / 'outputs/beans-family-wan-v5.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(inputs),
                    '-map', '0:v:0', '-an', '-c:v', 'copy', '-movflags', '+faststart', str(video)], check=True)
    assert decoded_hashes(video) == frame_hashes, 'Combined film changed, dropped or duplicated a decoded frame'
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)], text=True))
    stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    assert int(stream['nb_frames']) == len(frame_hashes)
    receipt = dict(status='generated-awaiting-review', scene=dict(id='family', subscenes=[r['scene'] for r in receipts]),
                   tool='WanGP offline production', model_license='Apache-2.0', video=video.name,
                   video_sha256=sha(video), ffprobe=probe, parents=receipts,
                   postprocess='Lossless MP4 remux; every decoded RGB frame hash matches the reviewed source sequence.')
    review = dict(approved=True, anatomy_checked=True, motion_checked=True, video_sha256=sha(video),
                  reviewer='Codex visual review; not owner visual approval', parent_reviews=reviews,
                  scope='Every decoded source frame reviewed; remux frame identity proved. Seam review recorded in family-close review.')
    (args.output / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    (args.output / 'review.json').write_text(json.dumps(review, indent=2) + '\n')
    (args.output / 'settings.json').write_text(json.dumps(dict(parents=[r['scene'] for r in receipts]), indent=2) + '\n')
    for name, vf in [('first-frame.png', 'select=eq(n\\,0)'), ('last-frame.png', f'select=eq(n\\,{len(frame_hashes)-1})'),
                     ('contact-sheet.png', 'fps=1,scale=480:-1,tile=4x3')]:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video), '-vf', vf, '-frames:v', '1', str(args.output / name)], check=True)
    print('Combined', len(frame_hashes), 'reviewed frames:', sha(video))


if __name__ == '__main__':
    main()
