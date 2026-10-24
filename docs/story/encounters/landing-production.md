# Beans encounter landing production

Owner direction: finish the Human / kitten / puppy-with-ball / pony / family story and launch at petswithbeans.com. Acting is expressive, with optional sound. No start gate, website eyebrow, demonstration footnote, invented clinical claim or realistic adult-dog cutout.

## Runtime

React and TypeScript in the existing Vite project. GSAP owns the story clock. One ScrollTrigger pins a child stage; native scrolling moves a reversible clock through five scenes. App registrations and selected pets derive from that clock, including reverse seeks. The final settling footage is retimed to leave room for registration while preserving performed motion. One outstanding media seek is allowed; the newest requested target is consumed after decoding completes.

Character movement is generated 3D-rendered footage conditioned on source-faithful keyframes. It is **not a delivered runtime skinned character mesh**. Nine Three.js butterflies have articulated wings, depth, warm lighting, pointer-aware flight and a hidden three-tap logo flourish. The same GSAP ticker advances their local flight, independently of the paused scroll clock. Foreground rendering stops while the section or document is inactive. No additional scroll controller is used.

## Phone and data

The phone and hands belong to the performance. Original Beans UI is a separate texture projected onto the measured glass with a full per-frame homography. The source glass provides the occlusion mask, preserving thumbs and dark bezels. Mipmapping and anisotropic filtering reduce aliasing in small perspective text.

Every displayed app view is now a native capture from app commit 086a8a3cb349570013ae54fe1e1d1243ef3d1870. An isolated, ad-hoc-signed simulator build uses the app's existing synthetic onboarding and Organizer probes. The current navigation is My Pets, Beans and Organizer. The final selected-pet dashboard cycles among Cleo, Willow and Bert; its actual animal chooser exposes all three. The native app's own logo, controls, charts and typography are preserved. Each pet has a manually entered twelve-minute activity log in a separate synthetic vault; these are not live tracking, an actual owner account or clinical results. Source app files and installed owner apps were not changed. See native-captures.json for capture dimensions and hashes. No account, camera, microphone or real record is accessed by the website.

## Launch

The public TestFlight link was checked in the browser on 2026-10-24 and resolves to Beans: Pet Care Companion. Official unmodified TestFlight artwork comes from Apple's own site. QR and links use https://testflight.apple.com/join/7WSeN4VB. Support and privacy use the app's existing public pages. Contact is mailto:contact@petswithbeans.com; no submission backend or delivery test is claimed.

Vercel confirms project prj_4TVVeWmPyySu67O6Qbp9W0gWcwqC owns and verifies www.petswithbeans.com. Before deployment, the domain returned Vercel NOT_FOUND (404). IONOS mail MX and SPF remain present and unchanged. Current deployment acceptance is recorded separately after the final build.

## Motion and access

Reduced motion uses a still final family composition and native app screen, without pinning or foreground flight. A keyboard skip link reaches the beta section. Controls have accessible names, focus styles and 44-pixel targets. Sound is off until deliberately enabled and is generated locally; model audio is removed from the public film. No analytics or account storage is introduced.

## Production review

H3 footage and decoded frames are excluded from production. The replacement uses Apache-licensed Wan models. The first two Wan phone takes were rejected for landscape artifacts; selected takes use the standard four-step profile with PyTorch INT8 math. See selected-sources.json for hashes, model revisions, review scopes and source frame counts.

All six generated performances have passed agent review of every decoded frame: Human/phone (81), kitten (97), puppy (81), pony (97), family walk (81), family close-up (81). The family pair is losslessly remuxed with every decoded frame hash proved identical to its reviewed input. The website film contains 518 frames at 16 fps across five chapters. The kitten performs a playful walk/bound and butterfly chase rather than a literal sideways roll. The Human rises and takes multiple planted steps with the pets, and the closing camera move returns to the held device. Agent review is not owner visual acceptance.

The pony and kitten references and performances were reviewed for attached limbs and one tail. Four pony hooves and kitten paws are distinct in clear final poses; ordinary gait occlusion occurs during walking. Website headings use upright, self-hosted Manrope. No serif/italic website heading split remains.

## Phone tracking

The opening display becomes front-facing on frames 53–80. Kitten, puppy and pony display tracks are measured throughout. The final family chapter combines measured close-up glass edges with manual anchors and local optical flow for small or partly covered displays. Hidden corners are inferred behind the supporting hands or above the picture crop; they are not claimed as directly observed points. Edge-on intervals receive no UI projection. All geometry tiles and several actual native UI composites have been checked. A closing glint outlier and underestimated lower glass edges were corrected before packaging.

## Browser and release checks

The local production page passes desktop forward/reverse scrolling, rapid seek reversal, all three pet selections, physical phone taps on desktop/mobile, pause and opt-in sound controls, 320/390-pixel mobile layouts, reduced motion without pinning or video loading, keyboard skip/focus, home restoration, and blocked-video fallback. Mobile camera timing follows the delivered character paths; headings remain clear of controls at 320 pixels. Temporary emulation and network overrides are restored. browser-acceptance.json records checks and evidence. Code validation passes TypeScript, ESLint and sixteen tests, including six retained tests for historical state helpers.

The final web encode uses H.264 CRF 22 and four-frame GOPs, reducing the film from 34 MiB to 18 MiB. Structural similarity against the larger CRF 19/two-frame-GOP comparison is 0.980980; this is compression evidence, not anatomy or owner acceptance. The reduced-motion and social poster is exported from the actual native-screen compositor. release-media.json pins runtime asset hashes and the 518-frame clock before the release build.

The owned Kaggle GPU session is stopped after all selected outputs were recovered and hash checked locally. Capture simulators are shut down, overrides cleared and app source unchanged. Physical iPhone/Safari, actual beta installation and mailbox delivery remain untested. Public deployment acceptance is recorded after release; no submission backend is claimed.
