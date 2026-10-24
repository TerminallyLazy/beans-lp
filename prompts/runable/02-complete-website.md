# Beans — Complete the landing page

Complete the existing Beans landing page by adding **Everyday Care, Meet Beans, Your Whole Family, and Contact** sections, followed by a polished footer.

Apply the shared GSAP implementation brief supplied with this prompt. Preserve the completed hero, its visual identity, and its optional guided tour. Continue using Runable's supported managed project structure.

This is a marketing website for the Beans iPhone app, not a browser-based veterinary service and not a recreation of the entire app.

## Brand continuity

Continue the established Beans identity:

- Ivory `#FDFDFA`, navy `#051D38`, and coral `#FF584F`.
- Warm editorial serif headings and readable system sans-serif body text.
- Rounded paper-like surfaces, selective soft shadows, and tactile controls.
- Expressive supplied dog, cat, and horse artwork.
- A coordinated navy/coral dark appearance with ivory reading surfaces.

The tone is warm, clear, supportive, and precise. Write like a thoughtful companion, not a luxury concierge, medical authority, or exaggerated AI sales pitch.

Avoid generic "revolutionize pet care" language, promises of peace of mind, unsupported health outcomes, and claims that Beans always knows what to do.

Vary section scale and density. Do not turn every feature into an identical icon card.

## 1. Everyday Care — an interactive product reel

Create a vertically progressing product showcase inspired by a video-card reel.

Desktop composition:

- A large heading on the left.
- A central column of substantial product scenes.
- Concise synchronized descriptions on the right.

**Heading**

> Small moments.\
> A fuller picture.

**Introduction**

> A place for the observations, questions, and records that make up life with your animals.

Use five scenes grounded in the app:

### 1. My Pets

> A familiar place to begin.

Show the selected animal, a recognizable portrait, recent records, and clear entry points. Keep dog, cat, and horse support visible across the sequence.

### 2. Everyday observations

> Notice it. Keep it.

Demonstrate a simple owner-authored entry such as a walk or an everyday question. Include a date and animal identity. Do not invent a diagnosis or interpret a symptom.

### 3. Organizer

> The details, together.

Show a restrained timeline, owner-entered logs, and a reminder or care record. If rings or charts appear, explain that they represent recorded amounts toward owner-set goals—not a health score. Missing data must not appear as zero.

### 4. Care notebook

> Keep what matters.

Show a conversation draft moving into an owner review state, with editing and explicit confirmation. Distinguish assistant drafts from owner-reviewed saved notes.

### 5. Insurance documents

> Clarity, page by page.

Show a document associated with the correct animal and an exact source-page reference. Present document organization, not guaranteed coverage, a policy recommendation, or autonomous claim submission.

Use faithful app-derived layouts. Current app navigation is My Pets, Beans, and Organizer; Insurance is reached separately. Older screenshots may contain historical navigation. Do not treat every screenshot as a current release specification.

Rebuild demonstration text as real accessible HTML rather than asking image generation to render interface copy. Any illustrative data must be visibly identified.

As the visitor scrolls, move scenes through a central focal point. The active scene remains prominent; neighboring scenes are partially visible with restrained scale and opacity changes.

Keep the heading and description areas in place only while enough space is available. Synchronize scene changes with short text transitions and a numbered indicator.

### Required GSAP implementation

Build a labeled GSAP timeline controlled by ScrollTrigger, or one compatible BSMNT Scrollytelling Root.

On suitable desktop viewports:

- Pin the section's composition wrapper.
- Scrub the central reel through its five product scenes.
- Derive active card, description, and numbered progress from the same timeline.
- Use `ease: "none"` for the primary scroll-to-position mapping.
- Keep any separately triggered text transitions short and coordinated.
- Calculate travel distance and scroll range from the actual layout.
- Release naturally after the final scene.
- Preserve coherent reverse scrolling.

This section follows normal document scrolling. Do not apply the hero's gesture lock here.

On mobile, use a readable sequential layout or a simple controlled reel. Do not compress three desktop columns onto a narrow screen.

For pointer devices, optional hover feedback may lift a scene by a few pixels with no more than a very small tilt. No metallic edge glow. Disable tilt for reduced motion.

If a scene opens a detail view, make it an accessible dialog with a visible close action, Escape support, focus containment, and focus restoration. Details must add useful information rather than merely enlarging the same card.

## 2. Meet Beans — a conversation, on your terms

Create one expansive feature section that gives the page a quieter, more intimate rhythm.

**Heading**

> A conversation.\
> On your terms.

**Supporting copy**

> Talk, type, or share what you're seeing. Review the notes you want to keep.

Use a large rounded media composition that begins inset and gently expands as it enters view. Keep a soft corner treatment; it does not need to become a hard-edged full-bleed cinema screen.

Feature a faithful Beans conversation demonstration:

- The supplied Beans logo.
- Clear animal context.
- Recognizable voice, camera, and keyboard controls.
- A compact care-notebook affordance.
- The soft navy/coral/ivory horizon.
- A short draft-and-review moment.

Use existing animal media alongside the interface where appropriate. Do not manufacture a fake camera feed and label it live.

A recorded demonstration must say **Product demonstration** or equivalent. Listening, microphone levels, saved states, and camera activity must not masquerade as actual browser activity.

Never request visitor microphone or camera access for this landing-page demonstration.

### Required GSAP implementation

Use a separate ScrollTrigger-controlled timeline for the media frame's inset-to-expanded treatment, restrained internal parallax, and selected SplitText headline reveal.

Protect text from geometric stretching. Animate an outer composition or use a suitable clipping treatment rather than scaling readable interface text indiscriminately.

Do not directly scrub video `currentTime` unless the media is specifically encoded and tested for seeking. A normal visible-only video loop can sit inside the GSAP-driven frame.

### Supporting statements

Below or beside the feature, place three compact statements separated by quiet rules:

> Choose what you share.

> Review what you save.

> Keep your animal in context.

If explaining AI sharing, state plainly that an external AI service is involved. Do not claim that all processing stays on the phone, that nothing leaves the device, or that no data is retained.

AI sharing and conversation-memory controls are separate concepts. Do not collapse them into a single fictional privacy switch.

Keep language about owner control factual, without inventing security certifications or universal privacy guarantees.

**CTA**

> See how the notebook works

Connect it to a real explanatory detail view or the relevant product scene. Do not open a pretend AI chat.

## 3. Your Whole Family — a companion carousel

Create a softly dimensional carousel for dogs, cats, and horses.

**Heading**

> For the dogs, cats,\
> and horses in your life.

**Supporting copy**

> Different personalities. Different days. One familiar place to keep the details together.

Use three primary companion scenes:

- Dog.
- Cat.
- Horse.

Reuse the supplied species artwork and matching clips. This is not a breed catalog, a pricing comparison, or a claim that care is identical across species.

Arrange the scenes along a shallow arc on desktop:

- One larger, mostly upright active scene.
- Neighboring scenes slightly smaller, lower, and receding.
- Generous spacing and readable accompanying text.

When switching, move the arrangement as one coordinated composition. The incoming scene gently rises and straightens; the outgoing scene settles to the side.

Use restrained depth, not a spinning 3D wheel. Keep the animals grounded and preserve their anatomy.

### Required GSAP implementation

Use a GSAP timeline or retargetable tweens for the shallow-arc carousel.

Use Draggable when implementing horizontal dragging. Keep the active index as the shared source of truth for drag, arrow controls, direct selection, keyboard interaction, and synchronized captions.

Preserve vertical page scrolling during touch interaction. Keep any InertiaPlugin behavior bounded; do not allow uncontrolled spinning or skipping.

Provide visible arrow controls, keyboard access, direct selection, and touch swipes. Do not auto-advance. No essential information may depend on hover.

Use short, friendly labels, such as:

- "Everyday walks."
- "Quiet company."
- "Life beyond the stable door."

Treat these as editorial captions, not health or behavioral claims.

For the horse scene, preserve genuine equine inclusion without inventing transport clearance, emergency equine advice, or provider availability.

On mobile, reduce perspective and use one clear scene at a time. For reduced motion, use a static arrangement or a short crossfade.

Close with:

> Every story starts with your animal.

Use an actual supplied app destination if one is available. Otherwise link to Contact or updates without pretending the app is publicly downloadable.

## 4. Contact — a useful, honest close

Create a spacious closing section with an ivory canvas and a restrained coral wash. In dark appearance, use warm navy with quiet coral light.

Do not restore a storm-cloud background.

**Heading**

> A little closer starts here.

**Supporting copy**

> Have a question about Beans, or want to hear what's next?

Include:

- Name, optional unless genuinely required.
- Email.
- Interest: App updates, Product question, or Feedback.
- Message, optional for updates-only inquiries.

Adapt the submit label to the selected purpose, such as **Keep me updated** or **Send message**.

Use visible field labels, clear validation, accessible errors, loading feedback, and keyboard-friendly behavior. Preserve entered text after a failed submission.

Connect submissions only to an available supported marketing/contact backend with explicit configuration. Keep this separate from animal-care records and production clinical data.

Never display a success message unless the backend actually accepts the submission. Do not use a timer or local animation to simulate success.

If no backend is configured, show an honest unavailable state and report the missing configuration. Do not invent an email address or silently send information to an unrelated service.

Add a quiet note:

> Please don't include private care records or urgent veterinary questions here.

If collecting marketing subscriptions, provide appropriate separate consent and approved privacy information. Do not preselect consent or imply that a product inquiry subscribes someone to marketing.

Do not provide a fabricated veterinary hotline or suggest that this form is monitored for urgent animal-care needs.

Keep forms stable and readable. Use only restrained entrance animation and immediate, understandable validation feedback.

## 5. Footer

Finish with:

- The supplied Beans logo.
- "Pet and Equine Care."
- Navigation to sections that actually exist.
- Approved contact and legal links where supplied.
- The current copyright year.
- Theme control.
- Sound control only if audio exists.
- An accessible back-to-top action.

Use the correct logo variant for the background. Preserve its original proportions.

Do not invent social accounts, office addresses, legal policies, App Store URLs, or launch dates. Omit unavailable links and list them in the handoff.

Include a concise product boundary:

> Beans supports organization and conversation. It does not replace veterinary care.

Keep this readable without turning the footer into a wall of disclaimers.

Anchor navigation and back-to-top must use the active scroll system and remain interruptible. Correctly release an active hero tour before navigating elsewhere.

## Asset reuse and generation

Reuse the uploaded Beans artwork, animal animations, and posters before generating anything new.

Target a focused media set:

- Three reusable species clips: dog, cat, and horse.
- One approximately 5–10-second feature composition if it improves the story.
- Two short interface demonstrations rendered from faithful product layouts.

Existing one-shot greeting clips should remain one-shot unless they have a genuinely seamless loop. Do not force a visible jump back to the first frame.

If Runable exposes GPT Image 2.5 and Seedance 2.5, use them for genuinely missing visual assets. Otherwise use the supported tools actually available and report the substitution.

For generated animal footage:

- Use supplied artwork as the identity reference.
- Preserve fur colors, markings, eyes, ears, paws, tail, proportions, and material character.
- Use soft studio daylight and an ivory or coordinated navy environment.
- Prefer a blink, small head turn, subtle breathing, or gentle greeting.
- Avoid morphing, extra limbs, exaggerated expressions, medical procedures, distress, or frantic movement.
- Generate clean assets without logos, interface text, or baked-in captions.
- Keep subject framing consistent between posters and motion.

Do not generate replacement screenshots that invent product capabilities.

Optional audio must continue the hero's quiet, warm sound world. Respect one global sound setting, start only after explicit activation, and prevent repeated or overlapping cues. Hover sounds are unnecessary; silence is the default.

## Integration, performance, and accessibility

After the hero's final guided stage, the next forward action must continue naturally into Everyday Care. Skip must bypass the tour without losing access to content.

Returning to the hero must not unexpectedly capture scrolling or replay its introduction. Anchor navigation must release any active guided-input state.

Confine pinned layouts and carousel interactions to their own sections. Never trap document navigation.

Use optimized media with:

- Matching poster images.
- Muted inline video.
- Lazy loading below the first viewport.
- Playback only when visible.
- Offscreen and background pausing.
- Static fallbacks.
- Appropriate sizing and efficient formats.

Avoid running several video decoders or heavy visual effects simultaneously.

Respect reduced motion, reduced transparency where relevant, keyboard navigation, visible focus, screen readers, and readable contrast. Keep touch targets at least 44px. Maintain accessible HTML equivalents for important content.

## Completion and handoff

Inspect at desktop and mobile sizes, including a narrow phone viewport and enlarged text. Check:

- Hero entry and exit, including Skip and Escape mid-transition.
- Long trackpad momentum without skipped hero stages.
- All section links and browser history restoration.
- Theme switching without duplicate triggers.
- Reel progression, reverse scrolling, and release.
- Pin spacing after fonts and media load.
- Carousel controls and drag without blocking vertical touch scrolling.
- Dialog focus and dismissal.
- Contact validation, real success, and failure.
- Media loading, failure, and offscreen suspension.
- Reduced motion without smoothing or spatial travel.
- Layout shifts and horizontal overflow.
- Removal of development markers and debug controls.

Run the actual build and deployment checks supported by the managed project.

Finish with a concise handoff listing assets reused or generated, interactions verified, backend status, missing release links, and remaining limitations. Include the shared GSAP brief's library versions and plugin/tool usage report. Do not claim unperformed checks or a deployment that did not happen.
