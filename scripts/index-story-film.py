"""Index the reviewed MP4 packets for bounded browser frame-window decoding."""
import base64
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for name in ['journey', 'journey-hd']:
    path = ROOT / 'public/assets/story' / f'{name}.mp4'
    result = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_packets',
        '-show_streams', '-show_data', '-show_entries',
        'stream=codec_tag_string,width,height,extradata,r_frame_rate:packet=pts_time,dts_time,duration_time,pos,size,flags',
        '-of', 'json', str(path),
    ]))
    stream = result['streams'][0]
    description = bytes.fromhex(''.join(line.split(':', 1)[1].split('  ', 1)[0].replace(' ', '')
                                        for line in stream['extradata'].splitlines() if ':' in line))
    assert description[0] == 1 and stream['codec_tag_string'] == 'avc1'
    packets = [[int(p['pos']), int(p['size']), round(float(p['pts_time']) * 1e6),
                round(float(p['duration_time']) * 1e6), int('K' in p['flags'])]
               for p in result['packets']]
    index = {'version': 1, 'media': f'/assets/story/{name}.mp4', 'bytes': path.stat().st_size,
             'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
             'codec': f'avc1.{description[1:4].hex()}', 'width': stream['width'],
             'height': stream['height'], 'description': base64.b64encode(description).decode(),
             'fps': int(stream['r_frame_rate'].split('/')[0]), 'packets': packets}
    destination = path.with_suffix('.index.json')
    destination.write_text(json.dumps(index, separators=(',', ':')) + '\n')
    print(destination.name, len(packets), 'packets')
