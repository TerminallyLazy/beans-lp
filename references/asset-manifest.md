# Beans asset upload manifest

The source assets live in the separate **Beans-iOS** repository. They are not copied into this prompt repository.

Upload selected files to Runable before building. Mentioning a source path in a prompt does not make the file available to the builder.

## Identity

Source root: `BeansVet/Resources/BeansAssets.xcassets/`

| Asset set | Intended use |
| --- | --- |
| `BeansLogoHorizontal.imageset` | Navigation and wider brand placements |
| `BeansLogoStacked.imageset` | Conversation demonstration and taller compositions |
| `BeansMark.imageset` | Compact identity placements |
| `BeansWordmark.imageset` | Wordmark-only placements where appropriate |

Choose suitable resolution and appearance variants from each set. Preserve proportions, transparency, and the supplied mark/wordmark relationship. Do not recolor blindly or stretch to fit.

## Species artwork

Source root: `BeansVet/Resources/BeansAssets.xcassets/`

| Asset | File / purpose |
| --- | --- |
| Dog | `TrackingDog.imageset/TrackingDog.png` |
| Cat | `TrackingCat.imageset/TrackingCat.png` |
| Horse | `TrackingHorse.imageset/TrackingHorse.png` |
| Waving dog | `DogWaveOverlay.imageset/dog-wave-overlay.png` |
| Dog paws | Selected files in `DogPawsOverlay.imageset` |
| Cat peek | Selected files in `CatPeekOverlay.imageset` |
| Flat-paw cat | `CatPerchOverlay.imageset/cat_perch.png` |

Check the chosen overlay against the intended composition. Keep complete anatomy and do not clip across paws to simulate a perch. Species artwork is decorative, not a photograph of a visitor's own animal.

## Existing animal motion and posters

Source root: `BeansVet/Resources/Animations/`

| Species | Light media | Dark media |
| --- | --- | --- |
| Dog | `BeansDogLight.mp4` + `BeansDogLightPoster.png` | `BeansDogDark.mp4` + `BeansDogDarkPoster.png` |
| Cat | `BeansCatLight.mp4` + `BeansCatLightPoster.png` | `BeansCatDark.mp4` + `BeansCatDarkPoster.png` |
| Horse | `BeansHorseLight.mp4` + `BeansHorseLightPoster.png` | `BeansHorseDark.mp4` + `BeansHorseDarkPoster.png` |

Inspect the actual clips before deciding whether they loop. Existing greetings should play once unless their endpoints are genuinely compatible. Keep the correct poster visible before decoding and after failure.

Opaque media is not transparent. Use a matched ground or intentional inset treatment so light media does not become an accidental square on a dark canvas. Preserve the subject's full framing.

## Interface and appearance references

Useful committed visual references include:

- `.impeccable/review/onboarding/phone-welcome-light.png`
- `docs/evidence/my-pets/overview-dog-light.png`
- `docs/evidence/my-pets/overview-horse-dark.png`
- `.impeccable/review/care-release/final/Signed-in Beans direct entry - light.png`
- `docs/evidence/screenshots/notebook-lifecycle/live-notebook---dark.png`

These are composition and appearance references, not uniformly current release screenshots. Several contain fixture notices or historical tabs and notebook layouts. Verify the current source before recreating an interface.

Do not erase a fixture notice and republish the image as proof of a real account or live interaction. For marketing demonstrations, create a faithful accessible layout with illustrative data and a visible product-demonstration label.

Do not upload screenshots containing actual private owner or animal records. Use approved synthetic material.

## Missing assets and generation

- No aircraft GLB, jet footage, storm clouds, or aviation audio is needed.
- No genuine 3D animal model is assumed to exist.
- Reuse supplied artwork and clips before generating new media.
- Generate clean subject imagery separately from HTML interface text.
- Preserve species identity, anatomy, markings, and lighting between reference and animation.
- Keep a provenance record for generated or externally sourced assets, including prompt/origin and applicable usage rights.
- Verify model/tool availability in Runable rather than assuming GPT Image 2.5 or Seedance 2.5 is enabled.

## Release configuration, not visual assets

The following must be supplied or approved separately before the corresponding feature is published:

- A genuine app/download destination, if offered.
- A supported marketing/contact submission backend.
- Approved contact details and legal/privacy destinations.
- Subscription consent and processing configuration, if collecting marketing updates.

Never replace missing configuration with fabricated links, local-only success messages, or production care-record integrations.
