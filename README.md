# beans-lp

Build briefs for the **Beans Pet and Equine Care** landing page, adapted from the Beans iOS app.

The website uses React, TypeScript and Vite. A native-scroll GSAP/ScrollTrigger timeline follows the Beans Human as he meets a kitten, a puppy and a pony. The original build briefs remain below; the owner's current story direction and acceptance status are recorded in [landing production](docs/story/encounters/landing-production.md).

## Run locally

```sh
npm ci
npm run dev
```

For a local production preview, run `npm run build` and `npm run preview`. The preview is at `http://127.0.0.1:4173`. Run `npm run typecheck`, `npm run lint` and `npm test` for code validation.

Deployment uses `npm run build:release`. It verifies reviewed media hashes, all five scene boundaries and per-frame phone tracking before building. A missing or changed production film blocks deployment. The local preview can show the original Human opening while those assets are being reviewed; that fallback is not a completed animated story.

## Current implementation

One ScrollTrigger pins the story stage and scrubs a reversible clock derived from the delivered film's actual frame rate. Each completed decode is presented with its matching phone plane and app state before seeking the newest requested position. The film renders directly at the visible viewport resolution, without enlarging a separate landscape canvas on phones. Registration and pet selection reverse with the story. The phone's glass receives native Beans app captures through a per-frame homography that preserves the performed hands, bezels, lighting and occlusion.

App views come from an isolated native simulator build using synthetic fixtures, including the logo, My Pets / Beans / Organizer navigation, onboarding forms and recorded activity. The website never opens an owner account or changes actual pet records. Capture provenance is in [native captures](docs/story/encounters/native-captures.json).

Character motion is generated 3D-rendered footage, not runtime skinned character meshes. Nine Three.js butterflies have articulated wings, depth, pointer-aware flight and a three-tap Beans-logo flourish. Sound is optional and off initially. Reduced motion uses a static final composition without pinning or flight. There is no start gate, website eyebrow, decorative footnote or serif/italic heading split. Website headings use upright Manrope.

A concise feature section follows the story, with copy checked against the current iOS source. The beta and footer occupy at least a full viewport at the end, so no hero strip remains. Pet-picker artwork has genuine transparency. The phone rear uses a generated material-and-camera texture on the measured plane; the source film retains hands and edges.

The beta link and QR point to the public Apple TestFlight invitation. The footer links to contact@petswithbeans.com and the app's support and privacy pages. Vercel project `beans-lp` owns the verified `www.petswithbeans.com` domain; IONOS mail records are preserved.

## Media review status

H3 footage was excluded after its license review. The replacement pipeline uses Apache-licensed Wan models and source-faithful original keyframes. Corrected kitten, pony and family references have been inspected for limb and tail placement. The first two replacement phone takes were rejected for rendering artifacts. The standard four-step profile with PyTorch INT8 math produced clean full-size footage. All six generated performances have completed decoded-frame review. The two family takes are remuxed into the fifth story chapter, with decoded-frame identity verified. The reviewed 518-frame, 16 fps source is delivered as 1,036 frames at 32 fps, with reviewed optical-flow intermediate frames and an FSRCNN x2 HD variant. HD selection accounts for the actual crop and pixel density; Save Data and slower connections use the smaller film. This is reconstructed source detail, not newly rendered native 1080p footage. No rejected take is eligible for deployment.

Historical exploration, Muse drafts, earlier layouts and retired handset rendering remain in local audit material. Their tests and screenshots do not establish acceptance of the current film. See [landing production](docs/story/encounters/landing-production.md) for the current remaining checks.

## Folder structure

```text
prompts/
  shared/
    gsap-implementation.md       Required technical foundation for both phases
  website/
    01-build-hero.md             Hero composition and optional five-stage tour
    02-complete-website.md       Remaining sections, contact, and footer
references/
  beans-style-and-product.md     Brand, voice, product context, and claim boundaries
  asset-manifest.md              What to prepare from Beans-iOS and how to use it
```

## Use the website build briefs

1. Review the [Beans style and product reference](references/beans-style-and-product.md).
2. Make the approved artwork, logo variants, media, and interface references listed in the [asset manifest](references/asset-manifest.md) available to the website project. Source paths alone do not transfer files or authorize publishing private records.
3. Give the developer or coding agent the complete [shared GSAP implementation brief](prompts/shared/gsap-implementation.md), followed by [01 — Build the hero](prompts/website/01-build-hero.md). An agent with repository access can read these files directly.
4. Inspect and approve the hero before proceeding.
5. In the same website project, use [02 — Complete the website](prompts/website/02-complete-website.md). Keep the shared brief in context; provide it again if starting a new conversation.

The shared brief is mandatory for both phases. Each phase contains its own section-specific animation requirements, so the technical foundation does not need to be duplicated.

The owner's latest direction supersedes the original hero's optional click-to-start tour: use natural scroll progression, retain the park, remove the adult dog cutout, and keep only necessary headings. The source briefs retain their original wording; the handoff records the current implementation.

Preserve the website's existing stack and conventions. If no implementation exists, state a conventional web setup compatible with GSAP before scaffolding it. Build and validation commands come from the actual project, not a presumed platform.

### Required and supporting tools

| Tool | Role |
| --- | --- |
| GSAP core and timelines | Required animation foundation |
| ScrollTrigger | Required section lifecycle, pinning, and scroll-linked choreography |
| Observer behavior | Original optional-tour requirement; unused in the current native-scroll hero |
| SplitText | Heading-line reveals without clipping masks |
| Locomotive Scroll | Preferred smooth-scroll enhancement when compatible; native scrolling remains the fallback |
| BSMNT Scrollytelling | Optional React abstraction over GSAP ScrollTrigger for suitable scrubbed sections |
| Three.js / Interactive 3D Lab | Three.js renders the articulated foreground butterflies; the lab remains a reference |

**Use one scroll system.** The current story uses native scrolling and ScrollTrigger. Do not combine Locomotive Scroll, an independent Lenis instance, and ScrollSmoother.

Official documentation and repository links are included in the [shared brief](prompts/shared/gsap-implementation.md#documentation-and-implementation-references).

## Scope and source of truth

- Preserve the existing Beans identity, not the original private-jet aesthetic.
- Current reviewed app navigation is **My Pets, Beans, and Organizer**; Insurance is reached separately. Historical screenshots can show older navigation.
- Use illustrative data honestly. Do not invent clinical outcomes, live tracking, insurer guarantees, testimonials, public availability, or release links.
- Confirm release-facing claims against the current app and approved product decisions before publishing.
- Do not copy production records, credentials, or private owner information into the website or its media.
- Approved Beans logos, posters, and web derivatives of character animations are copied into this repository. Original app source remains in the separate `Beans-iOS` repository. Asset provenance is recorded under `docs/assets`.

## Validation boundaries

TypeScript, ESLint, the production preview build and twenty-four focused code tests pass for the current implementation. Typography has been checked at desktop and 390-pixel widths. Native screens have been captured and verified in the isolated simulator. Complete decoded-frame and tracking review has passed. The production preview has been checked through forward/reverse scrolling, mobile framing at 320 and 390 pixels, pet selection, native phone taps, reduced motion, keyboard skipping and blocked-video fallback. Public deployment acceptance is recorded separately after release. Desktop Safari and Chromium mobile emulation have been checked. Physical iPhone acceptance is not claimed. No submission backend or email-delivery test is claimed.
