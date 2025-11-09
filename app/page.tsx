"use client";

import { useState, useMemo, useCallback, useEffect, Fragment, type ReactNode, type MouseEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { MoneyView } from "@/components/MoneyView";
import { STYLES, COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import { formatCurrency } from "@/lib/utils";
import { toBatch } from "@/lib/adapters";
import { BatchView } from "@/components/work/BatchView";
// Рефактор: логика вынесена в derive/format, компоненты унифицированы.

type ShipmentStatusKey = "in_progress" | "ready" | "received" | "inTransit";

const SHIPMENT_STATUS_META: Record<ShipmentStatusKey, { label: string; icon: string; order: number }> = {
  in_progress: { label: "В производстве", icon: "🛠️", order: 1 },
  ready: { label: "Готов", icon: "✅", order: 2 },
  received: { label: "Получено", icon: "📦", order: 3 },
  inTransit: { label: "Уже в пути", icon: "🚚", order: 2.5 }, // Между ready и received
};

type SizeConfig = Record<string, number>;

interface ShipmentRawItem {
  productId: string;
  overrideName?: string;
  sizes?: SizeConfig;
  quantityOverride?: number;
  status?: ShipmentStatusKey;
  sample?: boolean;
  note?: string;
  paidPreviously?: boolean;
  noPayment?: boolean;
  inTransit?: boolean; // Флаг для статуса "уже в пути"
  showStatusTag?: boolean; // Флаг для отображения подписи-статуса (по умолчанию false)
}

interface ShipmentConfig {
  id: string;
  title: string;
  status: { label: string; icon: string };
  eta?: string;
  receivedDate?: string;
  groupByPayment?: boolean;
  rawItems: readonly ShipmentRawItem[];
}

const SHIPMENTS_CONFIG: readonly ShipmentConfig[] = [
  {
    id: "shipment-11",
    title: "Партия №11",
    status: { label: "В работе", icon: "🧵" },
    eta: "Ожидаем отправку на текущей неделе",
    rawItems: [
      {
        productId: "python-004",
        overrideName: "Жакет приталенный из кожи питона — бежевый глянец",
        sizes: { xs: 5, s: 5 },
        status: "in_progress",
      },
      {
        productId: "python-005",
        overrideName: "Жакет приталенный из кожи питона — бежевый матовый",
        sizes: { xs: 2, s: 3 },
        status: "in_progress",
      },
      {
        productId: "pony-001",
        overrideName: "Жакет приталенный из меха пони чёрный",
        sizes: { xs: 1, s: 3 },
        status: "ready",
      },
      {
        productId: "suede-002",
        overrideName: "Жакет из бежевой замши в стиле 80-х",
        sizes: { s: 1 },
        status: "ready",
      },
      {
        productId: "merino-002",
        overrideName: "Штаны из бежевого мериноса",
        sizes: { xs: 11, s: 7, m: 2 },
        status: "in_progress",
      },
      {
        productId: "merino-001",
        overrideName: "Дублёнка из бежевого мериноса",
        sizes: { xs: 12, s: 8 },
        status: "in_progress",
      },
      {
        productId: "python-003",
        overrideName: "Жакет приталенный из кожи питона — чёрный глянец",
        sizes: { xs: 3, s: 3 },
        status: "ready",
      },
      {
        productId: "python-002",
        overrideName: "Жакет приталенный из кожи питона — коричневый глянец",
        sizes: { xs: 1, s: 3 },
        status: "ready",
      },
      {
        productId: "python-007",
        overrideName: "Юбка из чёрного глянцевого питона",
        sample: true,
        quantityOverride: 1,
        note: "образец",
        status: "ready",
        inTransit: true, // Статус "уже в пути"
        showStatusTag: true, // Включить отображение подписи-статуса
      },
      {
        productId: "fur-003",
        overrideName: "Дублёнка таскана волк",
        sample: true,
        quantityOverride: 1,
        note: "образец",
        status: "in_progress",
      },
    ],
  },
  {
    id: "shipment-10",
    title: "Партия №10",
    status: { label: "Получено, оплачено", icon: "✅" },
    receivedDate: "04.11.2025",
    groupByPayment: false,
    rawItems: [
      {
        productId: "suede-003",
        overrideName: "Жакет из коричневой замши в стиле 80-х",
        sizes: { xs: 5, s: 5 },
        status: "received",
      },
      {
        productId: "suede-005",
        overrideName: "Брюки из коричневой замши",
        sizes: { xs: 4, s: 4, m: 2 },
        status: "received",
      },
      {
        productId: "suede-002",
        overrideName: "Жакет из бежевой замши в стиле 80-х",
        sizes: { xs: 3, s: 3 },
        status: "received",
      },
      {
        productId: "suede-004",
        overrideName: "Брюки из бежевой замши",
        sizes: { xs: 4, s: 4, m: 2 },
        status: "received",
      },
      {
        productId: "python-006",
        overrideName: "Жакет приталенный из кожи питона — чёрный матовый",
        sizes: { xs: 3, s: 3 },
        status: "received",
      },
      {
        productId: "python-002",
        overrideName: "Жакет приталенный из кожи питона — коричневый глянец",
        sizes: { xs: 3, s: 2 },
        status: "received",
      },
      {
        productId: "pony-001",
        overrideName: "Жакет приталенный из меха пони чёрный",
        sizes: { xs: 4, s: 2 },
        status: "received",
      },
      {
        productId: "pony-001",
        overrideName: "Жакет приталенный из меха пони чёрный",
        sizes: { xs: 1 },
        status: "received",
        paidPreviously: true,
        note: "оплачен ранее",
      },
      {
        productId: "pony-002",
        overrideName: "Штаны из меха пони чёрный",
        sizes: { xs: 6, s: 4 },
        status: "received",
      },
      {
        productId: "leather-002",
        overrideName: "Жакет из кожи Ermes Mouse в стиле 80-х",
        sizes: { xs: 3, s: 1 },
        status: "received",
      },
      {
        productId: "python-002",
        overrideName: "Жакет приталенный из кожи питона — коричневый глянец",
        sizes: { xs: 1, s: 2 },
        status: "received",
        paidPreviously: true,
        note: "оплачен ранее",
      },
      {
        productId: "suede-002",
        overrideName: "Жакет из бежевой замши в стиле 80-х",
        sizes: {},
        quantityOverride: 2,
        status: "received",
        noPayment: true,
        note: "вернулись после ремонта",
        showStatusTag: true, // Включить отображение подписи-статуса
      },
    ],
  },
];

const buildShipmentItems = (
  rawItems: readonly ShipmentRawItem[],
  products: Product[],
  { groupByPayment = false, shipmentId }: { groupByPayment?: boolean; shipmentId?: string } = {}
) => {
  const items = rawItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const price = typeof product?.price === "number" ? product.price : null;
    const sizeEntries = item.sizes ? Object.entries(item.sizes) : [];
    const computedQuantity = sizeEntries.reduce((acc, [, count]) => acc + count, 0);
    const effectiveQuantity = item.quantityOverride ?? (computedQuantity || (item.sample ? 1 : 0));
    const sizeLabels = sizeEntries.map(([size, count]) => `${size.toUpperCase()} × ${count}`);
    const total =
      price != null && effectiveQuantity != null && !item.paidPreviously && !item.noPayment
        ? price * effectiveQuantity
        : null;
    const quantityLabel = item.sample
      ? effectiveQuantity ? `${effectiveQuantity} шт.` : "образец"
      : `${effectiveQuantity ?? 0} шт.`;
    // Определяем статус: если указан inTransit, используем его, иначе берём status или по умолчанию
    const statusKey: ShipmentStatusKey = item.inTransit ? "inTransit" : (item.status ?? "in_progress");
    const statusMeta = SHIPMENT_STATUS_META[statusKey];
    const needsPayment = !item.paidPreviously && !item.noPayment;

    return {
      id: `${item.productId}-${effectiveQuantity}-${sizeLabels.join("-")}`,
      productId: item.productId,
      name: item.overrideName || product?.name || "Неизвестное изделие",
      sizeLabels,
      quantity: effectiveQuantity,
      quantityLabel,
      price,
      total,
      note: item.note,
      hasPrice: price != null,
      status: statusMeta,
      statusKey,
      paidPreviously: item.paidPreviously,
      noPayment: item.noPayment,
      needsPayment,
      inTransit: item.inTransit ?? false, // Флаг для отображения бейджа "уже в пути"
      showStatusTag: item.showStatusTag ?? false, // Флаг для отображения подписи-статуса (по умолчанию false)
    };
  });

  const sortByStatus = (a: typeof items[number], b: typeof items[number]) =>
    a.status.order - b.status.order || a.name.localeCompare(b.name);

  if (groupByPayment) {
    return items.sort((a, b) => {
      if (a.needsPayment !== b.needsPayment) {
        // Для партии №8: сначала "Оплачено" (needsPayment = true), потом "Оплачено ранее" (needsPayment = false)
        if (shipmentId === "shipment-10") {
          return a.needsPayment ? -1 : 1;
        }
        return a.needsPayment ? -1 : 1;
      }
      return sortByStatus(a, b);
    });
  }

  return items.sort(sortByStatus);
};

export default function HomePage() {
  const { isMobile, breakpoint } = useBreakpoint();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Десктоп = >=1024px (laptop и desktop)
  const isDesktop = breakpoint === "laptop" || breakpoint === "desktop";
  
  // Инициализация view из URL query параметра
  const urlView = searchParams.get("view") as "menu" | "catalog" | "money" | "work" | null;
  const initialView = (urlView && ["menu", "catalog", "money", "work"].includes(urlView)) ? urlView : "menu";
  
  const [view, setView] = useState<"menu" | "catalog" | "money" | "work">(initialView);
  const [previousView, setPreviousView] = useState<"menu" | "catalog" | "money" | "work" | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Синхронизация view с URL query параметром
  useEffect(() => {
    if (urlView && urlView !== view && ["menu", "catalog", "money", "work"].includes(urlView)) {
      setView(urlView);
    }
  }, [urlView, view]);

  // восстановление скролла и раскрытия партии
  useEffect(() => {
    if (view === "work" && typeof window !== "undefined") {
      const batchId = searchParams.get("batch");
      const posId = searchParams.get("pos");
      const hash = window.location.hash;

      // Раскрываем партию если есть ?batch=ID
      if (batchId) {
        setExpandedCards((prev) => {
          const newSet = new Set(prev);
          newSet.add(batchId);
          return newSet;
        });
      }

      // Восстанавливаем скролл и позицию
      const restoreScroll = () => {
        const savedScrollY = sessionStorage.getItem("workScrollY");
        if (savedScrollY) {
          const y = Number(savedScrollY);
          if (!Number.isNaN(y) && y > 0) {
            window.scrollTo({ top: y, behavior: "instant" });
          }
          sessionStorage.removeItem("workScrollY");
        }

        // Если есть якорь в URL, скроллим к нему
        if (hash && hash.startsWith("#pos-")) {
          const elementId = hash.substring(1);
          setTimeout(() => {
            const element = document.getElementById(elementId);
            if (element) {
              element.scrollIntoView({ block: "start", behavior: "instant" });
            }
          }, 100);
        }
      };

      // Небольшая задержка для рендеринга
      setTimeout(restoreScroll, 50);
    }
  }, [view, searchParams]);
  // Загрузка данных с обработкой ошибок (статический импорт)
  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  // Проверка на ошибки
  const error: string | null = useMemo(() => {
    if (products.length === 0) {
      return "Нет данных о продуктах";
    }
    return null;
  }, [products]);

  const menuItems = useMemo(
    () => [
      {
        title: "Посмотреть, что по бабкам",
        description: "Финансы, депозиты и расчёты с Мехметом — где деньги, Лебовски?",
        onClick: () => setView("money"),
        icon: "💰",
        image: "/images/products/что по бабкам.JPG",
      },
      {
        title: "Проконтролировать работу",
        description: "Посмотри, кто что шьёт, что готово, что на ремонте и у кого кофе закончился.",
        onClick: () => setView("work"),
        icon: "🧥",
        image: "/images/products/Проконтролировать работу.jpg",
      },
      {
        title: "Каталог изделий",
        description: "Листай, смотри, восхищайся",
        onClick: () => setView("catalog"),
        icon: "📦",
        image: "/images/products/Каталог.JPG",
      },
    ],
    []
  );

  const categoryDescriptions: Record<string, string> = useMemo(
    () => ({
      "Мех": "Меринос, чернобурка, нутрия — всё, что хочется гладить.",
      "Замша": "Мягкая, как голос Мехмета, когда он говорит про сроки.",
      "Кожа": "Коровка старалась, не подведи её в каталоге.",
      "Экзотика": "Для тех, кто любит, чтобы шкура шипела дорого.",
    }),
    []
  );

  // Оптимизированная генерация категорий
  const catalogGroups = useMemo(() => {
    const categoryMap = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryMap).map(([cat, count]) => ({
      title: cat,
      desc: categoryDescriptions[cat] || "",
      badge: `${count} ${count === 1 ? "позиция" : "позиций"}`,
    }));
  }, [products]);

  // Оптимизированная фильтрация продуктов по категории
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((p: Product) => p.category === selectedCategory && p.inStock);
  }, [products, selectedCategory]);


  const shipmentCellBaseBackground = COLORS.background.card;
  const shipmentCellHoverBackground = COLORS.background.cardExpanded;
  const shipmentCellBaseBorder = COLORS.border.default;
  const shipmentCellHoverBorder = COLORS.border.primaryHover;

  const handleShipmentRowHover = useCallback(
    (event: MouseEvent<HTMLDivElement>, isHover: boolean) => {
      const row = event.currentTarget;
      const cells = Array.from(row.children) as HTMLElement[];
      cells.forEach((cell) => {
        cell.style.background = isHover ? shipmentCellHoverBackground : shipmentCellBaseBackground;
        cell.style.borderBottom = `1px solid ${isHover ? shipmentCellHoverBorder : shipmentCellBaseBorder}`;
      });
    },
    [shipmentCellBaseBackground, shipmentCellHoverBackground, shipmentCellBaseBorder, shipmentCellHoverBorder]
  );

  const allShipments = useMemo(
    () =>
      SHIPMENTS_CONFIG.map((config) => {
        const items = buildShipmentItems(config.rawItems, products, { groupByPayment: config.groupByPayment, shipmentId: config.id });
        const totalAmount = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
        const hasPriceGaps = items.some((item) => item.total == null);

        return {
          ...config,
          items,
          totalAmount,
          hasPriceGaps,
        };
      }),
    [products]
  );


  const handleBack = () => {
    // Guard clause: если выбрана категория, закрываем её
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }

    // Guard clause: если не в меню, возвращаемся в меню
    if (view !== "menu") {
      setView("menu");
      setPreviousView(null);
      // Обновляем URL для возврата в меню
      router.push("/");
    }
  };

  const handleToggleCard = useCallback((cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const BackButton = (view !== "menu" || selectedCategory) ? (
    <button
      onClick={handleBack}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.currentTarget.style.background = STYLES.buttonHover.background;
          e.currentTarget.style.border = STYLES.buttonHover.border;
          e.currentTarget.style.transform = STYLES.buttonHover.transform;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.background = STYLES.button.background;
          e.currentTarget.style.border = STYLES.button.border;
        e.currentTarget.style.transform = "translateX(0)";
        }
      }}
      style={{
        ...STYLES.button,
        padding: isMobile ? "8px 16px" : STYLES.button.padding,
        fontSize: isMobile ? 12 : STYLES.button.fontSize,
      }}
    >
      <span style={{ fontSize: isMobile ? 14 : 18 }}>←</span> Назад
    </button>
  ) : null;

  const renderBody = () => {
    if (error && products.length === 0) {
      return (
        <div style={{ flex: 1, padding: SPACING.xl, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p style={{ color: COLORS.error, fontSize: 16 }}>{error}</p>
    </div>
  );
    }

    if (view === "money") {
      const shipment11Total = allShipments.find((s) => s.id === "shipment-11")?.totalAmount ?? 0;
      const shipment10Total = allShipments.find((s) => s.id === "shipment-10")?.totalAmount ?? 0;
      const materialPrepayment = 3100;
      // Партия №10 оплачена, предоплата перенесена в депозиты - остаётся только партия 11
      const totalPayment = shipment11Total;
      
      return (
        <MoneyView
          expandedCards={expandedCards}
          onToggleCard={handleToggleCard}
          shipment11Total={shipment11Total}
          shipment10Total={shipment10Total}
          materialPrepayment={materialPrepayment}
          totalPayment={totalPayment}
        />
      );
    }

    if (view === "catalog") {
      // Удалён альтернативный рендер карточки из 'work' - теперь используется единый маршрут /catalog/[id]
      if (selectedCategory) {
        return (
          <div style={{ flex: 1, padding: isMobile ? SPACING.md : SPACING.xl }}>
            <div style={{ marginBottom: isMobile ? SPACING.md : SPACING.lg }}>
              <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 12 : 13, fontStyle: "italic" }}>
                {categoryDescriptions[selectedCategory]}
              </p>
                  </div>
            <div style={{ display: "grid", gap: isMobile ? SPACING.md : SPACING.lg, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
                        </div>
                        </div>
        );
      }

      return (
        <div style={{ flex: 1, padding: isMobile ? SPACING.md : SPACING.xl }}>
          <div style={{ marginBottom: isMobile ? SPACING.md : SPACING.lg }}>
            <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: COLORS.primary, marginBottom: 6 }}>
              Каталог
            </h2>
            <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 12 : 13, fontStyle: "italic" }}>
              Выбери, чем сегодня восхищаться.
            </p>
                  </div>
          <div style={{ display: "grid", gap: isMobile ? SPACING.md : 20, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {catalogGroups.map((g, i) => (
              <CategoryCard
                key={i}
                title={g.title}
                description={g.desc}
                badge={g.badge}
                onClick={() => setSelectedCategory(g.title as string)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (view === "work") {
      // Единая типографика для раздела "work"
      const TYPOGRAPHY = {
        h2: { fontSize: isMobile ? 24 : 32, fontWeight: 900, lineHeight: 1.2 },
        h3: { fontSize: isMobile ? 20 : 24, fontWeight: 800, lineHeight: 1.3 },
        body: { fontSize: 12, lineHeight: 1.5 },
        caption: { fontSize: 10, lineHeight: 1.4 },
        amount: { fontSize: isMobile ? 24 : 32, fontWeight: 900, lineHeight: 1.1 },
        tableHeader: { fontSize: isMobile ? 10 : 12, lineHeight: 1.4 },
        tableCell: { fontSize: isMobile ? 11 : 12, lineHeight: 1.5 },
      };

      const renderShipmentCard = (shipment: typeof allShipments[0]) => {
        const isExpanded = expandedCards.has(shipment.id);
        
        // Стили контейнера карточки: скругление 16-20px, тонкая рамка, мягкая тень, паддинг 20-24px
        const CARD_STYLE = {
          background: COLORS.background.card,
          border: `1px solid ${COLORS.border.default}`,
          borderRadius: isMobile ? 16 : 20,
          padding: isMobile ? 20 : 24,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)",
          transition: "all 0.2s ease",
        };

        // Единый чип статуса с правильными размерами: h-7, px-3, радиус pill
        // Лёгкое уменьшение шрифта и высоты капсулы для статусов партий
        const STATUS_CHIP = {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          // Mobile (≤430px): padding: 3px 10px; Desktop: padding: 4px 12px
          // Горизонтальные отступы (padding-left/right) оставлены прежними
          padding: isMobile ? "3px 10px" : "4px 12px",
          // Высота пропорционально подогнана (не оставлять лишнего вертикального пространства)
          // height убран, чтобы высота определялась автоматически по padding и line-height
          borderRadius: 999, // pill (border-radius оставить как есть)
          // Mobile (≤430px): font-size: clamp(11px, 2vw, 12px); Desktop: font-size: clamp(12px, 0.9vw, 13px)
          fontSize: isMobile ? "clamp(11px, 2vw, 12px)" : "clamp(12px, 0.9vw, 13px)",
          fontWeight: 600,
          lineHeight: 1, // line-height: 1
          border: "1px solid",
          background: shipment.id === "shipment-10" ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
          color: shipment.id === "shipment-10" ? COLORS.success : COLORS.primary,
          borderColor: shipment.id === "shipment-10" ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)",
        };

        // Заменяем пробел между "Партия" и "№9" на неразрывный пробел
        const titleWithNonBreakingSpace = shipment.title.replace(/\s+№/, "\u00A0№");
        
        return (
          <div
            key={shipment.id}
            role="button"
            tabIndex={0}
            onClick={() => handleToggleCard(shipment.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggleCard(shipment.id);
              }
            }}
                    style={{
              ...CARD_STYLE,
                      cursor: "pointer",
              outline: "none",
                    }}
                    onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = COLORS.background.cardExpanded;
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
                    }}
                    onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.background = CARD_STYLE.background;
                e.currentTarget.style.boxShadow = CARD_STYLE.boxShadow;
                      e.currentTarget.style.transform = "translateY(0)";
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${COLORS.primary}`;
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
                    }}
            aria-expanded={isExpanded}
            aria-label={`${shipment.title}, ${shipment.status.label}`}
          >
            {/* Сетка: >=1024px - 2 колонки (1fr + auto), <1024px - 1 колонка */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr auto" : "1fr",
                gap: isDesktop ? SPACING.lg : SPACING.md,
                      alignItems: "center",
                minHeight: isDesktop ? 60 : "auto",
              }}
            >
              {/* Левая колонка: иконка, статус, заголовок */}
              <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                  {/* Иконка стрелки */}
                  <span
                        style={{
                      fontSize: isMobile ? 14 : 18,
                      color: COLORS.primary,
                      transition: "transform 0.3s ease",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      flexShrink: 0,
                      lineHeight: 1,
                        }}
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                  
                  {/* Заголовок в одну строку (nowrap) */}
                  <h3
                    style={{
                      ...TYPOGRAPHY.h3,
                      color: COLORS.primary,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {titleWithNonBreakingSpace}
                      </h3>
                </div>
                
                {/* Статус как единый чип */}
                <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
                  <div
                    style={STATUS_CHIP}
                    role="status"
                    aria-label={`Статус: ${shipment.status.label}`}
                  >
                    {/* Иконка пропорционально уменьшена: Mobile: clamp(12px, 2vw, 13px); Desktop: clamp(13px, 0.9vw, 14px) */}
                    <span
                      style={{
                        fontSize: isMobile ? "clamp(12px, 2vw, 13px)" : "clamp(13px, 0.9vw, 14px)",
                        lineHeight: 1,
                      }}
                      aria-hidden="true"
                    >
                      {shipment.status.icon}
                    </span>
                    {/* Текст использует fontSize из STATUS_CHIP, поэтому здесь не переопределяем */}
                    <span style={{ textTransform: "uppercase" }}>{shipment.status.label}</span>
                  </div>
                </div>
              </div>

              {/* Правая колонка: блок мета (план/дата) - выровнен по центру, компактные отступы */}
              {isDesktop && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 4,
                    minHeight: 60,
                    paddingRight: SPACING.md,
                  }}
                >
                  {shipment.receivedDate ? (
                    <>
                      <p
                        style={{
                          ...TYPOGRAPHY.caption,
                          color: "rgba(212, 212, 212, 0.6)",
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                          textAlign: "right",
                        }}
                      >
                        Дата получения
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                          textAlign: "right",
                        }}
                        aria-label={`Дата получения: ${shipment.receivedDate}`}
                      >
                        {shipment.receivedDate}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          ...TYPOGRAPHY.caption,
                          color: "rgba(212, 212, 212, 0.6)",
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                          textAlign: "right",
                        }}
                      >
                        План доставки
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                          textAlign: "right",
                        }}
                        aria-label={`План доставки: ${shipment.eta}`}
                      >
                        {shipment.eta}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* На мобиле: блок мета в одну колонку под заголовком */}
              {!isDesktop && (
                <div
                                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: SPACING.xs,
                    marginTop: SPACING.xs,
                    paddingTop: SPACING.sm,
                    borderTop: `1px solid ${COLORS.border.default}`,
                  }}
                >
                  {shipment.receivedDate ? (
                    <>
                      <p
                        style={{
                          ...TYPOGRAPHY.caption,
                          color: COLORS.text.muted,
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        Дата получения
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                                }}
                        aria-label={`Дата получения: ${shipment.receivedDate}`}
                      >
                        {shipment.receivedDate}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          ...TYPOGRAPHY.caption,
                          color: COLORS.text.muted,
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        План доставки
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                        }}
                        aria-label={`План доставки: ${shipment.eta}`}
                      >
                        {shipment.eta}
                      </p>
                    </>
                  )}
                          </div>
                        )}
                      </div>

            {/* Разделитель между заголовком и содержимым */}
            {isExpanded && (
              <>
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: COLORS.border.default,
                    marginTop: SPACING.md,
                    marginBottom: SPACING.md,
                  }}
                  aria-hidden="true"
                />
                {/* Таблица с позициями партии */}
                <BatchView
                  batch={toBatch(shipment, products)}
                  onRowHover={handleShipmentRowHover}
                  cellBaseBackground={shipmentCellBaseBackground}
                  cellBaseBorder={shipmentCellBaseBorder}
                  typography={TYPOGRAPHY}
                />

              {/* Итого по партии - лейблы слева, суммы справа */}
              <div
                style={{ 
                  display: "flex", 
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: SPACING.md,
                  borderTop: `1px solid ${COLORS.border.default}`,
                  paddingTop: SPACING.md,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* NOTE: All prices are in USD dollars only */}
                  <p style={{ ...TYPOGRAPHY.body, margin: 0, color: COLORS.text.secondary }}>
                    Итого по партии
                  </p>
                  {shipment.hasPriceGaps && (
                    <p style={{ ...TYPOGRAPHY.caption, margin: 0, marginTop: 4, color: COLORS.text.muted, overflowWrap: "break-word", wordBreak: "break-word", whiteSpace: "normal" }}>
                      Без учёта позиций с уточняемой стоимостью, оплаченных ранее или без оплаты
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ ...TYPOGRAPHY.caption, margin: 0, color: COLORS.text.secondary, textTransform: "uppercase" }}>
                    {shipment.receivedDate ? "Сумма партии" : "Сумма к оплате"}
                  </p>
                  <p style={{ ...TYPOGRAPHY.amount, margin: 0, color: shipment.receivedDate || shipment.id === "shipment-10" ? COLORS.success : COLORS.primary }}>
                    {formatCurrency(shipment.totalAmount)}
                  </p>
              </div>
          </div>

                  {shipment.hasPriceGaps && (
                    <p style={{ ...TYPOGRAPHY.body, margin: 0, marginTop: SPACING.sm, color: COLORS.text.secondary, fontStyle: "italic", overflowWrap: "break-word", wordBreak: "break-word", whiteSpace: "normal" }}>
                      Стоимость по отдельным образцам, оплаченным ранее или возвращённым после ремонта не включена.
                    </p>
                  )}
                </>
              )}
        </div>
      );
      };

      return (
        <div style={{ flex: 1, padding: isMobile ? SPACING.md : SPACING.xl, display: "flex", flexDirection: "column", gap: isMobile ? SPACING.md : SPACING.lg }}>
          <div>
            <h2
              style={{
                fontSize: isMobile ? 24 : 32,
                fontWeight: 900,
                color: COLORS.primary,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Что сейчас в работе <span style={{ fontSize: isMobile ? 20 : 28 }}>🧵</span>
            </h2>
            <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 12 : 13, fontStyle: "italic" }}>
              Актуальные партии, статусы и суммы по поставкам.
            </p>
          </div>

          {allShipments.map((shipment) => renderShipmentCard(shipment))}
        </div>
      );
    }

    return (
      <main
        style={{
          flex: 1,
          padding: 12,
          display: "grid",
          gap: SPACING.lg,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.3)";
              e.currentTarget.style.border = `1px solid ${COLORS.border.primaryHover}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
              e.currentTarget.style.border = `1px solid ${COLORS.border.default}`;
            }}
            style={{
              ...STYLES.card,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.primary }}>{item.title}</h2>
            </div>
            {item.image && (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  marginBottom: 6,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: COLORS.background.card,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <p style={{ color: COLORS.text.primary, fontSize: 12, fontStyle: "italic", lineHeight: 1.5 }}>
              {item.description}
            </p>
          </div>
        ))}
      </main>
    );
  };

  return (
    <div
      style={{
      minHeight: "100vh", 
        background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
      color: "white", 
      display: "flex", 
        flexDirection: "column",
      }}
    >
      <header
        style={{
        display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
        alignItems: "center", 
          padding: isMobile ? "8px 16px" : "0px 32px",
          borderBottom: `1px solid rgba(102,102,102,0.2)`,
          background: COLORS.background.header,
          backdropFilter: "blur(10px)",
          gap: isMobile ? SPACING.sm : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, justifyContent: isMobile ? "space-between" : "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
            <span style={{ fontSize: isMobile ? 24 : 36 }}>⚡</span>
            <h1
              style={{
                fontSize: isMobile ? 28 : 44,
                fontWeight: 900,
                letterSpacing: -1.5,
                color: COLORS.primary,
                textShadow: "0 0 20px rgba(251,191,36,0.5)",
              }}
            >
            Mehmet Metrics
          </h1>
        </div>
          {isMobile && BackButton}
        </div>
        {!isMobile && (
          <>
        {selectedCategory ? (
          <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: COLORS.primary, margin: 0 }}>
              {selectedCategory}
            </h2>
          </div>
        ) : (
          <div></div>
        )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>{BackButton}</div>
          </>
        )}
        {isMobile && selectedCategory && (
          <div style={{ textAlign: "center", borderTop: `1px solid rgba(102,102,102,0.2)`, paddingTop: SPACING.xs }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.primary, margin: 0 }}>
                {selectedCategory}
              </h2>
        </div>
        )}
      </header>
      {renderBody()}
      <footer
        style={{
        padding: 20, 
        textAlign: "center", 
          color: COLORS.text.muted,
          borderTop: `1px solid rgba(102,102,102,0.2)`,
        fontSize: 12, 
        fontStyle: "italic",
          background: COLORS.background.footer,
        }}
      >
        Сделано с любовью и лёгким запахом кожи © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
