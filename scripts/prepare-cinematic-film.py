"""Prepare a reviewed-source FlashVSR/RIFE candidate outside public/.

Requires FFmpeg and the official rife-ncnn-vulkan 20221029 package (rife-v4.6).
The command prepares candidates only; visual review and release approval remain
separate. Models and full-size audit frames stay outside the website bundle.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(command):
    subprocess.run(command, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--rife-bin', type=Path, required=True)
    parser.add_argument('--rife-model', type=Path, required=True)
    parser.add_argument('--reuse-intermediates', action='store_true', help='Reuse locally reviewed frames after checking their source receipt.')
    args = parser.parse_args()
    work = args.work.resolve()
    assert not work.is_relative_to(ROOT / 'public'), 'Review candidates before publishing.'
    work.mkdir(parents=True, exist_ok=True)
    info = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(args.source)]))['streams'][0]
    assert (info['width'],info['height'],info['r_frame_rate'],int(info['nb_frames'])) == (1920,1088,'16/1',518)
    count, fps = math.ceil(518 / 16 * 60), 60
    old = json.loads((ROOT / 'public/assets/story/journey-track.json').read_text())
    # Both reviewed tracking deliveries contain the exact 16 fps source planes.
    # Use the retained original tracking for a repeat build after release.
    if old['fps'] != 32:
        original, scenes = [], []
        for name in ['phone','kitten','puppy','pony','family']:
            item = json.loads((ROOT / f'docs/story/encounters/kaggle/wan-approved/tracks/{name}-screen-track.json').read_text())
            scenes.append(dict(id=name,start_frame=len(original),frames=len(item['frames'])))
            original.extend(item['frames'])
    else:
        original = old['frames'][::2]
        scenes = [dict(scene,start_frame=scene['start_frame']//2,frames=scene['frames']//2) for scene in old['scenes']]
    assert len(original) == 518
    track = []
    for frame in range(count):
        # RIFE's published directory runner uses source_count/output_count,
        # clamping at the final source pose. Pair measured planes with that
        # exact sampling position rather than rounding an assumed frame rate.
        position = min(517, frame * 518 / count)
        index = math.floor(position)
        left, right = original[index], original[min(517,index+1)]
        fraction = position - index
        track.append([[(1-fraction)*a[0]+fraction*b[0],(1-fraction)*a[1]+fraction*b[1]] for a,b in zip(left,right)] if left and right else left if fraction == 0 else None)
    boundaries = [math.ceil(scene['start_frame']*count/518) for scene in scenes] + [count]
    scenes = [dict(scene,start_frame=boundaries[i],frames=boundaries[i+1]-boundaries[i]) for i,scene in enumerate(scenes)]
    (work/'journey-track.json').write_text(json.dumps(dict(width=960,height=544,fps=fps,frame_count=count,frames=track,scenes=scenes),separators=(',',':')))
    source_frames, output_frames = work/'source-frames', work/'intermediate-frames'
    source_frames.mkdir(exist_ok=True); output_frames.mkdir(exist_ok=True)
    source_sha = hashlib.sha256(args.source.read_bytes()).hexdigest()
    receipt = work/'intermediate-source.json'
    if args.reuse_intermediates:
        assert json.loads(receipt.read_text())['sourceSHA256'] == source_sha
    else:
        run(['ffmpeg','-y','-loglevel','error','-i',str(args.source),str(source_frames/'%08d.png')])
        assert len(list(source_frames.glob('*.png'))) == 518
        run([str(args.rife_bin),'-m',str(args.rife_model),'-i',str(source_frames),'-o',str(output_frames),'-n',str(count),'-f','%08d.png','-j','1:2:2'])
        receipt.write_text(json.dumps(dict(sourceSHA256=source_sha,frames=count))+'\n')
    assert len(list(output_frames.glob('*.png'))) == count
    command = ['ffmpeg','-y','-loglevel','error','-framerate','60','-i',str(output_frames/'%08d.png'),'-filter_complex_threads','1','-filter_complex','[0:v]split=2[hd][small];[small]scale=960:544:flags=lanczos[mobile]']
    for stream,name in [('hd','journey-hd.mp4'),('mobile','journey.mp4')]:
        command += ['-map',f'[{stream}]','-frames:v',str(count),'-an','-c:v','libx264','-threads','4','-preset','slow','-crf','20','-pix_fmt','yuv420p','-g','8','-keyint_min','8','-sc_threshold','0','-movflags','+faststart',str(work/name)]
    run(command)
    for name in ['journey-hd.mp4','journey.mp4']:
        out = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(work/name)]))['streams'][0]
        assert int(out['nb_frames']) == count and out['r_frame_rate'] == '60/1'
    for name,frame in [('journey-start.webp',0),('journey-end.webp',count-1)]:
        run(['ffmpeg','-y','-loglevel','error','-i',str(work/'journey-hd.mp4'),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-c:v','libwebp','-quality','94',str(work/name)])
    (work/'candidate.json').write_text(json.dumps(dict(reviewRequired=True,fps=fps,frames=count,sourceSHA256=hashlib.sha256(args.source.read_bytes()).hexdigest()),indent=2)+'\n')


if __name__ == '__main__':
    main()
