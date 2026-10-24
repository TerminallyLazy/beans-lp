"""Build review candidates; never replace published media or approve a review.

Requires FFmpeg and opencv-contrib-python-headless==4.12.0.88 in an isolated
Python environment. Source performances remain the reviewed Apache-2.0 takes.
"""
import argparse
import hashlib
import json
import subprocess
import urllib.request
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parents[1]
MODEL_REVISION = '6a4812c4ef1c4f5947d79beafa32a05a6eb4a94d'
MODEL_SHA = '366b33f0084c7b3f2bf6724f0a2c77bca94fcec9d7b6d72389d330073b380d5c'
MODEL_BASE = f'https://raw.githubusercontent.com/Saafke/FSRCNN_Tensorflow/{MODEL_REVISION}'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True, help='Candidate output directory outside public/')
    work = parser.parse_args().work.resolve()
    assert not work.is_relative_to(ROOT / 'public'), 'Candidates require review before publishing.'
    work.mkdir(parents=True, exist_ok=True)
    videos, frames, scenes = [], [], []
    for name in ['phone', 'kitten', 'puppy', 'pony', 'family']:
        folder = ROOT / 'docs/assets/originals/encounters/kaggle/wan-approved/shots' / name
        receipt = json.loads((folder / 'receipt.json').read_text())
        review = json.loads((folder / 'review.json').read_text())
        assert receipt['model_license'] == 'Apache-2.0' and receipt['tool'] == 'WanGP offline production'
        assert Path(receipt['video']).name == receipt['video']
        video = folder / 'outputs' / receipt['video']
        assert sha(video) == receipt['video_sha256'] == review['video_sha256']
        assert all(review[k] is True for k in ['approved', 'anatomy_checked', 'motion_checked'])
        track = json.loads((ROOT / f'docs/story/encounters/kaggle/wan-approved/tracks/{name}-screen-track.json').read_text())
        assert track['source_sha256'] == sha(video) and track['review_required'] is False
        assert (track['width'], track['height'], track['fps']) == (960, 544, 16)
        scenes.append({'id': name, 'start_frame': len(frames) * 2, 'frames': len(track['frames']) * 2, 'video_sha256': sha(video)})
        frames.extend(track['frames']); videos.append(video)
    doubled = []
    for i, plane in enumerate(frames):
        following = frames[min(i + 1, len(frames) - 1)]
        doubled.append(plane)
        doubled.append([[(a[0]+b[0])/2, (a[1]+b[1])/2] for a,b in zip(plane, following)] if plane and following else None)
    (work / 'journey-track.json').write_text(json.dumps({'width':960,'height':544,'fps':32,'frame_count':len(doubled),'scenes':scenes,'frames':doubled}, separators=(',',':')))
    concat = work / 'concat-inputs.txt'
    concat.write_text(''.join("file '" + str(p).replace("'", "'\\''") + "'\n" for p in videos))
    intermediate = work / 'interpolated.mp4'
    # Pad before MCI so its look-ahead can present the exact final source pose.
    interpolation = f'tpad=stop_mode=clone:stop_duration=0.25,minterpolate=fps=32:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=fdiff:scd_threshold=10,trim=end_frame={len(doubled)},setpts=PTS-STARTPTS'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',str(concat),'-vf',interpolation,'-frames:v',str(len(doubled)),'-an','-c:v','libx264','-preset','fast','-crf','12','-pix_fmt','yuv420p',str(intermediate)],check=True)
    model = work / 'FSRCNN_x2.pb'
    if not model.exists(): urllib.request.urlretrieve(f'{MODEL_BASE}/models/FSRCNN_x2.pb', model)
    assert sha(model) == MODEL_SHA, 'Unexpected super-resolution weights.'
    urllib.request.urlretrieve(f'{MODEL_BASE}/LICENSE',work / 'FSRCNN-LICENSE.txt')
    cv2.setNumThreads(4)
    sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(str(model)); sr.setModel('fsrcnn',2)
    command = ['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','bgr24','-s','1920x1088','-r','32','-i','pipe:0','-filter_complex','[0:v]split=2[hd][small];[small]scale=960:544:flags=lanczos[mobile]']
    for stream, filename in [('hd','journey-hd.mp4'),('mobile','journey.mp4')]:
        command.extend(['-map',f'[{stream}]','-an','-c:v','libx264','-threads','4','-preset','slow','-crf','20','-pix_fmt','yuv420p','-g','4','-keyint_min','4','-sc_threshold','0','-movflags','+faststart',str(work / filename)])
    process = subprocess.Popen(command,stdin=subprocess.PIPE)
    capture = cv2.VideoCapture(str(intermediate)); count = 0
    try:
        while True:
            ok, picture = capture.read()
            if not ok: break
            process.stdin.write(sr.upsample(picture).tobytes()); count += 1
            if count % 100 == 0: print(f'Upscaled {count}/{len(doubled)} frames',flush=True)
    finally:
        capture.release(); process.stdin.close()
    assert process.wait() == 0 and count == len(doubled), 'Incomplete candidate encoding.'
    for name, frame in [('journey-start.webp',0),('journey-end.webp',count-1)]:
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(work/'journey-hd.mp4'),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-c:v','libwebp','-quality','94',str(work/name)],check=True)
    (work / 'candidate.json').write_text(json.dumps({'reviewRequired':True,'modelRevision':MODEL_REVISION,'modelSHA256':MODEL_SHA,'fps':32,'frames':count,'files':{p.name:sha(p) for p in work.glob('journey*') if p.is_file()}},indent=2)+'\n')
    print('Candidates prepared. Review anatomy, interpolation, phone compositing, and browser behavior before release.')


if __name__ == '__main__': main()
