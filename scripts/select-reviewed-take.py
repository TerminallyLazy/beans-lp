"""Select a reviewed production take without exposing rejected source media."""
import argparse,hashlib,json,shutil
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('scene',choices=['phone','kitten','puppy','pony','family']);parser.add_argument('candidate',type=Path);args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
base=root/'docs/assets/originals/encounters/kaggle';source=args.candidate.resolve()
assert source.is_relative_to(base.resolve()),'Candidate must come from local review storage'
receipt=json.loads((source/'receipt.json').read_text());review=json.loads((source/'review.json').read_text())
assert receipt['scene']['id']==args.scene and receipt['model_license']=='Apache-2.0'
assert review['approved'] and review['anatomy_checked'] and review['motion_checked'],'Visual review incomplete'
video=source/'outputs'/receipt['video'];digest=hashlib.sha256(video.read_bytes()).hexdigest()
assert digest==receipt['video_sha256']==review['video_sha256']
stream=next(s for s in receipt['ffprobe']['streams'] if s['codec_type']=='video')
assert int(stream['width'])>=960 and int(stream['height'])>=544,'Diagnostic resolution is not production footage'
target=base/'wan-approved/shots'/args.scene
if target.exists():
 previous=json.loads((target/'receipt.json').read_text());assert previous['video_sha256']==digest,'Preserve the previously selected take'
else:
 (target/'outputs').mkdir(parents=True)
 for name in ['receipt.json','settings.json','review.json','first-frame.png','last-frame.png','contact-sheet.png']:
  shutil.copyfile(source/name,target/name)
 shutil.copyfile(video,target/'outputs'/video.name)
 (target/'selection.json').write_text(json.dumps(dict(candidate=str(source.relative_to(root)),sha256=digest),indent=2)+'\n')
print('Selected reviewed take',args.scene,digest)
