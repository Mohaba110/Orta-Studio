# ORTA Studio — Design QA

## Findings

- No actionable P0, P1, or P2 differences remain in the final desktop pass.
- P3 / residual coverage: the approved source captures were exported at different pixel widths from the cloud-browser viewport, so the comparisons are normalized by width and judged on composition, hierarchy, typography, state, and asset fidelity rather than false pixel precision. No separate approved mobile source exists; responsive behavior is implemented at 1100 px and 760 px breakpoints, but exact mobile mock fidelity is not scoreable from the supplied visual truth.

## Source visual truth

- `reference/home-approved.png` — 878 × 1791 px
- `reference/services-approved.png` — 964 × 1631 px
- `reference/request-quote-approved.png` — 961 × 1636 px; the later user instruction supersedes its date-style Preferred Delivery control with `Standard / Priority / Flexible` and requires a taller Project Description field.
- `reference/tracking-approved.png` — approved Tracking visual; later exact helper copy is treated as the newer source of truth.
- `reference/admin-approved.png` — 1487 × 1058 px
- `reference/admin-project-approved.png` — approved Project Details visual; later `Mark as Completed` copy supersedes the earlier label.
- `reference/customer-project-approved.png` — 1486 × 1059 px; includes the approved subtle emphasis of the current `In Design` state.

## Browser-rendered implementation evidence

- `qa/browser-home.jpg` — 1348 × 2765 px, full desktop page
- `qa/browser-admin.jpg` — 1348 × 926 px, desktop viewport
- `qa/browser-customer.jpg` — 1363 × 936 px, desktop viewport
- `qa/browser-request-focus.jpg` — 1363 × 936 px, focused lower Quote form state with `Priority` selected
- `qa/browser-tracking.jpg` — 1363 × 936 px, desktop viewport

The cloud-browser CSS viewport used for the final interaction pass was 1363 × 936 CSS px. Full-page captures exclude the scrollbar from content width where applicable (1348 px). Device-scale factor is not exposed by the Work Mode browser surface; the source exports also do not declare a density. For comparison, source and implementation captures were resized to an equal 680 px content width while preserving aspect ratio. This normalization is used only for visual judgment, not for pixel-difference scoring.

## State

- Theme: approved white / black / orange ORTA visual system
- Language: English, with EN/TR toggle verified
- Customer project: `ORTA-260003 / Granola Pouch / Boreal Foods`
- Current status: `In Design`
- Admin: demo dataset, same ORTA-260003 continuity
- Quote focus evidence: `Priority` selected

## Full-view comparison evidence

- `qa/home-comparison-v3.jpg` — final Home composition against the approved Home visual.
- `qa/admin-comparison.jpg` — Admin Dashboard against the approved dashboard. `Last Activity` is present and there is no separate Open column/link.
- `qa/customer-comparison-final.jpg` — Customer Project against the approved customer visual, including Tracking navigation context and current-status treatment.

## Focused comparison evidence

- `qa/customer-status-focus-final.jpg` — status-track crop. The current step is orange, 750 weight, and uses a 39 px node versus 31 px for normal steps, preserving the user's request for only slightly stronger current-status prominence.
- `qa/browser-request-focus.jpg` — the exact user-requested Quote refinements are visible: taller Project Description and `Standard / Priority / Flexible`; no budget or pricing field is present.

## Required fidelity surfaces

- Fonts and typography: Manrope Variable is self-hosted; approved heavy headings, compact body hierarchy, wrapping, and small UI weights are retained. The Home hero heading was specifically corrected to the approved two-line desktop wrap.
- Spacing and layout rhythm: white space, square controls, thin dividers, open two-column compositions, and restrained density match the approved Material Focus direction. No extra cards or ornamental sections were introduced.
- Colors and visual tokens: implementation uses `#111111`, `#FF7A00`, `#6B6B6B`, `#F2F2F2`, white, and light neutral dividers. Orange remains an accent/state color rather than a dominant surface.
- Image quality and asset fidelity: Home and Services use the premium food-packaging raster asset; Concept Projects and production/material imagery are real raster assets rather than CSS/SVG substitutes. The hero packaging artifact found during QA was regenerated and rechecked.
- Copy and content: `Industrial Packaging Design`, `Concept Projects`, food-packaging-first positioning, the exact Project ID helper text, `Last Activity`, and `Mark as Completed` all match the latest approvals. No pricing, budget, FAQ, testimonial, blog, KPI, or other unapproved content appears.
- Icons and controls: visible functional icons use the Phosphor icon library; the process connectors were also converted from a text arrow to the same icon family.
- Accessibility/behavior: form fields are labeled, keyboard-capable forms retain submit handlers, rows support keyboard activation, images have alt text, disabled Final Approval is semantically disabled, and mobile navigation/status/table overflow patterns are defined.

## Comparison history

1. Home pass: hero heading wrapped to three lines instead of the approved two-line hierarchy (P2). Fixed the desktop heading width/size/line-height. Post-fix evidence: `qa/home-comparison-v3.jpg`.
2. Home asset pass: the generated olive carton contained an erroneous fake weight marking (P2 asset-fidelity issue). Regenerated the packaging hero, removed the artifact, and switched the UI to `public/images/packaging-hero-v2.png`. Post-fix evidence: `qa/browser-home.jpg` / `qa/home-comparison-v3.jpg`.
3. Customer pass: the Project Tracking navigation context was not underlined on the secure project route (P2 orientation/fidelity mismatch). Mapped `/project/[token]` to the Tracking active-nav state. Post-fix evidence: `qa/customer-comparison-final.jpg`.

No P0/P1/P2 visual fix was made after the final comparisons above.

## Primary interactions tested in the cloud browser

- EN ↔ TR language switch changes visible copy and switches back cleanly.
- Quote form: required fields, `Priority` selection, and successful demo submission returning `ORTA-260006`.
- Tracking: Project ID entry and successful secure-link request without revealing whether a record exists.
- Admin Dashboard: search filtering and whole-row navigation to Project Details.
- Project Details: `Mark as Completed` and admin message send.
- Customer Project: message send, Revision Request open/send, disabled Final Approval while status is `In Design`.
- Current Customer status is `In Design`, with the requested stronger-at-a-glance presentation.

## Console errors checked

The final clean browser tab was exercised through Home, Quote, Tracking, Admin, Project Details, and Customer Project. Filtering final console errors to the local implementation returned an empty list. An earlier non-secure-preview `crypto.randomUUID` compatibility error was fixed with a safe local UI-ID fallback before this final pass.

## Implementation checklist

- [x] Approved visual system and layouts implemented
- [x] User-requested micro-refinements applied without new UI sections
- [x] Core conversion and project-management interactions work
- [x] Secure token architecture and private file URLs implemented
- [x] Browser interaction pass completed
- [x] Typecheck, lint, and production build verified

final result: passed
