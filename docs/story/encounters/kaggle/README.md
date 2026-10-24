# Licensed Wan character production

Current private GPU draft: https://www.kaggle.com/code/terminallylazy/beans-human-phone-reveal-02/edit

Do not Run All in that historical notebook. Its earlier H3 cells are retired. H3 output and decoded frames are excluded from website media and from Wan conditioning. The previous test notes are preserved locally in ignored audit storage.

## Current recipe

- WanGP pinned to b8b18f8114e432eea8f3d7e853a51dd91fa99571.
- Wan2.2 I2V A14B high/low INT8 weights and four-step Seko V1 Lightning LoRAs: DeepBeepMeep/Wan2.2 at 18af79606a99e565d7c5655454c1f827e190eac2.
- Wan2.1 VAE and INT8 UMT5: DeepBeepMeep/Wan2.1 at a4c0cc35033229072cb6d5a92952c3d51716837f.
- Standard Lightning i2v v1.0 2 Phases - 4 Steps.json; PyTorch INT8 math (WanGP int8_kernels=disabled); SageAttention 1.0.6 and isolated Triton 3.2.0; VAE float16.
- Torch 2.11.0+cu128 on Kaggle T4. One GPU is used by the render job; the second configured T4 is idle.
- Production picture: 960 x 544, 16 fps, silent web derivative. Model-generated picture is not a skinned runtime character mesh.

Production requests and prompts are in wan-production-v4 and wan-production-v5. The shared renderer is scripts/render-wan-story.py. It verifies original image filenames and SHA-256 values before conditioning. Every next shot starts from the preceding licensed Wan take's decoded final frame. No arbitrary attached image is admitted.

The v4 sequence supplies phone, kitten, puppy and pony. The v5 continuation uses the reviewed pony ending, a full-body family walk, and a return to a close view of the device. Stop the v4 renderer at its pony review gate before switching to v5, preserving completed files. The v5 launcher validates the owned process command before stopping it and refuses a duplicate renderer.

## Review and packaging

Each take stops at a twenty-minute visual review gate; a matching video hash and affirmative anatomy/motion review are required before the next starts. A timeout or rejection stops the renderer. Do not create an approval merely to keep the queue moving.

Download each shot ZIP through Kaggle's output UI. Import with scripts/import-wan-take.py, then use scripts/review-video-frames.py to export every decoded frame. Review all frames for identity, limb attachment, tail count, foot contact, hands, physical device contact and landscape corruption. Check first/last seams separately. Source and rejected media stay in ignored docs/assets/originals storage.

scripts/select-reviewed-take.py selects a reviewed full-size take. scripts/track-phone-display.py measures the blank glass; its output remains review_required until the geometry is inspected. scripts/combine-family-takes.py losslessly remuxes the two final performances and proves decoded-frame identity. scripts/assemble-encounter-film.py admits only hash-matched reviewed takes and reviewed source-matched phone tracks.

The website applies actual native iOS captures in the browser; the original blank-screen video is not a final composited promotional video. Complete browser acceptance and a composited static poster are required before creating release-media.json and running npm run build:release.

After all selected outputs are recovered and verified locally, stop the owned Kaggle GPU session. Do not archive the entire historical notebook output as a new production artifact.

## Sources

[Wan2.2 publisher](https://github.com/Wan-Video/Wan2.2), [Wan2.1 publisher](https://github.com/Wan-Video/Wan2.1), [LightX2V](https://github.com/ModelTC/LightX2V), [WanGP pinned runtime](https://github.com/deepbeepmeep/Wan2GP/tree/b8b18f8114e432eea8f3d7e853a51dd91fa99571).
