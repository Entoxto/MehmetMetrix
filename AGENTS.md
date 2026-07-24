# AGENTS.md

## Purpose

This repository is an internal control panel for Mehmet Metrics:
- work tracking by shipment/year,
- money tracking for unpaid shipments and deposits,
- product catalog with photos, sizes, materials, and prices.

## Read Before Editing

1. `README.md` — project overview, commands, architecture.
2. `docs/AI_CONTEXT.md` — domain invariants and editing rules for agents.
3. `docs/ARCHITECTURE.md` — module boundaries, ownership, dependency direction.
4. `data/README.md` — source-of-truth rules for generated/manual JSON files.
5. `docs/EXCEL_PIPELINE.md` — parser contract when changing data import.

## Fast Commands

- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:strict`
- `npm run test`
- `npm run test:images`
- `npm run validate:data`
- `npm run validate:images`
- `npm run preflight:fast`
- `npm run preflight`

If you need a production build, stop any active dev server first. A running dev process can lock `.next/trace` on Windows.

## Local Tooling

- The repository may include a local Windows Node runtime in `.tools/node`.
- If `npm` is not available in the shell, prepend it before running commands:
  `$env:PATH = "$PWD\.tools\node;$env:PATH"`
- `scripts/preflight.mjs` prefers `.tools/node/npm.cmd` and the bundled Codex Python runtime when present, so nested checks use local tools consistently.
- Agent guidance is editor-neutral and lives in `AGENTS.md`, `docs/AI_CONTEXT.md`, and nearby README files.

## Deployment

- The project is deployed on Netlify.
- `netlify.toml` defines the Netlify build command.
- A Git push to the deployment branch is the normal way to refresh the Netlify site.
- Run `npm run preflight` before pushing deployment changes.

## Source Of Truth

- Excel / Google Sheet is the source of truth for shipments, statuses, sizes, materials, and latest catalog prices.
- `data/shipments.json`, `data/products.json`, and `data/meta.json` are generated artifacts.
- `data/money.json` is manual and may be edited directly, but `npm run validate:data` validates its structure and amounts.
- `data/money.json` may contain both `deposits` and `pendingManual`; manual pending rows belong in `pendingManual`, not in generated shipment data.

## Domain Rules

- Status text is stored 1:1 from Excel.
- Payment logic is derived from text status plus `paidPreviously` / `noPayment`.
- Stable position IDs are built from `shipmentId + index`.
- `isPayable` controls sums and price-gap logic.
- If Excel column J (`Курс списания`) is `0`, the parser must not emit `cost` from column N; cargo-only formula results are not real себестоимость.
- Work screen is shipment history by year, not only current work-in-progress.
- Parser categories must stay within `Мех`, `Замша`, `Кожа`, `Экзотика`; unknown names should fail parsing instead of falling back to `Прочее`.
- Shipment size keys must stay within `xs`, `s`, `m`, `l`, `xl`, `OneSize`; unknown keys should fail validation instead of falling back to another size.
- `sample` is only a marker; it must not force quantity to `1` when sizes or Excel column G already define the quantity.
- Catalog `photo` is optional. The parser writes it only when the matching JPG/JPEG exists; `excelRows` records every source row for startup diagnostics.
- Missing catalog photos are valid and use the shared `__photo_pending` placeholder. A present-but-broken `photo` path remains a validation error.
- Product grids and the home menu use `webp/card`; product detail uses full `webp`. Keep the fallback chain card WebP → full WebP → exact source JPG/JPEG → shared placeholder.
- `public/images/products/jpg/` is the only manually maintained image source. Full/card WebP files are generated; `scripts/convert_to_webp.py` safely prunes derived `.webp` files whose JPG/JPEG source was removed.

## UI Rules

- Non-clickable information should not look like buttons.
- If an entire card is clickable, do not add an inner fake CTA button.
- Mobile UI should be calmer and denser, not just a squeezed desktop.
- Keep root layout request-independent: breakpoint correction happens on the client, and `headers()` / `cookies()` in `app/layout.tsx` would make every route dynamic.
- Reuse tokens from `constants/styles.ts` before adding local inline styles.
- Category-specific catalog accents should use `CATEGORY_VISUALS` from `constants/styles.ts`.
- If a pattern repeats across screens, extract it.
- Repeated clickable-card behavior belongs in `components/ui/ClickableCard.tsx`.
- Brand in `AppShell` (`MM` / `Mehmet Metrics`) always routes to `/`.
- Back navigation is stateful: `AppShell` first uses in-app history from `lib/navigationHistory.ts`; reaching `/` resets that history.
- Product pages may use explicit back behavior (`backMode="explicit"`) to preserve origin context from `Work` / `Catalog`.
- In `Work`, only year headers and shipment headers toggle expansion.
- In `Work`, keep `YearGroup` thin: `YearHeader` owns the yearly summary UI and `YearShipmentsSheet` owns the expanded shipment list.
- In `Work`, the whole first position cell is the navigation target to the product page; numeric cells are not navigation controls.
- The category pill on `ProductDetail` is a real navigation control to `/catalog?category=...` and should look clickable.
- Keep `ProductDetail` thin: photo behavior belongs in `components/product/ProductPhoto.tsx`, product facts in `ProductInfo.tsx`, and materials in `ProductMaterials.tsx`.
- Keep `MoneyScreen` screen-level: reusable financial card/table UI belongs in `components/money/`.
- Motion is centralized in `constants/styles.ts` via `MOTION`; prefer shared timing/easing over ad-hoc inline values.
- New animations must stay subtle and respect `prefers-reduced-motion`.
- Staggered entrance is acceptable for lists and page sections, but avoid decorative motion that competes with data.

## Editing Rules

- Keep business logic in `lib/`, not inside page components.
- Keep generated JSON imports on the server side; files marked `"use client"` receive prepared props and must not import the data loaders.
- Keep generated-data assumptions documented when behavior changes.
- If you change visible terminology, update docs and nearby UI consistently.
- Prefer smaller public APIs: do not export helpers unless another module really needs them.
- After changing source-of-truth rules, visible wording, or adaptive behavior, sync `README.md`, `data/README.md`, and `docs/AI_CONTEXT.md` in the same pass.
- If you change navigation or motion behavior, document both the UX intent and the technical contract in the same pass.
