from pathlib import Path
import json
beans_puppy_review={'approved': True, 'anatomy_checked': True, 'motion_checked': True, 'video_sha256': 'e45722e7c3ae20e1408140c5364101bdc74f906e122bf86317bda29b8c20cb9c', 'reviewer': 'Codex visual review; not owner visual approval', 'reviewed_at': '2026-10-24T16:07:10.411918+00:00', 'scope': 'All 81 decoded frames inspected. Puppy trots from behind kitten to foreground with attached stepping paws and a single wagging tail. Coral ball remains held in its mouth. Kitten remains correctly seated with attached paws and tail, blinking and watching butterfly. Human maintains physical phone contact, no detached device or landscape artifacts. Continuous first frame from kitten ending: 34.91 dB PSNR, mean pixel difference 2.69/255.'}
Path('/kaggle/working/beans-wan-production-v4/shots/puppy/review.json').write_text(json.dumps(beans_puppy_review,indent=2))
print('PUPPY_VISUAL_REVIEW_ACCEPTED; pony may render')
