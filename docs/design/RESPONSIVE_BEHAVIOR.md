# Responsive behavior

The showcase uses a 72rem maximum shell, fluid heading scale, three-column component grid and a single column at 700px. Game legacy breakpoints remain, with a 640px bridge and `100dvh` minimum height. Essential controls are not deliberately hidden; the showcase decorative aside is omitted on small screens. CSS focus and controls remain usable by keyboard in the tested samples.

Brave CSS viewport measurements for the showcase: 360×800, 391×844, 768×1024, 1367×768 and 1920×1080. In each, document scroll width was no greater than viewport width. 391 and 1367 are one pixel from requested widths due to browser scaling. This is not a full clipping, 200% text zoom, landscape, safe-area, device keyboard or physical touch audit; all game screens were not inspected at every size. Browser screenshots were visually inspected but not saved. Verify these in CP11.

## Follow-up screen matrix

P = partial: document width measurement only; V = visually inspected at the noted viewport; U = unverified. Measurements do not prove absence of clipping or touch usability. Approximate widths 391 and 1367 substitute for requested 390 and 1366 because of browser scaling.

| Screen / CSS viewport | 360×800 | 391×844 | 768×1024 | 1367×768 | 1920×1080 |
|---|---|---|---|---|---|
| Showcase | P | P | P | P | P, V desktop |
| Game home | P | P | P | P | P |
| Game typing/HUD | P | P | P | P | P |
| Game result | V | U | U | U | U |
| Setup, dialogs, other modes | U | U | U | U | U |

Long strings, 200% text scaling, landscape, mobile keyboard, full focus/hover states and physical touch remain unverified. Showcase and game are not accepted as comprehensively responsive based on width measurements.
