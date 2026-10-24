# Beans — A little closer. Better cared for.

## Build the hero section

Build a cinematic, welcoming landing-page hero for **Beans Pet and Equine Care**: an iPhone companion for the dogs, cats, and horses in your life.

Apply the shared GSAP implementation brief supplied with this prompt. GSAP and ScrollTrigger are required; the hero-specific architecture below explains how to use them.

This should feel unmistakably related to the existing Beans iOS app. Preserve cinematic depth and carefully choreographed transitions, but express them through warm animal characters, soft light, tactile surfaces, and recognizable product details.

The feeling is affectionate, reassuring, thoughtful, and precise. Premium means beautifully considered—not exclusive, intimidating, or expensive-looking.

**Create only the hero section in this pass.**

## Project and asset handling

Use Runable's managed mode and supported project structure so the website remains editable and deployable within Runable.

The SwiftUI project is a product and visual reference, not the website runtime. Do not attempt to run SwiftUI, native shaders, or iOS-only dependencies in the browser.

Inspect supplied assets before choosing the implementation. Prefer existing media and a lightweight layered composition over introducing a large 3D framework.

Relevant source assets, uploaded separately:

- Beans logo variants from `BeansVet/Resources/BeansAssets.xcassets`: BeansLogoHorizontal, BeansLogoStacked, BeansMark, and BeansWordmark.
- Species artwork: TrackingDog, TrackingCat, TrackingHorse, and supplied dog/cat overlays.
- Existing animal videos from `BeansVet/Resources/Animations`: BeansDogLight.mp4, BeansCatLight.mp4, BeansHorseLight.mp4, and their Dark equivalents.
- Matching Light and Dark poster PNGs.
- Supplied Beans app screenshots as references for real interface structure.

Preserve logo proportions and animal identities. Do not redraw the Beans logo, substitute emoji for the artwork, or generate a new mascot family.

No GLB is required. If only flat artwork or video is supplied, use honest 2.5D layering, small perspective changes, and crossfades. Do not attempt a 360-degree orbit around a flat image or fabricate unseen anatomy.

## Visual identity

Use the established Beans palette:

- Beans Ivory: `#FDFDFA`
- Beans Navy: `#051D38`
- Beans Coral: `#FF584F`
- White for selected raised surfaces.
- Muted blue-gray for secondary text.

Light appearance should feel like an open ivory space with navy typography and selective coral emphasis.

Support a coordinated dark appearance: deep navy, restrained coral warmth near the lower edge or upper-right corner, ivory headings, and ivory reading cards with navy text. Dark mode must still feel warm and readable—not black, metallic, neon, or cyberpunk.

Follow the visitor's system appearance initially and provide an accessible persistent theme control.

Use a system-serif display stack for the headline, with a readable system sans-serif for body text, navigation, and controls. Retain the supplied Beans wordmark as an image.

Use approximately 24px corners for main panels and 18px corners for primary buttons, adapting naturally to the web layout. Primary buttons should have coral fill, navy text, and a minimum 56px height. Check actual contrast.

Keep shadows soft and purposeful. Use translucent material only for small floating controls where it improves separation. Do not cover the page in glass cards.

## Hero composition

Create one spacious, viewport-scale composition that immediately communicates:

1. This is Beans.
2. It is for dogs, cats, and horses.
3. It brings everyday observations, conversations, and care records together.

On desktop, balance a large editorial text area with a substantial companion-led product scene. Give the artwork enough scale to feel present rather than like an illustration pasted into a small card.

Build the scene around:

- The existing expressive golden dog, orange-and-white cat, and horse artwork.
- One restrained iPhone presentation showing a faithful Beans interface.
- A small number of ivory paper-like record surfaces.
- A quiet coral grounding shape or light wash, if useful.

Animals should feel grounded, with believable contact shadows. Gentle breathing, an occasional blink, a small head movement, or a brief greeting is enough. Avoid endless bobbing, spinning phones, floating animals, exaggerated bouncing, and constantly animated UI.

Do not crop through ears, paws, tails, or the Beans logo to force the layout. Keep text and actions unobstructed.

If a supplied video has an opaque background, match the surrounding surface or use an intentional inset treatment. Do not expose accidental white squares in dark mode or claim the video is transparent.

## Copy and navigation

Use this opening copy:

**Eyebrow**

> Beans · Pet and Equine Care

**Headline**

> A little closer.\
> Better cared for.

**Supporting copy**

> Your animals, everyday moments, and care records. Together.

**Small supporting line**

> For the dogs, cats, and horses in your life.

**Primary action**

> Meet Beans

The primary action begins the guided hero tour described below. It must not imply that the website has opened a real AI conversation.

Keep navigation minimal: the supplied Beans identity, the theme control, and a clear tour action. Add full-page section navigation only when those sections exist.

Do not add fabricated App Store links, customer counts, star ratings, endorsements, clinical outcomes, or prices.

## Five-stage guided reveal

Retain the concept of five deliberate transitions, but make the tour optional.

The opening composition must be complete and useful without entering the tour. Do not intercept normal page scrolling by default.

After the visitor selects **Meet Beans**, activate a guided sequence within the hero. Each fresh forward wheel gesture, touch swipe, arrow-button activation, or relevant keyboard command advances one stage. Movement finishes automatically after input stops; it is not directly scrubbed by scroll distance.

Use six compositions: the opening state plus these five transitions.

### 1. Your animals, together

Gently widen the composition to include dog, cat, and horse with equal importance. Bring the selected-animal identity into focus on the phone.

Caption:

> Every story starts with your animal.

### 2. The everyday moments

Move attention toward the Organizer: a simple owner-entered log, a date, and an understandable record of the day.

Caption:

> Small moments tell a story.

### 3. A conversation with Beans

Reframe toward the Beans conversation view. Introduce the familiar logo, quiet controls, and the soft navy/coral/ivory horizon.

Caption:

> Talk it through. Keep what matters.

Show this as a clearly labeled product demonstration, not a live listening session. Do not request microphone or camera access.

### 4. A place for the details

Reveal the care notebook and a source-linked document view. Demonstrate reviewing a draft before saving it, rather than an AI making medical decisions.

Caption:

> Your notes. Their records. In context.

### 5. Your whole family

Return to a generous, balanced view of the three species and the product. Settle the composition rather than ending with a dramatic fly-away.

Caption:

> For all the little moments ahead.

End with a clear **Continue exploring** action. In this hero-only pass, it can end guided mode and settle the hero. When the rest of the page is added, connect it to the first content section.

Use curved, shallow camera-like movement and coordinated targets where the assets support it. Use layered translation and crossfade elsewhere. Never fake a camera move that reveals the limits of flat artwork.

Provide a subtle five-step indicator, with the opening represented as 0/5. Make stage controls understandable without relying on color alone.

## Hero animation architecture — required

Build the opening plus five hero stages as labeled compositions in a paused GSAP master timeline.

Use ScrollTrigger to manage the hero's active region and any necessary pinning. Use Observer behavior to interpret deliberate navigation gestures only after the visitor opts into the tour.

Do not use `scrub: true`, numeric scrub, or scroll snapping as a substitute for the required hero interaction.

Each accepted gesture should command a timed transition to the next or previous label, for example through `timeline.tweenTo()` or an equivalent controlled GSAP sequence.

The sequence must:

- Complete after input stops.
- Settle at the selected composition.
- Keep progress and caption state synchronized.
- Reverse coherently to the previous stage.
- Never wrap from the last stage back to the first.

Use approximately 0.8–1.3 seconds per cinematic transition, with a restrained GSAP ease such as `power2.inOut` or `sine.inOut`. Keep ordinary control feedback much faster.

Maintain explicit tour state: inactive, ready, transitioning, and exited.

One physical gesture must not advance multiple stages. Observer's tolerance alone is not sufficient momentum protection.

Track incoming wheel activity even while stage changes are locked. Rearm gesture advancement only after the transition has completed and a quiet input interval has elapsed since the latest wheel event. Touch must require release and a fresh qualifying swipe.

Normalize wheel and touch direction so the perceived forward action is consistent. Ignore repeated keyboard keydown events.

Do not intercept form controls, links, text selection, browser zoom gestures, or scrolling inside dialogs.

Previous, Next, Skip, and Escape must remain available. Skip and Escape immediately release guided input, even during a transition.

Coordinate with the active smooth-scroll system: suspend conflicting movement while guided mode owns input and restore normal scrolling without a jump.

After the final stage, release control into the page. Returning to the hero must not automatically reactivate gesture capture.

Use SplitText only for selected heading/caption reveals. For pointer-responsive details, use bounded GSAP `quickTo()` or equivalent retargeting rather than creating an unbounded stream of tweens.

## Input and accessibility

The transition lock applies only to tour progression. Never disable navigation, focus movement, Escape, or Skip tour.

Support backward movement one stage at a time. Provide visible Previous, Next, and Skip controls so gestures are never required.

On smaller screens, prefer button-led scene changes and a simpler layout rather than aggressive swipe capture.

For reduced motion, disable gesture capture and remove camera travel, parallax, tilt, and ambient character playback. Present the same story through simple controls, immediate state changes or short crossfades, and static poster fallbacks.

Allow content to grow beyond the viewport at large text sizes. Never shrink text or hide actions to preserve a full-screen effect.

## Motion and optional audio

Use one brief welcome animation, then let the composition settle. Existing animal greetings may play once and replay through an explicit control. Any ambient loop must be subtle, bounded, and paused offscreen.

If audio generation is available, create an original, quiet, warm ambient bed: soft felt-like tones, airy texture, and gentle room-like warmth.

No suspense drones, engine hum, heartbeat monitor sounds, barking loops, or urgent notification cues.

Audio is optional and off by default. Begin only after the visitor explicitly enables sound. Provide a clearly labeled toggle, prevent overlapping cues, and pause when the page is hidden.

Do not make audio a dependency for understanding the tour.

## Product truth and completion criteria

All example animals, notes, charts, and conversation content must be clearly identified as illustrative where they could be mistaken for real activity.

Beans is not a replacement for a veterinarian. Do not invent diagnoses, treatment recommendations, clinical clearance, emergency assessments, insurance guarantees, or live tracking capabilities.

Keep important content visible if animation, video, or advanced rendering fails.

Inspect the hero at desktop and mobile sizes. Verify navigation, theme switching, stage progression, reverse movement, residual trackpad momentum, keyboard access, Skip, reduced motion, media failure, and loading behavior.

Run the actual supported build and deployment checks available in Runable. Report what was verified and any missing assets or configuration honestly. Include the shared GSAP brief's animation handoff.
