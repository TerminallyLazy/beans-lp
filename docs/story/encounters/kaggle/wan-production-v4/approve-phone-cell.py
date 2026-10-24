from pathlib import Path
import json
beans_phone_review={'approved': True, 'anatomy_checked': True, 'motion_checked': True, 'video_sha256': '1ab59636f792e5543cf82ff7e1903d0074b411fa45968dd75ac96195875f628a', 'reviewer': 'Codex visual review; not owner visual approval', 'reviewed_at': '2026-10-24T15:11:40.898742+00:00', 'scope': 'All 81 decoded frames inspected in six frame review sheets. Human retains two legs, two arms, source-faithful face and continuous phone contact. Walking step, phone draw and continuous camera arc are present. No repeated landscape artifacts, extra limbs or detached device seen. Final display is stable enough for native UI projection. Final website compositing and browser acceptance remain separate.'}
beans_phone_file=Path('/kaggle/working/beans-wan-production-v4/shots/phone/review.json')
beans_phone_file.write_text(json.dumps(beans_phone_review,indent=2))
print('PHONE_VISUAL_REVIEW_ACCEPTED; next scene may render')
