# Components

`css/components.css` provides `.mm-button` (primary, secondary, ghost, danger, small, large and native disabled), cards (standard, featured, selected, compact), fields, badges, progress, notices, tabs, native dialog and toast. HTML uses semantic buttons and labels. Loading example is a disabled busy button; skeleton is a static placeholder. Example values are not player data.

`design-system.html` is an unlinked, deliberately public showcase; it is a normal static file and will be publicly reachable if the whole directory is deployed. `js/showcase.js` is an isolated IIFE: theme preview, native dialog, live toast and arrow-key tabs. Escape/focus restoration relies on native dialog behavior and the explicit close listener. Help is now a keyboard/touch disclosure and does not depend on hover. Native checkbox, radio and select controls are used. Further switch styling and menus are deferred; no claim that every proposed variant is complete.

## Completion follow-up

Interactive examples use native buttons, including selected (`aria-pressed`) and disabled cards; Enter/Space activate native enabled buttons. Danger, loading/disabled, warning, error, success, empty, progress, invalid-field and static skeleton examples are shown. The explanatory help is a click/touch/keyboard disclosure with an explicit expanded state and Escape handling, avoiding hover-only information. `js/notifications.js` supplies `create(element, liveRegion)`, `show(message, duration = 0)` and `dismiss()`; it cancels prior timeouts and uses text content for announcements. The showcase demonstrates persistent notifications with user dismissal. Timed dismissal is optional and should not be used for essential information. No player data is used.

Deployment decision: `design-system.html` is a deliberately public design-system page when the static site is published, clearly labeled as examples. There is no build/exclusion mechanism assumed. It is not linked from the game's navigation.
