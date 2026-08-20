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
6. `docs/DATA_PUBLISHING.md` — explicit runtime publication and rollback contract.

## Project Operator

For Google Sheets administration, source-data operations, or voice-style
commands, read `admin/mehmet-operator/SKILL.md` before acting. This directory is
the navigation layer; the existing project documents remain the sources of
truth for domain rules.

## Fast Commands

- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:strict`
- `npm run test`
- `npm run test:images`
- `npm run validate:data`
- `npm run validate:images`
- `npm run publish:data:dry-run`
- `npm run preflight:fast`
- `npm run preflight`

If you need a production build, stop any active dev server first. A running dev process can lock `.next/trace` on Windows.

## Local Tooling

- The repository may include a local Windows Node runtime in `.tools/node`.
- If `npm` is not available in the shell, prepend it before running commands:
  `$env:PATH = "$PWD\.tools\node;$env:PATH"`
- `scripts/preflight.mjs` prefers `.tools/node/npm.cmd` and the bundled Codex Python runtime when present, so nested checks use local tools consistently.
- `scripts/publish_data.mjs` also prefers the bundled Python runtime and verifies that `pandas` and `openpyxl` are importable before downloading or parsing source data. Override it with `MEHMET_PYTHON` when running elsewhere.
- Agent guidance is editor-neutral and lives in `AGENTS.md`, `docs/AI_CONTEXT.md`, and nearby README files.

## Deployment

- The project is deployed on Netlify.
- `netlify.toml` runs `npm run preflight`, so every Netlify deploy must pass lint, type checks, tests, data/image validation, and the production build.
- A Git push to the deployment branch refreshes code, agent rules, and static photos.
- Normal table and `money.json` changes are published explicitly with `npm run publish:data`; they must not require a Git push or rebuild.
- Run `npm run preflight` locally before pushing deployment changes to catch failures before Netlify repeats the same gate.

## Git & Branch Management

- All branches are created **only with explicit user approval**.
- Agents (including Hermes, Codex, or any other AI) must not create,
  push, or delete branches without a direct user instruction.
- The production deployment branch is `main`. Netlify deploys from `main` only.
- Feature/working branches are created by the user when needed; agents work
  on the currently checked-out branch unless told otherwise.

## Source Of Truth

- Excel / Google Sheet is the source of truth for shipments, statuses, sizes, materials, and latest catalog prices.
- `data/shipments.json`, `data/products.json`, and `data/meta.json` are generated artifacts.
- `data/money.json` is manual and may be edited directly, but `npm run validate:data` validates its structure and amounts.
- `data/money.json` may contain both `deposits` and `pendingManual`; manual pending rows belong in `pendingManual`, not in generated shipment data.
- The runtime reads the last explicitly published Netlify Blobs bundle containing all four JSON files; repository JSON remains the publish input and build fallback.
- Do not read or mutate the Google Sheets `Оплаты` tab as part of data publishing.

## Data Publication

- Treat Google Sheets changes as a draft until the user separately confirms publication.
- Use the canonical `npm run publish:data` workflow; it refreshes the whole sheet, validates the full snapshot, and atomically replaces the current Blob bundle.
- `npm run publish:data:dry-run` must not fetch the sheet or write external state.
- Never publish a data bundle that references a photo absent from the current deployment. Photo changes still deploy through Git first.
- See `docs/DATA_PUBLISHING.md` and the confirmation protocol in `admin/mehmet-operator/references/workflows.md`.

## Domain Rules

- Status text is stored 1:1 from Excel.
- Payment logic is derived from text status plus `paidPreviously` / `noPayment`.
- Stable position IDs are built from `shipmentId + index`.
- `isPayable` controls sums and price-gap logic.
- The parser emits `cost` from Excel column N only when column J (`Курс списания`) is positive; a blank, zero, or negative J means cost is still unknown.
- Columns N and O are formula-driven on every position row. N distributes the latest explicit positive cargo marker from M only inside the current shipment and its current M block; equal cargo amounts in different blocks stay independent. N also requires a calculated positive K: cargo may be entered in M before the rate is known, but while J is not positive, K, N, O, and the shipment total Q stay blank. Missing cargo leaves N and O blank, so zero sentinels in M are not used.
- Excel column P accepts either an actual receipt date or free-form ETA text. When a shipment contains only dates, the parser uses the latest date; any text value is treated as ETA and takes priority.
- Column Q is formula-only at each shipment start. It finds the next shipment boundary from A, sums numeric O values for the current shipment, and stays blank while O has no calculated values. Do not author manual `SUM(Ox:Oy)` ranges.
- Work screen is shipment history by year, not only current work-in-progress.
- Parser categories must stay within `Мех`, `Замша`, `Кожа`, `Экзотика`; unknown names should fail parsing instead of falling back to `Прочее`.
- Shipment size keys must stay within `xs`, `s`, `m`, `l`, `xl`, `OneSize`; unknown keys should fail validation instead of falling back to another size.
- `sample` is only a marker; it must not force quantity to `1` when sizes or Excel column G already define the quantity.
- `underQuestion` is an independent position marker parsed from `под вопросом`
  in the final column C bracket. It may coexist with `sample`, sizes, or
  `(N шт.)` and must not change quantity, status, or payment logic.
- Excel column G is computed and must not be replaced with manual quantities. When the total is known but sizes are not, encode it in the final column C suffix as `(10 шт.)`; the parser emits `sizesUnknown` and the same positive `quantityOverride`.
- Every source position represents at least one item; without sizes or an explicit `(N шт.)` suffix, quantity falls back to `1`.
- When adding a repeated position without an explicitly stated price, copy H
  from the nearest previous row whose column C has the same cleaned product
  name (the final size/quantity bracket is ignored). An explicit new price
  overrides this default; never rewrite older shipment prices.
- Excel column I is formula-only: `G × H`, but blank when H is empty or `0`.
  Keep the formula present in both cases.
- Excel columns K and L are formula-only. K calculates unit cost without cargo
  from H and the latest explicit J marker inside the current shipment only;
  the shipment starts at the latest non-empty A on a position row. A J formula
  counts as a marker even while it returns blank. Missing, zero, or negative
  rates leave K blank. L is `K × G` and stays blank with K. Never use a zero in
  J merely to stop a previous shipment's rate from leaking downward.
- Catalog `photo` is optional. The parser writes it only when the matching JPG/JPEG exists; `excelRows` records every source row for startup diagnostics.
- Missing catalog photos are valid and use the shared `__photo_pending` placeholder. A present-but-broken `photo` path remains a validation error.
- Product grids and the home menu use square contain `webp/card` variants; product detail uses full `webp`. Keep the fallback chain card WebP → full WebP → exact source JPG/JPEG → shared placeholder.
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
- In `Work`, year headers toggle their year. A shipment toggles from its whole
  card surface except nested product links or other interactive controls; its
  header remains the keyboard-accessible control with `aria-expanded`.
- In `Work`, keep `YearGroup` thin: `YearHeader` owns the yearly summary UI and `YearShipmentsSheet` owns the expanded shipment list.
- In `Work`, the whole first position cell is the navigation target to the product page; numeric cells are not navigation controls.
- The category pill on `ProductDetail` is a real navigation control to `/catalog?category=...` and should look clickable.
- Keep `ProductDetail` thin: photo behavior belongs in `components/product/ProductPhoto.tsx`, product facts in `ProductInfo.tsx`, and materials in `ProductMaterials.tsx`.
- Keep `MoneyScreen` screen-level: reusable financial card/table UI belongs in `components/money/`.
- Motion is centralized in `constants/styles.ts` via `MOTION`; prefer shared timing/easing over ad-hoc inline values.
- Shared page layout belongs in `components/ui/PageFrame.tsx` and repeated intro UI in `PageIntro.tsx`.
- App typography is role-based through `FONT_FAMILIES`: `display` (`Lora`) owns headings and reading text, while `ui` (`Manrope`) owns amounts, metrics, tables, badges, and compact controls. Do not introduce local font stacks outside these shared tokens.
- Shared hover/focus behavior lives in `app/globals.css`; do not recreate per-card DOM mutation helpers.
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
