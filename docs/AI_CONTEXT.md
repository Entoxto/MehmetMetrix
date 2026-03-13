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

## Invariants

- Statuses are text-first. Do not replace them with enum-only logic unless you preserve the original Excel text.
- Payment visibility depends on `isPayable`.
- `hasPriceGaps` should consider only payable positions with quantity but without price.
- Product category must resolve to one of four real buckets: `Мех`, `Замша`, `Кожа`, `Экзотика`. If the parser cannot infer a category, it should fail instead of inventing `Прочее`.
- Product cards and category cards should not imply clickability beyond their real clickable area.
- Intro copy at the top of pages should be quiet and compact.

## Known Project Choices

- `BreakpointProvider` uses actual viewport width on the client.
- If desktop suddenly looks mobile, check browser zoom (`Ctrl+0`) before changing breakpoints: zoom changes the real viewport width.
- A separate strict TypeScript check exists in `tsconfig.strict-check.json`.
- `npm run preflight:fast` is the daily startup check for data refresh flows: it validates generated JSON and image assets without running the full build.
- `npm run preflight` is the safest one-command check before deploy: it runs lint, type checks, generated-data validation, image validation, and production build.
- Shared visual tokens live in `constants/styles.ts`.
- Repeated screen intros should use common styles instead of bespoke inline copies.
- `shipments.json` / `products.json` / `meta.json` are generated artifacts, not long-term manual sources.

## Safe Refactoring Directions

- Collapse duplicated UI patterns into local helpers or shared style tokens.
- Narrow module exports when helpers are only used internally.
- Prefer updating README / data docs / AGENTS whenever domain or UI terminology changes.

## Avoid

- Treating generated JSON files as long-term hand-edited sources.
- Making non-interactive summary text look like CTA buttons.
- Introducing new one-off style values if an existing token is close enough.
- Rewriting status logic without checking `lib/statusText.ts`.
