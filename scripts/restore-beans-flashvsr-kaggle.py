# Beans: private FlashVSR+ Base fidelity test (no public UI/tunnel)
import os, json, hashlib, urllib.request
from pathlib import Path
from IPython.display import Image, Video, display
ROOT = Path('/kaggle/working/beans-flashvsr')
ROOT.mkdir(parents=True, exist_ok=True)
os.environ['FLASHVSR_WORK_DIR'] = str(ROOT)
NOTEBOOK_REVISION = '3066fa0bf6c2b931bb942ca9b42553ca3d5316ef'
URL = f'https://raw.githubusercontent.com/TeamAIQ/Colab-notebooks/{NOTEBOOK_REVISION}/kaggle_notebooks/flashvsr-video-upscaler.ipynb'
raw = urllib.request.urlopen(URL).read()
assert hashlib.sha256(raw).hexdigest() == 'e9b0290e056d328a9802e19862e718cbd826878a69753e5b5be8dd2e35d9d787'
notebook = json.loads(raw)
setup = ''.join(notebook['cells'][2]['source'])
setup = setup.replace('\nstop_old_engine()\n', '\n')
setup = setup.replace('modes = ["turbo", "base"] if GET_BASE_MODEL else ["turbo"]', 'modes = ["base"]')
setup = setup.replace('"gradio==5.29.0", ', '')
exec(compile(setup, 'audited_flashvsr_setup.py', 'exec'), globals())
cell = ''.join(notebook['cells'][4]['source'])
marker = "RUN_SCRIPT_CODE = r" + "'"*3
engine = cell.split(marker, 1)[1].rsplit("'"*3, 1)[0]
engine = engine.split('import gradio as gr  # noqa: E402')[0]
assert 'demo.launch(' not in engine and 'start_cloudflare_tunnel' not in engine
exec(compile(engine, 'audited_flashvsr_engine.py', 'exec'), globals())
source = ROOT / 'beans-reviewed-source.mp4'
SOURCE_URL = 'https://raw.githubusercontent.com/TerminallyLazy/beans-lp/d93019a950d6720824818c7cc3d576201b8999b5/public/assets/story/journey.mp4'
if not source.exists(): urllib.request.urlretrieve(SOURCE_URL, source)
assert hashlib.sha256(source.read_bytes()).hexdigest() == '406f561a957021ef53cecd65b7cdf0b07780f0c94f93d4d053df06183cf5d35f'
assert probe_video(str(source))['frames'] == 518
# Default to the short test. Set BEANS_FULL_RESTORATION=1 for the complete film.
beans_seconds = 0 if os.environ.get('BEANS_FULL_RESTORATION') == '1' else 81/16
output, status, _ = upscale_video(str(source), MODE_LABELS['base'], '2x upscale', beans_seconds, 'Normal motion (fastest)', True, 20261024, 16, 'slow', compare=False)
receipt = {'source':SOURCE_URL,'source_sha256':'406f561a957021ef53cecd65b7cdf0b07780f0c94f93d4d053df06183cf5d35f','notebook_revision':NOTEBOOK_REVISION,'code_revision':FLASHVSR_COMMIT,'weights_revision':WEIGHTS_REVISION,'model':'FlashVSR+ Base','license':'Apache-2.0','seed':20261024,'test_video':output,'review_required':True}
(ROOT/'test-receipt.json').write_text(json.dumps(receipt,indent=2))
print(status)
from IPython.display import display as beans_display, Image as BeansImage, Video as BeansVideo
from PIL import Image as PILImage, ImageDraw
cap = cv2.VideoCapture(output)
poster = PILImage.new('RGB',(1440,544),'#fdfdfa')
for i,frame in enumerate([0,16,32,48,64,80]):
    cap.set(cv2.CAP_PROP_POS_FRAMES,frame)
    ok,picture=cap.read()
    assert ok
    tile=PILImage.fromarray(cv2.cvtColor(picture,cv2.COLOR_BGR2RGB)).resize((480,272))
    poster.paste(tile,((i%3)*480,(i//3)*272))
cap.release()
poster.save(ROOT/'test-contact-sheet.jpg',quality=95)
beans_display(BeansImage(filename=str(ROOT/'test-contact-sheet.jpg')))
# Keep large exports as notebook files; embed only the five-second test.
if beans_seconds:
    beans_display(BeansVideo(data=Path(output).read_bytes(),embed=True,mimetype='video/mp4',width=900))
