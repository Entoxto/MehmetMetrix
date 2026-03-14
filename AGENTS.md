# AGENTS.md

## Purpose

This repository is an internal control panel for Mehmet Metrics:
- work tracking by shipment/year,
- money tracking for unpaid shipments and deposits,
- product catalog with photos, sizes, materials, and prices.

## Read Before Editing

1. `README.md` — project overview, commands, architecture.
2. `docs/AI_CONTEXT.md` — domain invariants and editing rules for agents.
3. `data/README.md` — source-of-truth rules for generated/manual JSON files.

## Fast Commands

- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:strict`
- `npm run validate:data`
- `npm run validate:images`
- `npm run preflight:fast`
- `npm run preflight`

If you need a production build, stop any active dev server first. A running dev process can lock `.next/trace` on Windows.

## Source Of Truth

- Excel / Google Sheet is the source of truth for shipments, statuses, sizes, materials, and latest catalog prices.
- `data/shipments.json`, `data/products.json`, and `data/meta.json` are generated artifacts.
- `data/money.json` is manual and may be edited directly.

## Domain Rules

- Status text is stored 1:1 from Excel.
- Payment logic is derived from text status plus `paidPreviously` / `noPayment`.
- Stable position IDs are built from `shipmentId + index`.
- `isPayable` controls sums and price-gap logic.
- Work screen is shipment history by year, not only current work-in-progress.
- Parser categories must stay within `Мех`, `Замша`, `Кожа`, `Экзотика`; unknown names should fail parsing instead of falling back to `Прочее`.

## UI Rules

- Non-clickable information should not look like buttons.
- Mobile UI should be calmer and denser, not just a squeezed desktop.
- Reuse tokens from `constants/styles.ts` before adding local inline styles.
- If a pattern repeats across screens, extract it.
- Brand in `Shell` (`MM` / `Mehmet Metrics`) always routes to `/`.
- Back navigation is stateful: `Shell` first uses in-app history from `lib/navigationHistory.ts`; reaching `/` resets that history.
- Product pages may use explicit back behavior (`backMode="explicit"`) to preserve origin context from `Work` / `Catalog`.
- In `Work`, only year headers and shipment headers toggle expansion.
- In `Work`, the whole first position cell is the navigation target to the product page; numeric cells are not navigation controls.
- The category pill on `ProductDetail` is a real navigation control to `/catalog?category=...` and should look clickable.
- Motion is centralized in `constants/styles.ts` via `MOTION`; prefer shared timing/easing over ad-hoc inline values.
- New animations must stay subtle and respect `prefers-reduced-motion`.
- Staggered entrance is acceptable for lists and page sections, but avoid decorative motion that competes with data.

## Editing Rules

- Keep business logic in `lib/`, not inside page components.
- Keep generated-data assumptions documented when behavior changes.
- If you change visible terminology, update docs and nearby UI consistently.
- Prefer smaller public APIs: do not export helpers unless another module really needs them.
- After changing source-of-truth rules, visible wording, or adaptive behavior, sync `README.md`, `data/README.md`, and `docs/AI_CONTEXT.md` in the same pass.
- If you change navigation or motion behavior, document both the UX intent and the technical contract in the same pass.
