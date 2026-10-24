# beans-lp

Build briefs for the **Beans Pet and Equine Care** landing page, adapted from the Beans iOS app.

This repository currently contains prompts and reference documentation, not a website implementation. The direction is cinematic Beans: warm ivory, deep navy, coral accents, expressive animal artwork, and carefully choreographed product storytelling.

The briefs are platform-neutral and intended for a developer or coding agent working directly in the website repository. They do not require a hosted site builder, managed mode, a particular framework, or a particular deployment provider.

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

Preserve the website's existing stack and conventions. If no implementation exists, state a conventional web setup compatible with GSAP before scaffolding it. Build and validation commands come from the actual project, not a presumed platform.

### Required and supporting tools

| Tool | Role |
| --- | --- |
| GSAP core and timelines | Required animation foundation |
| ScrollTrigger | Required section lifecycle, pinning, and scroll-linked choreography |
| Observer behavior | Required gesture interpretation for the optional guided hero |
| SplitText | Selected accessible heading and caption reveals |
| Locomotive Scroll | Preferred smooth-scroll enhancement when compatible; native scrolling remains the fallback |
| BSMNT Scrollytelling | Optional React abstraction over GSAP ScrollTrigger for suitable scrubbed sections |
| Three.js / Interactive 3D Lab | Genuine 3D where assets support it; the lab is a reference, not a required dependency |

**Use one scroll system.** Do not combine Locomotive Scroll, an independent Lenis instance, and ScrollSmoother. The hero's timed gesture transitions are not the same as the product reel's scroll-scrubbed animation.

Official documentation and repository links are included in the [shared brief](prompts/shared/gsap-implementation.md#documentation-and-implementation-references).

## Scope and source of truth

- Preserve the existing Beans identity, not the original private-jet aesthetic.
- Current reviewed app navigation is **My Pets, Beans, and Organizer**; Insurance is reached separately. Historical screenshots can show older navigation.
- Use illustrative data honestly. Do not invent clinical outcomes, live tracking, insurer guarantees, testimonials, public availability, or release links.
- Confirm release-facing claims against the current app and approved product decisions before publishing.
- Do not copy production records, credentials, or private owner information into the website or its media.
- The original Beans assets and app source remain in the separate `Beans-iOS` repository; they are not bundled here.

## Validation boundaries

These documents define the intended implementation and its acceptance checks. Their presence does not establish that the website has been built, tested in a browser, deployed, or connected to a submission backend. The implementation prompts require a truthful handoff covering the checks actually performed and any missing assets, integrations, or release configuration.
