# Mehmet Metrics

Внутренняя панель управления для отслеживания заказов на пошив изделий из кожи, меха и экзотических материалов. Приложение позволяет контролировать партии, видеть финансовые показатели и просматривать каталог продукции.

## 🎯 Назначение

Приложение решает три основные задачи:

1. **Контроль производства** — отслеживание партий изделий на разных этапах: в производстве, в пути, получено
2. **Финансовый учёт** — расчёт сумм к оплате за партии и учёт депозитов
3. **Каталог продукции** — просмотр изделий с ценами, размерами и материалами

---

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен-сервера
npm start
```

Приложение откроется на `http://localhost:3000`

---

## 📁 Структура проекта

```
├── app/                    # Next.js App Router — страницы
│   ├── page.tsx            # Главная — меню навигации
│   ├── work/page.tsx       # Раздел «Работа» — партии и статусы
│   ├── money/page.tsx      # Раздел «Деньги» — суммы к оплате
│   ├── catalog/page.tsx    # Каталог изделий
│   ├── product/[id]/       # Детальная страница товара
│   ├── layout.tsx          # Корневой layout с провайдерами
│   └── home/               # Компоненты главной страницы
│       ├── Menu.tsx        # Карточки навигации
│       ├── Work.tsx        # UI раздела «Работа»
│       ├── Money.tsx       # UI раздела «Деньги»
│       ├── Catalog.tsx     # UI каталога
│       ├── UpSector.tsx    # Шапка страницы
│       ├── DownSector.tsx  # Подвал страницы
│       └── styles.ts       # Стили для layout
│
├── components/             # Переиспользуемые компоненты
│   ├── Shell.tsx           # Общая обёртка страниц (шапка + контент + подвал)
│   ├── ProductCard.tsx     # Карточка товара в каталоге
│   ├── ProductDetail.tsx   # Детальный просмотр товара
│   ├── CategoryCard.tsx    # Карточка категории
│   ├── providers/
│   │   └── BreakpointProvider.tsx  # Контекст для адаптивности
│   ├── work/
│   │   ├── BatchView.tsx   # Таблица партии с группировкой по статусам
│   │   └── PositionRow.tsx # Строка позиции в таблице
│   └── ui/
│       ├── SizeChips.tsx   # Чипы размеров (XS, S, M...)
│       ├── SampleTag.tsx   # Метка «образец»
│       └── StatusBadge.tsx # Бейдж статуса
│
├── data/                   # JSON-данные
│   ├── products.json       # Каталог изделий с ценами
│   ├── shipments.json      # Партии и позиции
│   └── money.json          # Депозиты и предоплаты
│
├── types/                  # TypeScript типы
│   ├── domain.ts           # Доменная модель: Position, Batch, PositionStatus
│   ├── product.ts          # Тип Product для каталога
│   └── shipment.ts         # Типы для сырых данных партий
│
├── lib/                    # Бизнес-логика
│   ├── adapters.ts         # Преобразование JSON → доменная модель
│   ├── shipments.ts        # buildShipments() — сборка партий
│   ├── derive.ts           # Группировка позиций по статусам
│   ├── format.ts           # Форматирование: валюта, иконки статусов
│   ├── utils.ts            # UI-утилиты: hover-эффекты
│   └── breakpoints.ts      # Пороги адаптивности (mobile/tablet/desktop)
│
├── hooks/                  # React-хуки
│   └── useBreakpoint.ts    # Определение текущего брейкпоинта
│
├── constants/              # Константы
│   ├── styles.ts           # Цвета, отступы, типографика
│   └── MonitorSize.ts      # Реэкспорт useBreakpoint
│
└── contexts/
    └── BreakpointContext.tsx  # Контекст для размера экрана
```

---

## 🏗 Архитектура

### Потоки данных

```
┌─────────────────────────────────────────────────────────────────┐
│                         JSON-файлы                              │
│  products.json    shipments.json    money.json                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    lib/adapters.ts                              │
│  toPosition() — преобразует сырой item в Position               │
│  toBatch() — собирает Batch из позиций                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   lib/shipments.ts                              │
│  buildShipments() — создаёт ShipmentWithItems[]                 │
│  Считает totalAmount, определяет hasPriceGaps                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Страницы (app/)                            │
│  WorkPage, MoneyPage — используют buildShipments()              │
│  CatalogPage — напрямую читает products.json                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Компоненты UI                                │
│  Work.tsx → BatchView → PositionRow                             │
│  Money.tsx — карточки с суммами                                 │
│  Catalog.tsx → ProductCard → ProductDetail                      │
└─────────────────────────────────────────────────────────────────┘
```

### Доменная модель

**Position** — единица изделия в партии:
```typescript
interface Position {
  id: string;
  productId: string;       // Ссылка на товар в каталоге
  title: string;           // Название позиции
  sizes: Record<Size, number>;  // Количество по размерам
  qty: number;             // Общее количество
  price: number | null;    // Цена за единицу (из каталога)
  sum: number | null;      // Сумма к оплате (price × qty) или null
  sample: boolean;         // Это образец?
  status: PositionStatus;  // Статус позиции
  noteEnabled: boolean;    // Показывать примечание?
  noteText: string | null; // Текст примечания
}
```

**PositionStatus** — возможные статусы:
| Статус | Описание | Иконка |
|--------|----------|--------|
| `inProduction` | В производстве | 🛠️ |
| `done` | Готово | ✅ |
| `inTransit` | В пути | 🚚 |
| `receivedUnpaid` | Получено, не оплачено | 📦 |
| `paid` | Оплачено | 💵 |
| `paidEarlier` | Оплачено ранее | ☑️ |
| `returned` | Вернулось после ремонта | ♻️ |

**Batch** — партия изделий:
```typescript
interface Batch {
  id: string;
  receivedAt?: string;     // Дата получения
  positions: Position[];   // Позиции партии
}
```

### Расчёт сумм

**Сумма позиции** вычисляется в `lib/adapters.ts`:
```typescript
// Сумма = цена × количество, но только если:
// - Цена известна (price != null)
// - Позиция не оплачена ранее (paidPreviously = false)
// - Позиция требует оплаты (noPayment = false)
const sum = price != null && !paidPreviously && !noPayment
  ? price * qty
  : null;
```

**Сумма партии** — сумма всех `position.sum` где `sum !== null`.

**Итого к оплате** (`app/money/page.tsx`):
- Берутся партии, где статус НЕ содержит слово "оплач" (кроме "не оплачено")
- Суммируются `pendingAmount` по партиям

---

## 📱 Адаптивность

Приложение адаптируется под 4 брейкпоинта:

| Брейкпоинт | Ширина | Использование |
|------------|--------|---------------|
| `mobile` | < 768px | Компактные карточки, упрощённая таблица |
| `tablet` | 768–1024px | Средний размер элементов |
| `laptop` | 1024–1280px | Десктопный layout |
| `desktop` | ≥ 1280px | Полноразмерный интерфейс |

**Как работает:**
1. На сервере `layout.tsx` определяет начальный брейкпоинт по User-Agent
2. `BreakpointProvider` оборачивает приложение и отслеживает `window.resize`
3. Компоненты используют хук `useBreakpoint()` для получения текущего размера

```typescript
const { isMobile, isDesktop, breakpoint } = useBreakpoint();
```

---

## 📝 Добавление данных

### Новый товар в каталог

Добавьте объект в `data/products.json`:
```json
{
  "id": "unique-id",
  "name": "Название изделия",
  "category": "Экзотика",
  "photo": "/images/products/photo.jpg",
  "sizes": ["xs", "s"],
  "price": 320,
  "materials": {
    "outer": "Натуральная кожа питона",
    "lining": "70% Acetate 30% Polyester",
    "comments": "Описание материала"
  },
  "inStock": true,
  "tags": ["эксклюзив", "премиум"]
}
```

### Новая позиция в партию

Добавьте объект в `rawItems` нужной партии в `data/shipments.json`:
```json
{
  "productId": "unique-id",
  "overrideName": "Название для отображения",
  "sizes": { "xs": 5, "s": 3 },
  "status": "in_progress"
}
```

**Опциональные поля:**
- `sample: true` — пометить как образец
- `quantityOverride: 1` — переопределить количество
- `note: "текст"` — примечание
- `paidPreviously: true` — оплачено ранее (не входит в сумму)
- `noPayment: true` — без оплаты (например, вернулось с ремонта)

### Новая партия

Добавьте объект в начало массива `data/shipments.json`:
```json
{
  "id": "shipment-13",
  "title": "Партия №13",
  "status": {
    "label": "В работе",
    "icon": "🧵"
  },
  "eta": "Ожидаем через 2 недели",
  "rawItems": [...]
}
```

**Статусы партий:**
- `В работе` 🧵 — изделия шьются
- `Получено, не оплачено` 📦 — партия пришла, ждёт оплаты
- `Получено, оплачено` ✅ — всё закрыто

---

## 🎨 Стилизация

Все цвета, отступы и типографика определены в `constants/styles.ts`:

```typescript
// Основные цвета
COLORS.primary      // #fbbf24 — золотой (акцент)
COLORS.success      // #34d399 — зелёный (оплачено)
COLORS.error        // #f87171 — красный (к оплате)

// Фоны
COLORS.background.dark    // #0a0a0a
COLORS.background.card    // rgba(38,38,38,0.6)

// Отступы
SPACING.xs  // 4px
SPACING.sm  // 8px
SPACING.md  // 16px
SPACING.lg  // 24px
SPACING.xl  // 32px
```

Hover-эффекты для карточек определены в `CARD_HOVER_EFFECTS` и применяются через `createCardHoverHandlers()`.

---

## 🛠 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшена |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | Проверка ESLint |
| `npm run typecheck` | Проверка TypeScript |
| `npm run build:full` | Lint + TypeCheck + Build |

---

## 📦 Технологии

- **Next.js 14** — App Router, Server Components
- **React 18** — UI библиотека
- **TypeScript** — строгая типизация
- **CSS-in-JS** — инлайн-стили с константами

Без внешних UI-библиотек — все компоненты написаны с нуля.
