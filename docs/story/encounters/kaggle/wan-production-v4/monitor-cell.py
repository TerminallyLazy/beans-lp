from pathlib import Path
import json,subprocess
from IPython.display import Image,display
beans_prod_root=Path('/kaggle/working/beans-wan-production-v4')
print((beans_prod_root/'production-run.log').read_text()[-2500:])
print(subprocess.check_output(['nvidia-smi','--query-gpu=index,memory.used,utilization.gpu','--format=csv,noheader'],text=True))
for receipt in sorted((beans_prod_root/'shots').glob('*/receipt.json')):
 r=json.loads(receipt.read_text());print(receipt.parent.name,r['video_sha256'],'reviewed', (receipt.parent/'review.json').is_file())
 if not (receipt.parent/'review.json').is_file(): display(Image(filename=str(receipt.parent/'contact-sheet.png'),width=960))
