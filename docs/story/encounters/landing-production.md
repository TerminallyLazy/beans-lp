# Beans encounter landing production

Owner direction: finish the Human / kitten / puppy-with-ball / pony / family story and launch at petswithbeans.com. Acting is expressive, with optional sound. No start gate, website eyebrow, demonstration footnote, invented clinical claim or realistic adult-dog cutout.

## Runtime

React and TypeScript in the existing Vite project. GSAP owns the story clock. One ScrollTrigger pins a child stage; native scrolling moves a reversible clock through five scenes. App registrations and selected pets derive from that clock, including reverse seeks. The final settling footage is retimed to leave room for registration while preserving performed motion. One outstanding media seek is allowed. Every completed decode is presented with its matching camera crop, app state and phone geometry, then the newest requested target is consumed. This avoids starving presentation during continuous scroll. Resize and pet selection redraw the existing GPU texture rather than sampling a partly decoded future frame.

Character movement is generated 3D-rendered footage conditioned on source-faithful keyframes. It is **not a delivered runtime skinned character mesh**. Nine Three.js butterflies have articulated wings, depth, warm lighting, pointer-aware flight and a hidden three-tap logo flourish. The same GSAP ticker advances their local flight, independently of the paused scroll clock. Foreground rendering stops while the section or document is inactive. No additional scroll controller is used.

## Phone and data

The phone and hands belong to the performance. Original Beans UI is a separate texture projected onto the measured glass with a full per-frame homography. The source glass provides the occlusion mask, preserving thumbs and dark bezels. Outward-facing walk intervals use a separately generated pearl metal texture with raised diagonal camera hardware, rather than a procedural flat panel. The authored camera-turn boundary restores the native app on front glass; edge-on intervals have no projection. This surface is projected artwork, not a new runtime 3D handset model. Mipmapping and anisotropic filtering reduce aliasing in small perspective text.

Every displayed app view is now a native capture from app commit 086a8a3cb349570013ae54fe1e1d1243ef3d1870. An isolated, ad-hoc-signed simulator build uses the app's existing synthetic onboarding and Organizer probes. The current navigation is My Pets, Beans and Organizer. The final selected-pet dashboard cycles among Cleo, Willow and Bert; its actual animal chooser exposes all three. The native app's own logo, controls, charts and typography are preserved. Each pet has a manually entered twelve-minute activity log in a separate synthetic vault; these are not live tracking, an actual owner account or clinical results. Source app files and installed owner apps were not changed. See native-captures.json for capture dimensions and hashes. No account, camera, microphone or real record is accessed by the website.

## Launch

The public TestFlight link was checked in the browser on 2026-10-24 and resolves to Beans: Pet Care Companion. Official unmodified TestFlight artwork comes from Apple's own site. QR and links use https://testflight.apple.com/join/7WSeN4VB. Support and privacy use the app's existing public pages. Contact is mailto:contact@petswithbeans.com; no submission backend or delivery test is claimed.

Vercel confirms project prj_4TVVeWmPyySu67O6Qbp9W0gWcwqC owns and verifies www.petswithbeans.com. Before deployment, the domain returned Vercel NOT_FOUND (404). IONOS mail MX and SPF remain present and unchanged. Current deployment acceptance is recorded separately after the final build.

## Motion and access

Reduced motion uses a still final family composition and native app screen, without pinning or foreground flight. A keyboard skip link reaches the beta section. Controls have accessible names, focus styles and 44-pixel targets. Sound is off until deliberately enabled and is generated locally; model audio is removed from the public film. No analytics or account storage is introduced.

## Production review

H3 footage and decoded frames are excluded from production. The replacement uses Apache-licensed Wan models. The first two Wan phone takes were rejected for landscape artifacts; selected takes use the standard four-step profile with PyTorch INT8 math. See selected-sources.json for hashes, model revisions, review scopes and source frame counts.

All six generated performances have passed agent review of every decoded frame: Human/phone (81), kitten (97), puppy (81), pony (97), family walk (81), family close-up (81). The family pair is losslessly remuxed with every decoded frame hash proved identical to its reviewed input. The reviewed source contains 518 frames at 16 fps across five chapters; the delivery clock now has 1,036 frames at 32 fps. The kitten performs a playful walk/bound and butterfly chase rather than a literal sideways roll. The Human rises and takes multiple planted steps with the pets, and the closing camera move returns to the held device. Agent review is not owner visual acceptance.

The pony and kitten references and performances were reviewed for attached limbs and one tail. Four pony hooves and kitten paws are distinct in clear final poses; ordinary gait occlusion occurs during walking. Website headings use upright, self-hosted Manrope. No serif/italic website heading split remains.

## Phone tracking

The opening display becomes front-facing on source frames 53–80 (106–160 on the delivery clock). Kitten, puppy and pony display tracks are measured throughout. The final family chapter combines measured close-up glass edges with manual anchors and local optical flow for small or partly covered displays. Hidden corners are inferred behind the supporting hands or above the picture crop; they are not claimed as directly observed points. Edge-on intervals receive no UI projection. All geometry tiles and several actual native UI composites have been checked. A closing glint outlier and underestimated lower glass edges were corrected before packaging.

## Browser and release checks

The local production page passes desktop forward/reverse scrolling, rapid seek reversal, all three pet selections, physical phone taps on desktop/mobile, pause and opt-in sound controls, 320/390-pixel mobile layouts, reduced motion without pinning or video loading, keyboard skip/focus, home restoration, and blocked-video fallback. Mobile camera timing follows the delivered character paths; headings remain clear of controls at 320 pixels. Temporary emulation and network overrides are restored. browser-acceptance.json records checks and evidence. Code validation passes TypeScript, ESLint and twenty-four tests, including six retained tests for historical state helpers.

The current web variants use H.264 CRF 20, four-frame GOPs and 32 fps, with the same 32.375-second performed film duration. FFmpeg motion-compensated interpolation adds intermediate frames; all 518 added frames, the largest optical-flow departures and the corrected ending were reviewed. FSRCNN x2 produces the 1920×1088 HD variant from 960×544 source. Agent comparison found modest sharper reconstruction; this does not recover native high-resolution performance detail. The approximately 69 MiB HD and 28 MiB base variant are selected using displayed cover width and pixel density, respecting Save Data and slow connections. HD failure retries base; total film failure retains the accessible poster and beta path. See clarity-media.json and the reproducible candidate builder, scripts/prepare-sharp-film.py.

Film sampling uses a normalized crop shader and a visible-viewport framebuffer capped at 4,194,304 pixels / DPR 2, replacing the oversized landscape canvas previously stretched on portrait phones. On the 390×844 DPR 2 check, the film buffer is 750×1688 pixels. Native UI has an independent mipmapped texture. Transparent pet derivatives were edited with the built-in image tool; transparent-pets.json records the source and hashes.

After the journey, three concise feature descriptions cover My Pets, the Beans AI companion and Organizer. Copy was checked against current iOS commit 7898d47912ced2fcb732c4a690691acff5a05974; product-copy-provenance.json records source evidence. Beta and footer share a minimum full-viewport white container. Desktop and portrait checks at maximum scroll show no remaining hero strip. The reduced-motion/social poster was recaptured from the final native-screen compositor at 1920×1088. release-media.json pins all 31 reviewed runtime asset hashes and the 1,036-frame clock before release.

The updated production preview was checked in Chromium desktop, 320/390-pixel portrait emulation and 844×280 landscape. Rapid forward/reverse seeking, front/rear orientation, all three pet choices, a mobile phone tap, feature layout, full-white ending, keyboard skip/focus, reduced motion and HD/base failure paths passed. Native macOS Safari was checked through the walk, return to native app, pet selection, white ending and reverse scroll. Browser screenshots are held as local QA evidence outside the production bundle. No physical iPhone or auditory acceptance is claimed.

The owned Kaggle GPU session is stopped after all selected outputs were recovered and hash checked locally. Capture simulators are shut down, overrides cleared and app source unchanged. Physical iPhone, actual beta installation and mailbox delivery remain untested. Public deployment acceptance is recorded after release; no submission backend is claimed.
