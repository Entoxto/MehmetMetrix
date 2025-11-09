"use client";

import { Suspense, useMemo } from "react";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";
import { useBreakpoint } from "@/constants/responsive";
import { STYLES, COLORS, SPACING } from "@/constants/styles";
import { MoneyView } from "@/components/MoneyView";
import { UpSector } from "./home/UpSector";
import { DownSector } from "./home/DownSector";
import { MenuView, type MenuItem } from "./home/views/MenuView";
import { CatalogView } from "./home/views/CatalogView";
import { WorkView } from "./home/views/WorkView";
import { useHomeState } from "@/hooks/useHomeState";
import { buildShipments } from "@/lib/shipments";

function HomePageContent() {
  const { isMobile, breakpoint } = useBreakpoint();
  const isDesktop = breakpoint === "laptop" || breakpoint === "desktop";

  const {
    view,
    setView,
    selectedCategory,
    setSelectedCategory,
    expandedCards,
    toggleCard,
    handleBack,
  } = useHomeState();

  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  const error = useMemo(() => {
    if (products.length === 0) {
      return "Нет данных о продуктах";
    }
    return null;
  }, [products]);

  const shipments = useMemo(() => buildShipments(products), [products]);

  const menuItems = useMemo<MenuItem[]>(
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
    [setView]
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
  }, [categoryDescriptions, products]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((product) => product.category === selectedCategory && product.inStock);
  }, [products, selectedCategory]);

  const BackButton =
    view !== "menu" || selectedCategory ? (
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

  const renderContent = () => {
    if (error && products.length === 0) {
      return (
        <div
          style={{
            flex: 1,
            padding: SPACING.xl,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p style={{ color: COLORS.error, fontSize: 16 }}>{error}</p>
        </div>
      );
    }

    if (view === "money") {
      const shipment11Total = shipments.find((s) => s.id === "shipment-11")?.totalAmount ?? 0;
      const materialPrepayment = 3100;
      const totalPayment = shipment11Total;

      return (
        <MoneyView
          expandedCards={expandedCards}
          onToggleCard={toggleCard}
          shipment11Total={shipment11Total}
          materialPrepayment={materialPrepayment}
          totalPayment={totalPayment}
        />
      );
    }

    if (view === "catalog") {
      return (
        <CatalogView
          isMobile={isMobile}
          selectedCategory={selectedCategory}
          categoryDescriptions={categoryDescriptions}
          catalogGroups={catalogGroups}
          categoryProducts={categoryProducts}
          onSelectCategory={setSelectedCategory}
        />
      );
    }

    if (view === "work") {
      return (
        <WorkView
          isMobile={isMobile}
          isDesktop={isDesktop}
          shipments={shipments}
          expandedCards={expandedCards}
          onToggleCard={toggleCard}
        />
      );
    }

    return <MenuView items={menuItems} />;
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
      <UpSector>
        <div
          style={{
            display: isMobile ? "flex" : "grid",
            flexDirection: isMobile ? "column" : undefined,
            gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
            alignItems: "center",
            gap: isMobile ? SPACING.sm : 0,
            padding: isMobile ? "8px 16px" : "0px 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 8 : 14,
              justifyContent: isMobile ? "space-between" : "flex-start",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
              <span style={{ fontSize: isMobile ? 24 : 36 }}>⚡</span>
              <h1
                style={{
                  fontSize: isMobile ? 28 : 44,
                  fontWeight: 900,
                  letterSpacing: -1.5,
                  color: COLORS.primary,
                  textShadow: "0 0 20px rgba(251,191,36,0.5)",
                  margin: 0,
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
                <div />
              )}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>{BackButton}</div>
            </>
          )}
        </div>
        {isMobile && selectedCategory && (
          <div
            style={{
              textAlign: "center",
              borderTop: `1px solid rgba(102,102,102,0.2)`,
              paddingTop: SPACING.xs,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.primary, margin: 0 }}>
              {selectedCategory}
            </h2>
          </div>
        )}
      </UpSector>
      {renderContent()}
      <DownSector />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
            color: COLORS.text.primary,
          }}
        >
          Загрузка...
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

