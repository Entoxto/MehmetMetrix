# AI Context

## Core Mental Model

The app has three user-facing areas:

1. `Work`
   Shows the full shipment history grouped by year.
   Includes current statuses, delivery state, and unpaid parts of shipments.

2. `Money`
   Summarizes what is still payable and what has already been deposited/prepaid.
   Detail rows can deep-link back into `Work`.

3. `Catalog`
   Shows product categories and product cards.
   Catalog prices are derived from shipment data, not authored independently.

## Important Terminology

- `shipment` / `поставка`
  The business object shown in Work. In code it wraps a `batch`.

- `batch`
  Internal domain object containing `positions`.

- `position`
  Internal row inside a shipment.

- `model`
  Preferred UI wording for catalog/work counters when talking about product variants.

- `unit`
  Physical item count, shown as `шт.`

## Data Pipeline

Excel / Google Sheet
-> `Excel/parse_excel.py`
-> in-memory catalog price update
-> in-memory validation
-> `data/shipments.json` + `data/products.json`
-> `data/meta.json`

`Excel/update_prices.py` remains as a repair/maintenance script for re-syncing catalog prices from existing shipments.

`data/money.json` is separate manual data.
It may contain:
- `deposits` for the right-side deposited/prepaid block
- `pendingManual` for manual extra rows inside `Всего к оплате`
`npm run validate:data` validates this manual file too; manual amounts must stay positive finite numbers.

## Invariants

- Statuses are text-first. Do not replace them with enum-only logic unless you preserve the original Excel text.
- Payment visibility depends on `isPayable` and the position status. A position without its own status inherits the shipment status; an explicit position status always decides its payment visibility.
- Manual payment rows from `money.json.pendingManual` are additive and should stay separate from generated shipment-derived pending items.
- Excel column J (`Курс списания`) guards cost import: import column N as `cost` only when J is positive. A vertically merged J cell applies its top-left value to every covered item row. A blank, zero, or negative J can leave N with cargo-only formula output before the item is paid.
- Size keys in shipment `rawItems.sizes` are strict data: `xs`, `s`, `m`, `l`, `xl`, `OneSize`. Unknown size keys should fail validation instead of falling back to `S`.
- A position with the marker `(на уточнении)` in the last bracket of the Excel name means sizes are not yet assigned. The parser emits `sizesUnknown: true` and uses `quantityOverride` from column G. These positions still participate in payment totals but do not contribute sizes to the catalog.
- `sample` marks an item as an образец, but quantity still comes from explicit sizes or Excel column G when present.
- `hasPriceGaps` should consider only payable positions with quantity but without price.
- Product category must resolve to one of four real buckets: `Мех`, `Замша`, `Кожа`, `Экзотика`. If the parser cannot infer a category, it should fail instead of inventing `Прочее`.
- Catalog photos are optional while a model is being developed. The parser writes `photo` only when the exact JPG/JPEG exists and stores all source sheet rows in `excelRows`.
- `npm run validate:images` reports every model without a photo and its Excel row numbers. A missing `photo` is valid; a `photo` path whose file is missing is an error.
- `OptimizedImage` uses the shared `__photo_pending` JPG/WebP when `photo` is absent or a referenced asset fails to load.
- The shared photo placeholder always uses `object-fit: contain` with stable inner padding across catalog/detail breakpoints; real product photos keep their normal crop rules.
- Product cards and category cards should not imply clickability beyond their real clickable area.
- Intro copy at the top of pages should be quiet and compact.
- In `Work`, expansion belongs to year headers and shipment headers; table content should not accidentally toggle cards.
- Year UI is split by role: `YearGroup` coordinates, `YearHeader` renders the clickable yearly summary, and `YearShipmentsSheet` renders the expanded shipment list.
- In `Work`, the full first position cell is the click target for opening the product page.
- `Work` expansion/scroll restoration lives in `hooks/useWorkNavigationState.ts`; keep page components thin when changing this flow.
- The category pill in `ProductDetail` is a real link to the matching catalog category and should read as interactive.
- `ProductDetail` is intentionally a thin layout wrapper; keep photo behavior in `components/product/ProductPhoto.tsx`, product facts in `ProductInfo.tsx`, and material rendering in `ProductMaterials.tsx`.
- `Money` is intentionally a screen-level layout; reusable financial cards/tables live in `components/money/MoneyMetricCard.tsx` and `MoneyDetailsTable.tsx`.
- Repeated clickable-card behavior should go through `components/ui/ClickableCard.tsx` so mouse and keyboard behavior stay aligned.
- Motion should reinforce hierarchy, not decorate for its own sake.
- Shared motion comes from `MOTION` in `constants/styles.ts`; avoid one-off timing/easing values unless there is a strong reason.
- Category-specific visual accents come from `CATEGORY_VISUALS` in `constants/styles.ts`; keep them as muted lines/badges, not loud decorative color blocks.
- If an entire card is clickable, avoid inner fake CTA buttons such as `Смотреть`; use card-level affordance and optional quiet directional hints.

## Known Project Choices

- `BreakpointProvider` uses actual viewport width on the client.
- If desktop suddenly looks mobile, check browser zoom (`Ctrl+0`) before changing breakpoints: zoom changes the real viewport width.
- A separate strict TypeScript check exists in `tsconfig.strict-check.json`.
- Unit tests use Vitest and run through `npm run test`.
- `npm run preflight:fast` is the daily startup check for data refresh flows: it validates generated JSON, manual money data, and image assets without running the full build.
- `npm run preflight` is the safest one-command check before deploy: it runs lint, type checks, unit tests, data validation, image validation, and production build.
- The live site is deployed by Netlify. A Git push to the deployment branch normally triggers the Netlify build, using `netlify.toml` for the build command.
- If plain `npm` is unavailable on Windows, prepend the bundled runtime with `$env:PATH = "$PWD\.tools\node;$env:PATH"`; `scripts/preflight.mjs` also adds the bundled Codex Python runtime for nested validation steps when it exists.
- Agent rules are kept in editor-neutral docs (`AGENTS.md`, this file, and README files); do not reintroduce stale editor-specific rule files.
- Shared visual tokens live in `constants/styles.ts`.
- Repeated screen intros should use common styles instead of bespoke inline copies.
- `lib/money.ts` exposes `buildMoneyOverview(shipments, config)` for pure financial aggregation tests; `getMoneyOverview()` is the app wrapper that injects `data/money.json`.
- `shipments.json` / `products.json` / `meta.json` are generated artifacts, not long-term manual sources.
- `Shell` owns top-level navigation behavior: brand click returns to `/`, and back navigation is resolved through `lib/navigationHistory.ts`.
- Entering `/` resets in-app navigation memory, so later back actions start from the main menu again.
- Product pages use explicit back behavior to preserve `Work` / `Catalog` context, while other screens prefer the in-app history stack first and fallback second.
- `app/layout.tsx` contains the global keyframes, the `prefers-reduced-motion` safeguard, and the global `:focus-visible` ring (keyboard focus is visible, mouse clicks stay clean).
- Screen intros and card grids now use soft staggered entrance motion; new motion should match that quieter rhythm.
- Telegram's in-app browser may close on vertical swipe for ordinary links; that behavior is outside the control of a regular web page. Official swipe control exists only for Telegram Mini Apps.

## Safe Refactoring Directions

- Collapse duplicated UI patterns into local helpers or shared style tokens.
- Narrow module exports when helpers are only used internally.
- Prefer updating README / data docs / AGENTS whenever domain or UI terminology changes.
- If you touch navigation, update both the code contract (`Shell`, `navigationHistory`) and the docs in the same pass.
- If you touch motion, update both the shared tokens and the documentation of interaction intent in the same pass.

## Avoid

- Treating generated JSON files as long-term hand-edited sources.
- Making non-interactive summary text look like CTA buttons.
- Introducing new one-off style values if an existing token is close enough.
- Rewriting status logic without checking `lib/statusText.ts`.
