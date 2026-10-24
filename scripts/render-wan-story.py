"""Private Kaggle renderer. Uses the existing pinned WanGP runtime and licensed Wan weights.

Never imports the retired H3 runner or uses H3-generated images. Input images must
match the locally prepared request hashes. Every output remains review-required.
"""
from pathlib import Path
import dataclasses
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import zipfile

ROOT = Path(os.environ.get('BEANS_WAN_ROOT', '/kaggle/working/beans-wan-production'))
REPO = Path('/kaggle/working/beans-phone-shot-02/Wan2GP')
CACHE = Path('/kaggle/tmp/beans-wan-production-models')
PIN = 'b8b18f8114e432eea8f3d7e853a51dd91fa99571'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def await_review(dest, video, request):
    if not request.get('review_gate'):
        return
    print('AWAITING_AGENT_VISUAL_REVIEW', dest.name, sha(video), flush=True)
    deadline = time.monotonic() + request.get('review_timeout_seconds', 1200)
    while time.monotonic() < deadline:
        path = dest / 'review.json'
        if path.is_file():
            review = json.loads(path.read_text())
            assert review.get('video_sha256') == sha(video), 'Review does not match the generated take'
            assert review.get('approved') and review.get('anatomy_checked') and review.get('motion_checked'), 'Visual review rejected this take'
            print('AGENT_VISUAL_REVIEW_ACCEPTED', dest.name, flush=True)
            return
        time.sleep(3)
    raise TimeoutError('Visual review timed out; stop instead of consuming idle GPU quota')


def main():
    assert Path('/kaggle').is_dir() and sys.platform == 'linux', 'Kaggle GPU only'
    assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO, text=True).strip() == PIN
    request = json.loads((ROOT / 'wan-request.json').read_text())
    attention = request.get('attention', 'sdpa')
    assert attention in ('sdpa', 'sage'), 'Unreviewed attention backend'
    int8_backend = request.get('int8_backend', 'auto')
    assert int8_backend in ('auto', 'pytorch'), 'Unreviewed quantization backend'
    assert (ROOT / 'model-downloads.json').is_file(), 'Pinned model downloads are incomplete'
    inputs = ROOT / 'inputs'
    inputs.mkdir(exist_ok=True)
    for filename, expected in request['inputs'].items():
        candidates = sorted(Path('/kaggle/input').rglob(filename))
        verified = [p for p in candidates if sha(p) == expected]
        assert verified, f'Missing hash-matched original input: {filename}'
        shutil.copyfile(verified[0], inputs / filename)

    config = json.loads((REPO / 'wgp_config.json').read_text())
    config.update(checkpoints_paths=[str(CACHE / 'wan22'), str(CACHE / 'wan21'), str(CACHE / 'wan21/umt5-xxl')],
                  transformer_quantization='int8', text_encoder_quantization='int8',
                  attention_mode=attention, profile=4, video_profile=4, enabled_plugins=[],
                  save_path=str(ROOT / 'outputs'), save_queue_if_crash=0,
                  vae_precision=request.get('vae_precision', '32'), vae_config=2,
                  int8_kernels='disabled' if int8_backend == 'pytorch' else int8_backend)
    (ROOT / 'wgp_config.json').write_text(json.dumps(config, indent=2))
    (ROOT / 'lora-paths.json').write_text(json.dumps({'wan': str(CACHE / 'wan22/loras_accelerators')}))
    os.chdir(REPO)
    sys.path.insert(0, str(REPO))
    # Preserve synthetic generated latents so decoder changes can be assessed
    # without paying for another full diffusion pass. No model source is edited.
    import torch
    from models.wan.modules.vae import WanVAE
    original_decode = WanVAE.decode_to_cpu_uint8
    current_scene = [None]
    def retained_decode(self, zs, tile_size, *args, **kwargs):
        if current_scene[0] is not None:
            latent_path = current_scene[0] / 'generated-latents.pt'
            torch.save([z.detach().to('cpu') for z in zs], latent_path)
            print('SYNTHETIC_LATENTS_SAVED', str(latent_path), flush=True)
        return original_decode(self, zs, tile_size, *args, **kwargs)
    WanVAE.decode_to_cpu_uint8 = retained_decode
    from shared.api import init
    session = init(root=REPO, config_path=ROOT / 'wgp_config.json', output_dir=ROOT / 'outputs',
                   cli_args=['--attention', attention, '--profile', '4', '--fp16',
                             '--lora-config', str(ROOT / 'lora-paths.json')])
    acceleration = request.get('acceleration_profile', 'Lightning i2v v1.0 3 Phases - 8 Steps.json')
    assert acceleration in ('Lightning i2v v1.0 3 Phases - 8 Steps.json', 'Lightning i2v v1.0 2 Phases - 4 Steps.json')
    profile = json.loads((REPO / 'profiles/wan_2_2' / acceleration).read_text())
    profile['sample_solver'] = profile.pop('sample_solvers', profile.get('sample_solver', 'euler'))
    profile.pop('help', None)
    profile['activated_loras'] = [Path(url).name for url in profile['activated_loras']]
    for scene in request['scenes']:
        dest = ROOT / 'shots' / scene['id']
        if (dest / 'receipt.json').is_file():
            old = json.loads((dest / 'receipt.json').read_text())
            assert old['status'] == 'generated-awaiting-review', 'Do not overwrite a failed or reviewed take'
            assert sha(dest / 'outputs' / old['video']) == old['video_sha256']
            print('PRESERVED_EXISTING_TAKE', scene['id'], flush=True)
            await_review(dest, dest / 'outputs' / old['video'], request)
            continue
        dest.mkdir(parents=True, exist_ok=True)
        current_scene[0] = dest
        settings = session.get_default_settings('i2v_2_2')
        settings.update(profile)
        start_image = inputs / scene['start']
        if scene.get('preceding'):
            previous = ROOT / 'shots' / scene['preceding']
            previous_receipt = json.loads((previous / 'receipt.json').read_text())
            assert previous_receipt['model_license'] == 'Apache-2.0'
            assert sha(previous / 'outputs' / previous_receipt['video']) == previous_receipt['video_sha256']
            start_image = previous / 'last-frame.png'
            assert start_image.is_file(), 'Missing decoded preceding Wan frame'
        settings.update(prompt=scene['prompt'], negative_prompt=request['negative_prompt'],
                        seed=scene['seed'], resolution=request['resolution'],
                        video_length=scene['frames'], force_fps='16',
                        image_prompt_type='SE', image_start=str(start_image),
                        image_end=str(inputs / scene['end']), output_filename=f"beans-{scene['id']}-wan-{request.get('take', 'v2')}",
                        override_profile=4)
        (dest / 'settings.json').write_text(json.dumps(settings, indent=2))
        print('BEANS_WAN_SCENE_START', scene['id'], time.time(), flush=True)
        started = time.monotonic()
        job = session.submit_task(settings)
        last_status = ''
        for event in job.events.iter(timeout=.5):
            if event.kind == 'progress':
                status = f'{event.data.phase}: {event.data.status}'
                if status != last_status:
                    print(status, flush=True)
                    last_status = status
            if time.monotonic() - started > request['shot_timeout_seconds']:
                job.cancel()
                raise TimeoutError(f"Scene {scene['id']} exceeded its bounded render budget")
        result = job.result()
        if not result.success:
            raise RuntimeError('; '.join(error.message for error in result.errors))
        videos = [Path(p) for p in result.generated_files if Path(p).suffix.lower() == '.mp4']
        assert len(videos) == 1 and videos[0].is_file(), 'Expected exactly one generated MP4'
        (dest / 'outputs').mkdir(exist_ok=True)
        video = dest / 'outputs' / videos[0].name
        shutil.copyfile(videos[0], video)
        probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)], text=True))
        stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        count = int(stream['nb_frames'])
        receipt = dict(status='generated-awaiting-review', scene=scene, visual_approved=False,
                       tool='WanGP offline production', wan2gp_commit=PIN, model_license='Apache-2.0',
                       attention_backend=attention,
                       int8_backend=int8_backend, acceleration_profile=acceleration,
                       vae_precision=config['vae_precision'], vae_tile_preset=config['vae_config'],
                       models=json.loads((ROOT / 'model-downloads.json').read_text()),
                       video=video.name, video_sha256=sha(video), input_hashes=request['inputs'],
                       actual_start_sha256=sha(start_image),
                       elapsed_seconds=round(time.monotonic()-started, 2), ffprobe=probe,
                       result=dataclasses.asdict(result))
        (dest / 'receipt.json').write_text(json.dumps(receipt, indent=2, default=str))
        for name, vf in [('first-frame.png', 'select=eq(n\\,0)'),
                         ('last-frame.png', f'select=eq(n\\,{count-1})'),
                         ('contact-sheet.png', 'fps=2,scale=480:-1,tile=4x3')]:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video), '-vf', vf,
                            '-frames:v', '1', str(dest/name)], check=True)
        with zipfile.ZipFile(dest / f"{scene['id']}-wan-results.zip", 'w', zipfile.ZIP_DEFLATED) as archive:
            for path in dest.rglob('*'):
                if path.is_file() and path.suffix != '.zip':
                    archive.write(path, str(path.relative_to(dest)))
        print('BEANS_WAN_SCENE_COMPLETE', scene['id'], str(video), flush=True)
        await_review(dest, video, request)


if __name__ == '__main__':
    main()
