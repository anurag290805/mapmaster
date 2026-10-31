# CP03 responsive verification

Brave on localhost, using viewport override. P means partial: document scroll-width measurement only; V means a screenshot was visually inspected; U means unverified. Because of browser scaling, measured 391 and 1367 pixels are one pixel wider than the requested widths.

| Screen / CSS viewport | 360×800 | 391×844 | 768×1024 | 1367×768 | 1920×1080 |
|---|---|---|---|---|---|
| Home | P, V | P | P | P | P, V |
| Play hub | P | P | P | P | P |
| Scope selection | P | P | P | P | P |
| Country and continent selection | U | U | U | U | U |
| Setup and game | U | U | U | U | U |
| Onboarding, settings, help, results | U | U | U | U | U |

Home, Play and scope measured no document-level horizontal overflow. Mobile header and menu visually inspected at 360 width; desktop home visually inspected. This is not proof that all controls fit or that there is no clipping. Screenshots were displayed for inspection but not saved. Landscape, 200% text scaling, physical touch, mobile keyboard, and full screen-by-screen responsive checks remain outstanding for CP03 review/CP11.

## Targeted visual re-verification — 2026-10-31

Brave viewport override at 100% browser zoom; screenshots were inspected in the tool, not saved. These are individual screen observations, not a complete screen-by-viewport matrix.

| Requested viewport | Visually inspected | Observation |
|---|---|---|
| 360 × 800 | Home, initial viewport | Header, hero text and actions visible; page continues vertically. |
| 390 × 844 | Settings and onboarding dialogs | Dialog content and visible actions fit; onboarding replayed and completed. |
| 768 × 1024 | Play | Four mode cards and help notice visible; mobile menu used. |
| 1366 × 768 | Play, initial viewport | Header and first three cards visible; remaining content requires scrolling. |
| 1920 × 1080 | Help | Heading, disclosures and replay button visible. |

Actual controls, scroll behavior, focus and dialogs were not exhaustively checked for every screen and size; game, results and selection screens across the matrix remain unverified. Physical devices, landscape and text scaling remain open. Viewport override was reset after inspection.
