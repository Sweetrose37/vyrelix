# Vyrelix UI System

The UI system is dependency-free and designed exclusively for portrait phone widths from 320px to 430px. Component CSS layers on top of `css/components.css`; component JavaScript uses native ES modules and browser APIs.

## Design tokens

`css/variables.css` is the customization boundary. It defines semantic colors, a 2–56px spacing scale, five radius levels, five shadow/elevation treatments, disabled and backdrop opacity, three blur levels, glass fills, branded gradients, font families and weights, motion durations, easing curves, and the 48px minimum touch target.

Change tokens instead of individual components when re-theming. The optional `data-theme="soft"` token override provides the existing light appearance without changing component markup.

## Buttons

Styles: `css/components/buttons.css`  
Behavior: `js/components/buttons.js`, `js/components/loading.js`, `js/animations.js`

- Core variants: `.button--primary`, `.button--secondary`, `.button--outlined`, `.button--ghost`, `.button--danger`, and `.button--success`.
- Product variants: `.button--generate`, `.button--copy`, `.icon-button`, `.icon-button--favorite`, and `.fab`.
- States: native `disabled`, `.is-loading`, `aria-busy`, pressed scaling, hover lift, and `.ripple`.
- Behaviors: add `data-favorite` for an accessible favorite toggle, `data-demo-loading` for the reusable loading example, or call `setButtonLoading(button, state)` directly.

Every button must retain a visible label or `aria-label`. Touch size is enforced by the shared `--touch-target`.

## Cards

Styles: `css/components/cards.css`  
Behavior: `js/components/cards.js`

Available patterns include standard, glass, elevated, interactive, character, image, history, settings, and prompt cards. `createCard()` creates a safe basic card. `renderInBatches()` lazily renders large local lists during idle browser time. Interactive non-button cards require `tabindex="0"`, a descriptive label, and keyboard activation.

Use `.card-lift` and `.card-expand` for opt-in motion. Character cards can add `data-gesture-card` to enable swipe, hold, and double-tap behavior.

## Forms and search

Styles: `css/components/forms.css`  
Behavior: `js/components/forms.js`

The system includes text fields, search, native selects, expandable dropdowns, text areas, switches, choice toggles, sliders, checkboxes, radio controls, and steppers.

- Wrap native fields with `.field`.
- Add `.field--error` plus `aria-invalid="true"` for invalid values.
- Add `.field--success` for confirmed values.
- Use `.field-message` for helper, error, or success text.
- Use native `disabled` for unavailable controls.
- Add `data-expandable-select` to the documented button/listbox structure.
- Add `data-stepper`, `data-min`, and `data-max` to a number-picker.
- Add `data-range` and `data-range-output` to synchronize a slider label.

`createSearchController()` provides live search, a clear action, accessible suggestions, arrow-key navigation, Escape dismissal, and outside-tap dismissal.

## Tabs and navigation

Styles: `css/components/navigation.css`  
Behavior: `js/components/tabs.js`, `js/navigation.js`

Tabs use a `[data-tabs]` container, buttons with `role="tab"` and `data-tab`, and panels with matching `data-tab-panel`. The controller manages selection, `tabindex`, hidden panels, scrolling, arrow keys, Home/End keys, and the sliding indicator.

Application screens retain the existing `data-screen` and `data-route` contract. Navigation owns browser history and announces route changes through the `vyrelix:route` custom event.

## Modals

Styles: `css/components/modals.css`  
Behavior: `js/components/modals.js`

`openModal(variant, overrides)` supports confirmation, delete, success, error, information, image-preview, and prompt-preview patterns. The controller manages focus restoration, focus trapping, Escape, backdrop dismissal, semantic styling, and action labels. Use `closeModal()` for explicit dismissal.

Dynamic copy must be passed through `textContent`-based properties; do not inject user-authored HTML.

## Bottom sheets

Styles: `css/components/modals.css`  
Behavior: `js/components/bottomSheet.js`

`openBottomSheet({ size, heading, content })` opens half or full sheets. The handle supports vertical drag-to-dismiss. Sheets also support animated opening/closing, backdrop blur, Escape, outside-tap dismissal, focus trapping, focus restoration, and safe-area padding.

## Drawers

Styles: `css/components/modals.css`  
Behavior: `js/components/drawer.js`

The markup provides side, bottom, settings, and history drawer patterns. Open a drawer with `data-open-drawer="<name>"`, and close it with `data-close-drawer`, Escape, a route action, or the backdrop. Focus remains trapped inside the active drawer and returns to its trigger.

## Toasts

Styles: `css/components/toast.css`  
Behavior: `js/components/toast.js`

Call `showToast(message, type, duration)`. Types include `copied`, `saved`, `deleted`, `error`, `loading`, and `success`. Notifications use the existing polite live region, semantic icons, an animated lifetime indicator, and a non-blocking exit transition.

## Loading

Styles: `css/components/animations.css`  
Behavior: `js/components/loading.js`

The system includes the existing splash loader, spinner, skeleton cards, skeleton images, determinate and indeterminate progress, generate-animation specimen, and button loading state. Skeletons are hidden from assistive technology; meaningful loading controls use `role="status"`, `aria-label`, or `aria-busy`.

## Empty states

Behavior: `createEmptyState(type)` in `js/components/loading.js`

Supported types are `characters`, `images`, `favorites`, `history`, `search`, and the combined `saved` collection. The factory creates safe DOM nodes and standardized accessible copy.

## Gestures

Behavior: `js/components/gestures.js`

`initializeGestures()` provides opt-in swipe left/right, long press/touch hold, double tap, and pull-down refresh. Gesture cards always retain keyboard activation and visible buttons; gestures are enhancements, never the only way to perform an action.

## Motion

Styles: `css/animations.css`, `css/components/animations.css`

Reusable motion includes fade, scale, zoom, bounce, slide up/down, ripple, pulse, glow, card lift, card expand, floating controls, screen transitions, navigation transitions, skeleton shimmer, and progress travel. All animations use transform/opacity where possible and are disabled by both the system reduced-motion preference and the Vyrelix animation setting.

## Dependencies

There are no third-party runtime or build dependencies. The system requires a modern browser with ES module support. Optional APIs such as `requestIdleCallback`, `crypto.randomUUID`, and the Clipboard API have native fallbacks.
