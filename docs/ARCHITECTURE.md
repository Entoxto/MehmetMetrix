# Архитектура Mehmet Metrics

## Назначение документа

Этот документ описывает устойчивые границы проекта: направление зависимостей,
владение компонентами, поток данных и контракты, которые важно сохранять при
рефакторинге. Инструкции по данным находятся в `data/README.md`, а подробности
Excel-пайплайна — в `docs/EXCEL_PIPELINE.md`.

## Общая схема

```text
Excel / Google Sheet
        ↓
Excel/*.py
        ↓
data/*.json
        ↓
lib/* + types/*
        ↓
app/*/page.tsx
        ↓
components/<area>/*
```

Основное направление зависимостей:

```text
app → components → hooks/lib/types/constants
hooks → lib/types/components/providers
lib → data/types
```

`lib/` не импортирует UI-компоненты. Компоненты не читают Excel и не знают о
деталях Python-пайплайна. Generated JSON импортируется только серверными
модулями; клиентские компоненты получают подготовленные props.

## Структура каталогов

### `app/`

Маршруты Next.js App Router. Серверные `page.tsx` загружают данные, выполняют
агрегацию и передают готовые props в узкую клиентскую границу.

- `/` → `components/home/HomeMenu.tsx`
- `/work` → `components/work/WorkScreen.tsx`
- `/money` → `components/money/MoneyScreen.tsx`
- `/catalog` → `components/catalog/CatalogPageClient.tsx` → `CatalogScreen.tsx`
- `/product/[id]` → `components/product/ProductPageClient.tsx` →
  `ProductDetail.tsx`

Маршрут не должен содержать крупную разметку или бизнес-правила. Все обычные
маршруты остаются Static, а страницы товаров генерируются через
`generateStaticParams`; request-bound API в корневом layout запрещены.

### `components/`

Компоненты сгруппированы по владельцу:

- `layout/` — общий каркас, шапка, подвал и стили каркаса;
- `home/` — только стартовое меню;
- `catalog/` — экран каталога и его карточки;
- `money/` — финансовый экран и детализация;
- `product/` — детальная страница товара;
- `work/` — история поставок, годовые группы и позиции;
- `providers/` — React-контексты и провайдеры;
- `ui/` — небольшие переиспользуемые UI-примитивы.

Компонент, используемый только одной предметной областью, остаётся в её папке.
В `ui/` выносится только действительно общий паттерн.

### `lib/`

Чистая или инфраструктурная TypeScript-логика:

- `shipmentAdapter.ts` — преобразование `rawItems` в доменные позиции;
- `shipments.ts` — сборка поставок, суммы и price gaps;
- `shipmentGrouping.ts` — клиент-безопасная группировка готовых поставок по
  годам без импорта JSON;
- `shipmentStatusRows.ts` — подготовка групп позиций для таблицы;
- `shipmentMetrics.ts` — метрики поставки и года;
- `money.ts` — финансовая сводка;
- `statusText.ts` — текстовая логика оплаты;
- `navigationHistory.ts` — внутренняя история переходов;
- `products.ts`, `meta.ts` — точки чтения JSON;
- `format.ts`, `imageUtils.ts`, `breakpoints.ts` — общие специализированные
  функции;
- `cardHoverHandlers.ts` — общий интерактивный эффект карточек.

Имена файлов должны описывать предметную задачу. Новые общие `utils.ts` или
`helpers.ts` без конкретной области добавлять не следует.

### `types/`

- `domain.ts` — `Position`, `Size`;
- `shipment.ts` — сырой `ShipmentConfig`, `ShipmentRawItem` и вычисленный
  `Shipment`;
- `product.ts` — каталог и материалы товара.

### `data/`

- `shipments.json`, `products.json`, `meta.json` генерируются;
- `money.json` редактируется вручную;
- `README.md` фиксирует правила источника правды.

### `Excel/`

Python-пайплайн импорта, актуализации каталога и валидации generated data.
Папка названа по внешнему источнику данных и остаётся отдельной от runtime-кода
Next.js.

### `scripts/`

Независимые операционные скрипты: preflight, изображения и Windows-helper для
запуска dev-сервера.

## Доменная модель поставки

В коде используется один термин: `shipment` / «поставка».

```typescript
interface Shipment extends ShipmentConfig {
  positions: Position[];
  totalAmount: number;
  hasPriceGaps: boolean;
}
```

Промежуточной сущности `Batch` нет. `ShipmentConfig.rawItems` сохраняет входные
данные, а `Shipment.positions` содержит нормализованные позиции для логики и UI.

`Position.id` строится из `shipmentId + index`, поэтому остаётся стабильным между
рендерами при неизменном порядке исходных строк.

Query-параметр `batch` сохранён как legacy-контракт глубоких ссылок:
`/work?batch=<shipmentId>&pos=<positionId>`. Внутри TypeScript-кода значение
называется `shipmentId`.

## Поток данных

1. Google Sheet при необходимости скачивается как XLSX.
2. `Excel/parse_excel.py` читает лист «Поставки».
3. Парсер строит поставки и каталог в памяти.
4. Актуальные price/cost вычисляются из поставок.
5. Generated data валидируются до записи.
6. JSON сохраняются атомарно.
7. `lib/products.ts`, `lib/shipments.ts` и `lib/meta.ts` предоставляют данные
   приложению.

Подробный контракт описан в `docs/EXCEL_PIPELINE.md`.

## Финансовая логика

`buildMoneyOverview(shipments, config)` — чистая точка сборки финансовой сводки.
Она объединяет:

- вычисленные неоплаченные позиции поставок;
- ручные строки `money.json.pendingManual`;
- депозиты `money.json.deposits`.

Платёжность позиции определяется `isPayable`, а состояние оплаты —
`isPaidStatus(statusLabel)`.

## Навигация

`components/layout/AppShell.tsx` владеет общим каркасом и кнопкой «Назад».
`lib/navigationHistory.ts` хранит внутреннюю историю приложения.

- бренд всегда ведёт на `/`;
- вход на `/` сбрасывает внутреннюю историю;
- товар использует `backMode="explicit"`, чтобы сохранить источник Work/Catalog;
- состояние раскрытия и прокрутки Work живёт в
  `hooks/useWorkNavigationState.ts`.

## Адаптивность

`BreakpointProvider` получает детерминированный начальный breakpoint `desktop`
из статического root layout и до первого paint после гидратации синхронизируется
с реальной шириной окна. Это сохраняет статический рендеринг: определять
breakpoint через User-Agent, `headers()` или `cookies()` в layout не следует.
Доступ к текущему breakpoint идёт через `useBreakpoint()`.

Не следует создавать локальные конкурирующие media-state хуки.

## Производительность

- Generated JSON читается серверными модулями и не импортируется из файлов с
  `"use client"`.
- `useSearchParams()` находится в небольших клиентских компонентах под
  `Suspense`, поэтому не делает весь маршрут клиентским.
- Work сохраняет ленивый монтаж содержимого закрытых годов и поставок.
- `OptimizedImage` использует `variant="card"` в сетках и на главной; страница
  товара использует полноразмерный WebP.
- Карточный fallback: `webp/card` → полноразмерный WebP → исходный JPG →
  `__photo_pending` → эмодзи.
- `public/images/products/jpg/` — ручной источник правды; оба WebP-слоя
  генерируются. Конвертер удаляет лишние производные `.webp` рекурсивно, поэтому
  ручная синхронизация трёх папок запрещена.

Контрольные цифры и порядок проверки находятся в `docs/PERFORMANCE.md`.

## Стили и motion

Общие токены находятся в `constants/styles.ts`.

- стили каркаса — `components/layout/appShellStyles.ts`;
- стили стартового меню — `components/home/homeMenuStyles.ts`;
- предметные адаптивные стили остаются рядом со своим компонентом;
- новые анимации используют `MOTION` и учитывают `prefers-reduced-motion`.

## Проверки

TypeScript-тесты лежат рядом с логикой в `lib/*.test.ts`. Python-регрессии
проверяются `Excel/test_parser_logic.py`.

Основные команды:

```bash
npm run lint
npm run typecheck
npm run typecheck:strict
npm run test
npm run test:excel
npm run test:images
npm run validate:data
npm run validate:images
npm run preflight
```

## Правила безопасного развития

- страницы остаются тонкими;
- маршруты остаются статически предрендеренными, пока бизнес-требование явно не
  требует request-time данных;
- бизнес-правила не переносятся в JSX;
- компоненты группируются по владельцу, а не по визуальному сходству;
- generated JSON не становится ручным источником правды;
- изменения навигации, источника данных или терминологии обновляют документацию
  в том же коммите;
- legacy query-параметр `batch` не переименовывается без миграции старых ссылок.
