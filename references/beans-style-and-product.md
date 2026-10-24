# Beans style and product reference

This is a landing-page adaptation of the reviewed `Beans-iOS` source and committed visual references. It is not a release certification, clinical evaluation, or substitute for current approved product decisions.

## Creative direction

**Cinematic Beans, not a pet-themed luxury-jet site.**

Keep the original brief's depth, choreography, and production quality. Replace its darkness and exclusivity with warmth, familiarity, and thoughtful care.

The app's design language is **The Care Companion**: warm, reassuring, precise, softly tactile, and selectively playful.

### Palette

| Role | Value / treatment |
| --- | --- |
| Beans Ivory | `#FDFDFA` |
| Beans Navy | `#051D38` |
| Beans Coral | `#FF584F` |
| Raised light surfaces | White |
| Secondary text | Muted blue-gray, checked against the actual background |
| Dark appearance | Navy with restrained coral warmth, ivory headings, and ivory reading cards |

### Typography and surfaces

- Supplied Beans wordmark; never recreate it as ordinary text.
- System-serif editorial headings and system sans-serif controls/body copy.
- Approximately 24px main-panel and 18px primary-button corners as web adaptations, not new native app tokens.
- Coral primary actions with navy text and generous targets.
- Soft layering, selective shadows, and limited floating-control translucency.
- No metallic edges, cyber-grid, near-black aviation atmosphere, or wall-to-wall glass.

### Motion

- A brief welcome, then a settled composition.
- Expressive animal greetings rather than endless bobbing.
- GSAP-controlled scene choreography and ScrollTrigger-controlled scroll sections.
- Optional gesture-led hero; normal document scrolling elsewhere.
- Motion does not imply an animal is healthy, a save succeeded, or a service is active.
- Reduced motion keeps content available without spatial travel or forced pinning.

## Existing voice

The following welcome copy is taken from the reviewed app source:

> A little closer.\
> Better cared for.

> Your animals, everyday moments, and care records. Together.

> For the dogs, cats, and horses in your life.

Other app-derived lines include:

- "Every story starts with your animal."
- "Small moments tell a story."
- "Clarity, page by page."
- "A conversation. On your terms."

Other editorial captions in the prompts are proposed landing-page copy, not evidence of an implemented feature or validated outcome.

## Product context and boundaries

- The product name is **Beans Pet and Equine Care**.
- Dog, cat, and horse support belongs in the story; do not reduce equine support to an afterthought.
- The reviewed signed-in navigation is **My Pets, Beans, and Organizer**, in that order.
- Insurance is reached separately rather than presented as a fourth current tab.
- The selected animal is the organizing context for records, conversation, and documents.
- Owner-authored observations, assistant drafts, owner-reviewed saved notes, and source documents are distinct.
- Logging rings describe recorded amounts toward owner-set goals, not health scores.
- Missing chart data is not zero.
- AI sharing and conversation-memory controls are separate choices.
- The app's use of an external AI service must not be described as wholly on-device processing.

Before publication, verify feature availability and release-facing statements against the current app. Older design documents and screenshots contain superseded navigation, fixtures, and implementation states.

Do not invent:

- Diagnoses, prescriptions, dose calculations, treatment changes, or clinical clearance.
- Emergency screening availability or veterinary/provider acceptance.
- Live pet tracking, connected-device telemetry, battery status, or safe-zone certainty.
- Insurer guarantees, coverage decisions, or autonomous claim submission.
- Clinical outcomes, customer counts, testimonials, ratings, or endorsements.
- Public App Store availability, prices, release dates, or fabricated contact/legal links.
- Security certifications, universal privacy guarantees, or claims that nothing leaves the device.

The marketing site must not act as a veterinary service. Do not generate clinical advice for demonstration content or solicit private animal-care records through its contact form.

## Reviewed source locations

Paths below are relative to the separate `Beans-iOS` repository:

| Source | What it establishes |
| --- | --- |
| `DESIGN.md` | Palette, typography, surface language, motion, and subsequent design corrections |
| `PRODUCT.md` | Intended product scope, species inclusion, and product principles; some implementation inventory is historical |
| `README.md` | Implementation status and evidence references; older sections are historical |
| `BeansVet/Sources/DesignSystem/BeansTheme.swift` | Actual theme primitives, adaptive canvas, panels, and controls |
| `BeansVet/Sources/App/BeansOnboardingView.swift` | Current welcome copy, species line, and account/contact entry |
| `BeansVet/Sources/App/BeansRootView.swift` | Current three-tab navigation and separate Insurance destination |
| `BeansVet/Sources/DesignSystem/BeansAnimalAnimation.swift` | Local animal media, posters, one-shot playback, and lifecycle handling |
| `BeansVet/Sources/Conversation/BeansVoiceGradient.swift` | Navy/coral/ivory rendered-audio horizon behavior |
| `BeansVet/Sources/Features/BeansOrganizerInsightsView.swift` | Recorded logs, owner goals, chart gaps, and record provenance |
| `BeansVet/Sources/DesignSystem/BeansAISharingView.swift` | External AI sharing and separate memory controls |

The source inspection and committed images informed these prompts. No fresh iOS runtime acceptance or website implementation was performed as part of authoring them.
