"""Import a private render archive into local review storage, never the public site."""
import argparse, hashlib, json, zipfile
from pathlib import Path
parser=argparse.ArgumentParser(); parser.add_argument('archive',type=Path); parser.add_argument('destination',type=Path); args=parser.parse_args()
base=Path(__file__).resolve().parents[1]/'docs/assets/originals/encounters/kaggle'
dest=args.destination.resolve(); assert dest.is_relative_to(base.resolve()), 'Review storage only'
with zipfile.ZipFile(args.archive) as archive:
 assert sum(i.file_size for i in archive.infolist())<300_000_000, 'Unexpected archive size'
 for info in archive.infolist():
  path=dest/info.filename
  assert not Path(info.filename).is_absolute() and path.resolve().is_relative_to(dest), 'Unexpected archive path'
  if info.is_dir(): continue
  data=archive.read(info)
  if path.exists(): assert path.read_bytes()==data, 'Preserve an existing reviewed take'
  else: path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(data)
receipt=json.loads((dest/'receipt.json').read_text())
assert receipt['model_license']=='Apache-2.0' and receipt['tool']=='WanGP offline production'
assert Path(receipt['video']).name==receipt['video']
video=dest/'outputs'/receipt['video']
assert hashlib.sha256(video.read_bytes()).hexdigest()==receipt['video_sha256'], 'Media hash mismatch'
print(json.dumps({'review_destination':str(dest),'video':str(video),'sha256':receipt['video_sha256'],'visual_approved':False},indent=2))
