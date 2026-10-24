# Required implementation direction — GSAP-first Beans experience

Apply this brief to both website build phases. It governs technical implementation without replacing the phase-specific creative brief.

Build the Beans landing page using **GSAP as its primary animation system**, with **ScrollTrigger as the foundation for scroll-driven choreography**.

This is an implementation requirement, not merely a visual reference. Do not substitute CSS-only scroll effects, another animation framework, or a prerecorded video for interactions that the brief requires to be interactive. Ordinary focus, color, and press feedback may use CSS where that does not conflict with GSAP-owned properties.

Keep the established Beans creative direction:

- Ivory, navy, and coral.
- Warm animal characters and faithful app-derived interfaces.
- Editorial serif headings and readable system sans-serif text.
- Soft, tactile surfaces and purposeful depth.
- Cinematic craft without luxury-aviation styling or exaggerated motion.

## Documentation and implementation references

Consult current official documentation before implementing:

- GSAP: https://gsap.com/docs/v3/
- ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Observer: https://gsap.com/docs/v3/Plugins/Observer/
- React integration: https://gsap.com/resources/React/
- Official GSAP agent skills: https://github.com/greensock/gsap-skills/tree/main/skills

Read the relevant guidance from:

- `gsap-core`
- `gsap-timeline`
- `gsap-scrolltrigger`
- `gsap-plugins`
- `gsap-performance`
- `gsap-react`, when the website uses React
- `gsap-utils`, where useful

Additional references:

- Locomotive Scroll: https://github.com/locomotivemtl/locomotive-scroll
- Locomotive documentation: https://scroll.locomotive.ca/docs
- BSMNT Scrollytelling: https://github.com/basementstudio/scrollytelling
- Interactive 3D Lab: https://github.com/SafaElmali/interactive-3d-lab

Use documentation matching the installed package versions. Do not blindly copy older demos or assume that linked skills are already installed. Check API details against the official documentation when an example or skill conflicts with it.

## Required GSAP foundation

Use GSAP timelines to coordinate scene movement, text reveals, product surfaces, progress indicators, and transitions.

Use ScrollTrigger for:

- Section activation and lifecycle.
- Desktop pinning where specified.
- Scroll-scrubbed product storytelling.
- Coordinated progress and active-scene state.
- Reversible section choreography.
- Starting and pausing section-specific animation.

Implement directly in the website source repository. Inspect and preserve its existing framework, package manager, source layout, scripts, and build/deployment configuration. If no website implementation exists, state a conventional web setup compatible with GSAP before scaffolding it. Do not assume a hosted site builder, managed mode, or a specific deployment provider.

Register every plugin used before its first use. Use the project's package manager for dependencies, with compatible versions recorded in the lockfile.

Do not add a separate application scaffold or incompatible build system merely to reproduce an example.

Organize animation by section. Share setup, tokens, and scroll integration, but avoid one enormous timeline that owns the entire website.

Only one controller may own a given animated property at a time. Separate scroll movement and pointer tilt onto nested wrappers rather than having two systems write the same transform.

## Use the appropriate GSAP plugins

Required:

- GSAP core and timelines.
- ScrollTrigger.
- Observer behavior for the optional guided hero, either through `ScrollTrigger.observe()` or a separately imported Observer plugin.

Use **SplitText** for selected masked line or word reveals on editorial headings and scene captions. Preserve accessible text, handle font loading and responsive reflow, and revert split markup during cleanup. Do not split every paragraph into animated characters.

Use additional plugins when the interaction genuinely calls for them:

- **Draggable** for the companion carousel's horizontal drag interaction.
- **InertiaPlugin** only if bounded release momentum improves that carousel.
- **Flip** for genuine transitions between different DOM layout states.
- **MotionPathPlugin** for supported curved 2D object paths.
- **DrawSVGPlugin** for a meaningful progress or connecting-line reveal.
- **ScrollToPlugin** for programmatic navigation when native scrolling is the active scroll system.

Do not import every available plugin just to demonstrate library coverage.

Avoid ScrambleText, theatrical logo morphing, physics effects, or exaggerated bounce unless a specific Beans interaction justifies them.

## Smooth scrolling — one system only

Evaluate **Locomotive Scroll** as the preferred smooth-scroll enhancement, especially for desktop storytelling.

Use one compatible Locomotive Scroll instance if it works reliably within the website's stack. Verify its current integration API and synchronize its scroll updates with ScrollTrigger as documented.

The reviewed Locomotive Scroll v5 is built on Lenis. Do not create another independent Lenis instance alongside it.

Do not combine Locomotive Scroll with GSAP ScrollSmoother.

Do not automatically apply a legacy transformed-container/scrollerProxy recipe to a modern native-scroll implementation. Use `ScrollTrigger.scrollerProxy()` only when the installed integration actually requires it.

Ensure there is one authoritative scroll position and a coordinated update path. Avoid duplicate animation-frame loops driving the same scroll engine.

Keep native scrolling on touch devices and for reduced-motion users where smoothing would reduce control.

Preserve:

- Keyboard scrolling.
- Native scrollbar behavior.
- Anchor navigation.
- Browser history restoration.
- Focus movement.
- Form and dialog scrolling.

Route programmatic navigation through the active scroll system. Do not let ScrollToPlugin and Locomotive Scroll simultaneously animate the page's scroll position.

If Locomotive Scroll causes compatibility or accessibility problems, retain GSAP and ScrollTrigger and fall back to native scrolling. Explain the decision in the handoff instead of silently replacing the required GSAP foundation.

## BSMNT Scrollytelling — use selectively in React

If the website uses React, evaluate `@bsmnt/scrollytelling` for the Everyday Care reel and other genuinely scroll-scrubbed compositions.

Use it when its Root, Animation, Waypoint, or Parallax abstractions make the section easier to maintain.

It is an abstraction over GSAP ScrollTrigger, not an additional scroll engine.

Do not create duplicate direct ScrollTriggers to control the same timeline or transforms already owned by a Scrollytelling Root.

Its default scroll-scrubbed model must not accidentally replace the hero's gesture-triggered, automatically completing transitions.

Do not change the project's framework solely to add this library. Direct GSAP is the fallback when the wrapper adds complexity or does not fit the required interaction.

## Interactive 3D Lab — reference, not wholesale template

Study Interactive 3D Lab for:

- Chapter-based scene composition.
- Coordinated camera, object, lighting, and text changes.
- Deterministic forward and reverse behavior.
- Mobile framing.
- Reduced-motion chapter states.
- Offscreen and hidden-tab rendering suspension.

Translate useful techniques into the Beans visual world. Do not copy its branding, content, unrelated objects, hosting configuration, or entire application structure.

Do not run its custom scroll-progress controller alongside a GSAP controller that writes the same scene values.

Where genuine 3D is appropriate, use Three.js with GSAP animating scene properties or a shared scene-state object. Keep rendering ownership clear and update camera targets and projection matrices where required.

Do not replace supplied Beans animals with generic generated 3D models. If only artwork and video are available, use a high-quality GSAP-driven 2.5D composition.

Check licenses and attribution before reusing any source code, model, texture, font, or HDR asset.

## Responsive behavior and lifecycle

Use `gsap.matchMedia()` for desktop, mobile, pointer capability, and `prefers-reduced-motion` variants.

Reduced motion must remove camera travel, large parallax, pointer tilt, scroll smoothing, and unnecessary pinning. Keep the content and story available through static compositions or short opacity changes.

When using React:

- Use `@gsap/react` and scoped `useGSAP()` setup.
- Use `contextSafe()` for later event handlers that create GSAP animations.
- Keep browser-only animation initialization within client-side boundaries.
- Verify that development remounting does not duplicate animations or triggers.

Clean up:

- Timelines and tweens.
- Section-owned ScrollTriggers.
- Observers and Draggable instances.
- SplitText instances.
- Custom listeners and ticker callbacks.
- Smooth-scroll instances.
- Any WebGL resources owned by removed scenes.

Do not use a global kill-all operation during ordinary section cleanup that destroys other sections' animations.

Refresh ScrollTrigger after relevant layout changes, including media dimensions, fonts, and responsive composition changes. Use function-based measurements and `invalidateOnRefresh` where needed.

Animate children inside pinned wrappers rather than the measured pin target itself. Avoid unsupported nested pinning.

Keep normal content readable if JavaScript, media, or animation initialization fails.

## Animation acceptance checks and handoff

Verify actual behavior, not just the presence of GSAP imports:

- Hero: one gesture produces one completed stage transition.
- Long trackpad momentum does not skip stages.
- Skip and Escape work mid-transition.
- Hero exit and reverse navigation do not trap the visitor.
- The product reel scrubs smoothly in both directions.
- Pin spacing remains correct after fonts and media load.
- Carousel drag does not block vertical touch scrolling.
- Theme switching and viewport changes do not duplicate triggers.
- Reduced-motion mode removes smoothing and spatial travel.
- Page navigation and browser history restore correctly.
- Hidden sections stop unnecessary animation and rendering.
- No development markers or debug controls ship to production.

At handoff, list:

1. Installed animation-library versions.
2. GSAP plugins actually used and their purpose.
3. Whether Locomotive Scroll is active or native scrolling was retained.
4. Whether BSMNT Scrollytelling was used and where.
5. Any Three.js implementation and the provenance of reused assets/code.
6. The interaction and deployment checks actually performed.
