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
  The business object shown in Work. Computed positions live directly in
  `shipment.positions`.

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
-> explicit `npm run publish:data`
-> versioned Netlify Blobs bundle + atomic `current`

`Excel/update_prices.py` remains as a repair/maintenance script for re-syncing catalog prices from existing shipments.

`data/money.json` is separate manual data.
It may contain:
- `deposits` for the right-side deposited/prepaid block
- `pendingManual` for manual extra rows inside `Всего к оплате`
`npm run validate:data` validates this manual file too; manual amounts must stay positive finite numbers.
The same manual file is published inside the atomic runtime bundle. The Google
Sheets `Оплаты` tab is not part of this flow and must not be edited by the
publisher.

`data/product-id-registry.json` is the durable technical source for product
identity. The parser normalizes names, preserves registry entries for models
missing from the current sheet, and allocates monotonically increasing
`auto-NNN` values. The publisher refreshes it from the latest versioned Blobs
bundle and publishes it atomically with the runtime files. Legacy bundles may
omit the field only for read compatibility during migration; every new POST
must include a valid registry based on the exact current bundle version. The
publisher parses against a temporary workspace and updates the tracked copy
only after POST plus `/api/data-version` confirmation. The UI never reads it.

Administrative text and voice commands are routed through
`admin/mehmet-operator/SKILL.md`. Its `references/workflows.md` contains the
confirmed operator defaults for adding or moving positions, changing sizes,
and resolving relative ETA dates; keep detailed workflow rules there instead
of duplicating them in this domain overview.

## Invariants

- Statuses are text-first. Do not replace them with enum-only logic unless you preserve the original Excel text.
- Payment visibility depends on `isPayable` and the position status. A position without its own status inherits the shipment status; an explicit position status always decides its payment visibility.
- Manual payment rows from `money.json.pendingManual` are additive and should stay separate from generated shipment-derived pending items.
- Payable positions with positive quantity and no price remain visible in
  Money. Keep their position count and physical unit count separate from the
  known dollar amount; an entirely unknown debt must never appear as `$0`.
- Excel column J (`Курс списания`) guards cost import: import column N as `cost`
  only when J is positive. A vertically merged J cell applies its top-left
  value to every covered item row. Blank, zero, or negative J means the final
  cost is still unknown and must not update catalog cost.
- Size keys in shipment `rawItems.sizes` are strict data: `xs`, `s`, `m`, `l`, `xl`, `OneSize`. Unknown size keys should fail validation instead of falling back to `S`.
- A quantity-only suffix such as `(10 шт.)` in the last bracket of column C means the total is known but sizes are not assigned. The parser emits `sizesUnknown: true` and `quantityOverride: 10`; formula G must calculate the same value and must not be replaced with a manual number. The legacy `(на уточнении)` + G form remains read-compatible only.
- For an ordinary size grid, formula G must exactly equal the sum of the size
  counts. `quantityOverride` is valid only together with `sizesUnknown`; plain
  samples without a grid fall back to one item. Legacy `(образец-N)` is read as
  an unknown-size total, while new rows should use `(N шт., образец)`.
- Every source position represents at least one physical item. With no sizes and no explicit quantity, the TypeScript adapter and the G formula use `1`.
- When an operator adds a repeated position and the user does not state a
  price, column H inherits the nearest previous price for the exact cleaned
  product name from C (ignore only the final size/quantity bracket). An
  explicitly stated price overrides this default. Price changes are valid and
  historical rows must not be rewritten. If no prior match exists, do not
  invent a price; leave H blank and ask.
- Column I is fully formula-driven: `G × H`, but blank when H is blank or `0`.
  Every position row keeps the formula, including rows without a known price.
- Columns K and L are fully formula-driven on every position row. K calculates
  unit cost without cargo from H and the latest explicit J marker inside the
  current shipment only. Shipment scope begins at the latest non-empty A on a
  row with C; a formula in J remains a marker even while its result is blank.
  Blank, zero, or negative rates leave K blank. L is `K × G` and stays blank
  whenever K is unavailable. Do not add zero sentinels to J to stop inheritance
  from a previous shipment.
- Columns N and O are fully formula-driven on every position row. An explicit M
  value starts a cargo block that ends at the next explicit M marker or at the
  shipment boundary. N is `ROUND(K + cargo / sum(G in the block), 0)`; O is
  `N × G`. Cargo never crosses a shipment boundary, and repeated equal M values
  in different blocks are calculated independently. N additionally requires a
  calculated positive K. It is valid to enter cargo before the rate is known,
  but blank, zero, or negative J keeps K, N, O, and shipment total Q blank.
  Blank, zero, or negative M also leaves N and O blank; do not add zero
  sentinels to M.
- The parser inspects formulas with `data_only=False`: G, I, K, L, N and O are
  required formulas on every position row, and Q is required at every shipment
  start. A blank or manually entered replacement is a hard import error.
- Column P has two intentional input types. A real date means the product was
  received; free-form text such as an expected dispatch or arrival window is
  ETA copy shown in the app. With dates only, the parser uses the latest date
  in the shipment. If any text is present, the first cleaned text value becomes
  ETA and takes priority over dates.
- Column Q is a formula-only shipment control total. The formula exists in the
  first row of every shipment, discovers the next non-empty A on a position
  row, and sums O up to that boundary. It stays blank when O has no numeric
  values. Never replace it with a manually maintained `SUM(Ox:Oy)` range.
- `sample` marks an item as an образец, but quantity still comes from explicit sizes or Excel column G when present.
- `underQuestion` is a separate position marker parsed from the phrase
  `под вопросом` in the final column C bracket. It may coexist with `sample`,
  explicit sizes, or `(N шт.)`; it does not alter quantity, status inheritance,
  payment visibility, or catalog identity. Work shows it as `Под вопросом`.
- In the collapsed Work card, shipment type is composed from the actual
  positions: regular positions add the bronze `Партия` badge, sample positions
  add the violet `Образец` badge, and a mixed shipment shows both independent
  badges. Do not reintroduce a synthetic `С образцом` badge.
- A collapsed Work shipment shows every position plus compact
  position/unit/amount metrics. Its presentation layer splits only the last
  whitespace-surrounded dash into model and color; source Excel/JSON text stays
  unchanged. Desktop uses model/color/quantity columns, while mobile places
  color and quantity on a second row below the wrapping model name. The two
  shipment-type badges stay together as one wrapping pair.
- Sample position model names use the same muted violet accent as the
  `Образец` badge. Product color stays bronze and quantity stays neutral so the
  sample signal does not flatten the row hierarchy.
- `hasPriceGaps` should consider only payable positions with quantity but without price.
- Product category must resolve to one of four real buckets: `Мех`, `Замша`, `Кожа`, `Экзотика`. If the parser cannot infer a category, it should fail instead of inventing `Прочее`.
- Catalog photos are optional while a model is being developed. The parser writes `photo` only when the exact JPG/JPEG exists and stores all source sheet rows in `excelRows`.
- Product names use the order `garment + model/fit/style + material + color`:
  in Russian source text, named models and descriptors such as `Аляска`,
  `Агнес`, `в стиле 80-х`, and `по новым лекалам` belong before the
  `из материала` phrase. JPG/JPEG stems must match the resulting product name
  exactly.
- In semantic checks between Excel columns C and D, treat C as the commercial
  name/appearance and D as the actual composition. The confirmed combination
  `из кожи страуса` + `100% Кожа барана` is valid because it means ram leather
  finished to look like ostrich, not natural ostrich leather. Do not flag or
  auto-correct it; send other unconfirmed species mismatches for review. See
  `docs/EXCEL_PIPELINE.md`, section `Состав и смысловая проверка C ↔ D`.
- The confirmed model `Жакет Агнес из меха кенгуру` uses
  `100% Натуральный мех кенгуру`. Kangaroo is fur for this product; do not
  rename it to leather or write `Кожа кенгуру` in its composition.
- `npm run validate:images` reports every model without a photo and its Excel row numbers. A missing `photo` is valid; a `photo` path whose file is missing or whose card WebP was not generated is an error.
- `OptimizedImage` uses `webp/card` for grids and the home menu. Its fallback is card WebP -> full WebP -> the exact original JPG/JPEG path -> shared `__photo_pending` -> system image icon.
- `public/images/products/jpg/` is the only manually maintained image source. `scripts/convert_to_webp.py` regenerates changed variants and recursively prunes derived `.webp` files with no JPG/JPEG source; never maintain `webp/` or `webp/card/` by hand.
- Generated card WebPs are square contain canvases. The converter samples the four source corners for a neutral background, so portrait and near-square product photos keep the full subject without hand-added margins.
- Catalog cards use a square media region with `object-fit: contain` at every breakpoint. The shared placeholder keeps its dedicated cover treatment.
- Product detail uses the full WebP with `object-fit: contain` at every breakpoint. On wide screens the photo frame follows the loaded image ratio instead of stretching a fixed-height column and cropping it.
- Product cards and category cards should not imply clickability beyond their real clickable area.
- Intro copy at the top of pages should be quiet and compact.
- In `Work`, a year expands from its header. A shipment expands from the whole
  card surface except nested product links and other interactive controls; the
  shipment header remains its keyboard-accessible control.
- Year UI is split by role: `YearGroup` coordinates, `YearHeader` renders the clickable yearly summary, and `YearShipmentsSheet` renders the expanded shipment list.
- In `Work`, the full first position cell is the click target for opening the product page.
- `Work` expansion/scroll restoration lives in `hooks/useWorkNavigationState.ts`; keep page components thin when changing this flow.
- The category pill in `ProductDetail` is a real link to the matching catalog category and should read as interactive.
- `ProductDetail` is intentionally a thin layout wrapper; keep photo behavior in `components/product/ProductPhoto.tsx`, product facts in `ProductInfo.tsx`, and material rendering in `ProductMaterials.tsx`.
- `Money` is intentionally a screen-level layout; reusable financial cards/tables live in `components/money/MoneyMetricCard.tsx` and `MoneyDetailsTable.tsx`.
- Repeated clickable-card behavior should go through `components/ui/ClickableCard.tsx` so mouse and keyboard behavior stay aligned.
- Shared page width/padding belongs in `components/ui/PageFrame.tsx`; repeated
  page intro hierarchy belongs in `PageIntro.tsx`.
- Shared typography is role-based in `FONT_FAMILIES`: `display` (`Lora`) owns
  headings and reading text, while `ui` (`Manrope`) owns amounts, metrics,
  tables, badges, and compact controls. Numeric values use tabular numerals; do
  not introduce local font stacks that bypass these tokens.
- Global hover, active, focus, and reduced-motion rules live in
  `app/globals.css`; component-specific DOM style mutation is not a shared
  interaction mechanism.
- Motion should reinforce hierarchy, not decorate for its own sake.
- Shared motion comes from `MOTION` in `constants/styles.ts`; avoid one-off timing/easing values unless there is a strong reason.
- Category-specific visual accents come from `CATEGORY_VISUALS` in `constants/styles.ts`; keep them as muted lines/badges, not loud decorative color blocks.
- If an entire card is clickable, avoid inner fake CTA buttons such as `Смотреть`; use card-level affordance and optional quiet directional hints.

## Known Project Choices

- `app/layout.tsx` deliberately starts `BreakpointProvider` at `desktop`; the provider reads the actual viewport through `useSyncExternalStore` while keeping that deterministic server snapshot for hydration. Do not read User-Agent through `headers()`/`cookies()` in root layout: that makes every route dynamic.
- Work expansion state also starts deterministically empty on the server and
  client, then restores `sessionStorage` after mount. Do not read stored state
  in a `useState` initializer because that creates hydration mismatches.
- If desktop suddenly looks mobile, check browser zoom (`Ctrl+0`) before changing breakpoints: zoom changes the real viewport width.
- A separate strict TypeScript check exists in `tsconfig.strict-check.json`.
- Unit tests use Vitest and run through `npm run test`.
- WebP source-sync regressions run through `npm run test:images`.
- `npm run preflight:fast` is the daily startup check for data refresh flows: it validates generated JSON, manual money data, and image assets without running the full build.
- `npm run preflight` is the safest one-command check before deploy: it runs lint, type checks, unit tests, data validation, image validation, and production build.
- Netlify uses `npm run preflight` as its build command, so a deploy cannot pass by running only `next build`; run the same command locally first for faster feedback.
- The live site is deployed by Netlify. Git push updates code, rules, and static photos; `npm run publish:data` updates the table/finance bundle without rebuilding.
- If plain `npm` is unavailable on Windows, prepend the bundled runtime with `$env:PATH = "$PWD\.tools\node;$env:PATH"`. Python npm-scripts use the shared launcher: `MEHMET_PYTHON`, then local/bundled runtimes, then system Python; missing modules fail with an install hint for `requirements.txt`.
- Agent rules are kept in editor-neutral docs (`AGENTS.md`, this file, and README files); do not reintroduce stale editor-specific rule files.
- Shared visual tokens live in `constants/styles.ts`.
- Repeated screen intros should use common styles instead of bespoke inline copies.
- `lib/money.ts` exposes `buildMoneyOverview(shipments, config)` for pure financial aggregation tests; the server route supplies config from the same published bundle as shipments.
- `lib/dataBundle.ts` validates nested runtime fields before any published
  bundle reaches UI. Python and TypeScript validators share negative fixtures
  for malformed nested values.
- `shipments.json` / `products.json` / `meta.json` are generated artifacts, not long-term manual sources.
- `lib/dataSource.ts` is the only runtime entrypoint for the four-file data
  bundle. On Netlify it strongly reads Blob key `current` on every data-backed
  request and falls back to the build snapshot if Blob data is missing or
  invalid; the optional technical registry is carried through but never needed
  by UI rendering.
- Routes live in `app/`; screen components are grouped by owner in
  `components/home`, `catalog`, `money`, `product`, and `work`.
- Route files are server components and generated JSON or the Blob loader must not be imported from `"use client"` modules. `/` stays Static; `/catalog`, `/money`, `/work`, and `/product/[id]` are request-rendered so a published bundle is visible without a deploy.
- Catalog and product query-state lives in narrow client boundaries under `Suspense`; keep the server route responsible for data loading.
- `AppShell` owns top-level navigation behavior: brand click returns to `/`, and back navigation is resolved through `lib/navigationHistory.ts`.
- The legacy `batch` query parameter carries a shipment id in deep links; keep
  it compatible, but use `shipmentId` for TypeScript variables.
- Entering `/` resets in-app navigation memory, so later back actions start from the main menu again.
- Product pages use explicit back behavior to preserve `Work` / `Catalog` context, while other screens prefer the in-app history stack first and fallback second.
- `app/layout.tsx` contains the global keyframes, the `prefers-reduced-motion` safeguard, and the global `:focus-visible` ring (keyboard focus is visible, mouse clicks stay clean).
- Screen intros and card grids now use soft staggered entrance motion; new motion should match that quieter rhythm.
- Telegram's in-app browser may close on vertical swipe for ordinary links; that behavior is outside the control of a regular web page. Official swipe control exists only for Telegram Mini Apps.

## Safe Refactoring Directions

- Collapse duplicated UI patterns into local helpers or shared style tokens.
- Narrow module exports when helpers are only used internally.
- Prefer updating README / architecture / data docs / AGENTS whenever domain or UI terminology changes.
- If you touch navigation, update both the code contract (`AppShell`, `navigationHistory`) and the docs in the same pass.
- If you touch motion, update both the shared tokens and the documentation of interaction intent in the same pass.

## Avoid

- Treating generated JSON files as long-term hand-edited sources.
- Making non-interactive summary text look like CTA buttons.
- Introducing new one-off style values if an existing token is close enough.
- Rewriting status logic without checking `lib/statusText.ts`.
