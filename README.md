# Mehmet Metrics

Внутренняя панель для контроля поставок изделий, финансовых обязательств и
каталога продукции.

Приложение решает три задачи:

1. показывает историю поставок и статусы позиций по годам;
2. считает суммы к оплате и учитывает ручные доплаты/депозиты;
3. предоставляет каталог с фото, ценами, размерами и материалами.

## Быстрый запуск

```bash
npm install
npm run dev
```

Приложение откроется на `http://localhost:3000`.

На Windows проект может использовать локальный Node.js из `.tools/node`:

```powershell
$env:PATH = "$PWD\.tools\node;$env:PATH"
```

Также доступны пользовательские Windows-сценарии:

- `Запустить проект.bat` — fast preflight и dev server без обновления данных;
- `Запустить с обновлением.bat` — Google Sheet → Excel → JSON → WebP → проверки
  → dev server;
- `Собрать проект.bat` — полный preflight и production build.

## Основные команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Запуск production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Основная TypeScript-проверка |
| `npm run typecheck:strict` | Строгая проверка без `.next/types` |
| `npm run test` | TypeScript unit tests |
| `npm run test:excel` | Python-регрессии Excel-парсера |
| `npm run test:images` | Регрессии синхронизации JPG → WebP |
| `npm run validate:data` | Проверка generated JSON и ручных финансов |
| `npm run validate:images` | Проверка фото, полноразмерных и карточных WebP |
| `npm run preflight:fast` | Быстрая проверка данных и изображений |
| `npm run preflight` | Полная проверка перед деплоем |

Если нужен production build, сначала остановите активный dev server: на Windows
он может удерживать `.next/trace`.

## Структура проекта

```text
app/                 Next.js routes; только сборка экранов и route state
components/
  layout/            AppShell, AppHeader, AppFooter
  home/              Стартовое меню
  catalog/           Экран и карточки каталога
  money/             Финансовый экран и детализация
  product/           Детальная страница товара
  work/              История поставок, годы, карточки и позиции
  providers/         React providers/contexts
  ui/                Общие UI-примитивы
hooks/               Клиентские хуки состояния и адаптивности
lib/                 Бизнес-логика и специализированные helpers
types/               Доменная и входная TypeScript-модель
data/                Generated JSON и ручной money.json
Excel/               Python-пайплайн Excel → JSON
scripts/             Preflight, изображения и Windows helpers
public/              Статические ассеты
docs/                Архитектура и контракт пайплайна
```

Подробная карта модулей: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Архитектура

```text
Excel / Google Sheet
        ↓
Python parser + validation
        ↓
data/*.json
        ↓
lib/* + types/*
        ↓
app/*/page.tsx
        ↓
components/<area>/*
```

Маршруты остаются тонкими. Экранная разметка находится в соответствующей
предметной папке `components/`, а бизнес-правила — в `lib/`.

В TypeScript используется единый термин `Shipment`:

```typescript
interface Shipment extends ShipmentConfig {
  positions: Position[];
  totalAmount: number;
  hasPriceGaps: boolean;
}
```

Вычисленные позиции доступны как `shipment.positions`; отдельной внутренней
сущности `Batch` нет. Query-параметр `batch` сохранён только как legacy-контракт
существующих deep links.

## Источник правды

Excel / Google Sheet — источник правды для:

- поставок и статусов;
- размеров и количества;
- материалов;
- исторических и актуальных цен.

Файлы `data/shipments.json`, `data/products.json`, `data/meta.json` генерируются
и будут перезаписаны следующим импортом.

`data/money.json` редактируется вручную:

- `deposits` — депозиты и предоплаты;
- `pendingManual` — дополнительные ручные строки к оплате.

Подробные правила: [`data/README.md`](data/README.md).

## Обновление данных

Ручной сценарий:

```bash
python Excel/fetch_google_sheet.py
python Excel/parse_excel.py --auto
python scripts/convert_to_webp.py --auto
npm run preflight:fast
```

Полный контракт парсера, используемые колонки и инварианты:
[`docs/EXCEL_PIPELINE.md`](docs/EXCEL_PIPELINE.md).

Ключевые правила:

- статусы сохраняются текстом из Excel 1:1;
- пустой статус позиции наследует статус поставки;
- `isPayable` определяет участие позиции в финансовых расчётах;
- неизвестные размеры и категории останавливают импорт;
- `sample` не принуждает количество к `1`;
- cost из колонки N используется только при положительном курсе в J;
- фото опционально, но заданный несуществующий путь является ошибкой.

## Изображения

```text
public/images/products/jpg/        оригинальные JPG/JPEG
public/images/products/webp/       полноразмерные WebP для страницы товара
public/images/products/webp/card/  облегчённые WebP для карточек и главной
```

Имя файла должно совпадать с названием модели. Если фото ещё нет, каталог
использует общий `__photo_pending`. Конвертер создаёт оба WebP-варианта и
пересобирает их после изменения исходного JPG.

Папка `jpg/` — единственный источник правды. Файлы в `webp/` и `webp/card/`
вручную редактировать или удалять не нужно:

1. добавьте, замените, переименуйте или удалите JPG/JPEG;
2. запустите «Запустить с обновлением» либо команду ниже;
3. конвертер создаст актуальные варианты и рекурсивно удалит лишние `.webp`, у
   которых больше нет исходника.

```bash
python scripts/convert_to_webp.py --auto
npm run validate:images
```

Если фото удалено без полного обновления данных, сначала запустите
`python Excel/parse_excel.py --auto`: старый `photo` в generated
`data/products.json` должен также исчезнуть.

## Производительность

- все маршруты предварительно рендерятся при production build: обычные страницы
  как Static, товары — как SSG;
- route-компоненты читают JSON на сервере, а клиент получает только необходимые
  экрану props;
- `app/layout.tsx` не использует request-bound `headers()`/`cookies()`, чтобы не
  переводить весь проект в dynamic rendering;
- карточки используют уменьшенный вариант изображения, а детальная страница —
  полноразмерный;
- первая карточка главной и фото товара помечены как LCP-priority;
- тяжёлые таблицы Work монтируются только после раскрытия года и поставки.

Зафиксированные контракты, результаты контрольной сборки и порядок повторного
замера: [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md).

## Навигация и UI

- `components/layout/AppShell.tsx` владеет общим каркасом;
- бренд `MM / Mehmet Metrics` всегда ведёт на `/`;
- кнопка «Назад» использует внутреннюю историю приложения;
- товар сохраняет источник перехода из Work или Catalog;
- состояние раскрытия Work живёт в `hooks/useWorkNavigationState.ts`;
- повторяющиеся кликабельные карточки используют `ClickableCard`;
- общие visual/motion-токены находятся в `constants/styles.ts`;
- анимации обязаны учитывать `prefers-reduced-motion`.

## Проверка перед деплоем

```bash
npm run preflight
```

Команда запускает lint, обе TypeScript-проверки, TypeScript и Python-тесты,
валидацию данных/изображений и production build.

Проект развёрнут на Netlify. Обычный способ обновить сайт — push в deployment
branch; команда сборки задана в `netlify.toml`.

## Документация для разработки

Перед изменениями читать:

1. `AGENTS.md` — обязательные инварианты и команды;
2. `docs/AI_CONTEXT.md` — краткая доменная модель и частые ловушки;
3. `docs/ARCHITECTURE.md` — границы модулей и владение компонентами;
4. `docs/PERFORMANCE.md` — performance-контракты и контрольные метрики;
5. `data/README.md` — правила generated/manual data;
6. `docs/EXCEL_PIPELINE.md` — подробности импорта.
