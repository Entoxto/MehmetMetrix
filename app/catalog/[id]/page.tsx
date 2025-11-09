"use client";

/**
 * Единый маршрут карточки (как в каталоге)
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { useEffect, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { STYLES, COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;

  const productId = params.id as string;

  // Загрузка данных
  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  // Безопасный back + fallback
  const handleBack = () => {
    const from = searchParams.get("from");
    const batch = searchParams.get("batch");
    const pos = searchParams.get("pos");

    if (from === "work") {
      const params = new URLSearchParams();
      params.set("view", "work");
      if (batch) params.set("batch", batch);
      if (pos) params.set("pos", pos);
      const hash = pos ? `#pos-${pos}` : "";
      router.push(`/?${params.toString()}${hash}`);
    } else if (from === "catalog") {
      router.push("/?view=catalog", { scroll: false });
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/?view=catalog", { scroll: false });
    }
  };

  if (!product) {
    return (
      <div
        style={{
          flex: 1,
          padding: isCompact ? 16 : 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <p style={{ color: COLORS.error, fontSize: 16 }}>Товар не найден</p>
        <button
          onClick={handleBack}
          style={{
            ...STYLES.button,
            padding: isCompact ? "8px 16px" : STYLES.button.padding,
            fontSize: isCompact ? 12 : STYLES.button.fontSize,
          }}
        >
          <span style={{ fontSize: isCompact ? 14 : 18 }}>←</span> Назад
        </button>
      </div>
    );
  }

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
          gridTemplateColumns: isCompact ? "1fr" : "1fr auto",
          alignItems: isCompact ? "stretch" : "center",
          padding: isCompact ? "8px 16px" : "16px 32px",
          minHeight: isCompact ? "auto" : "80px",
          borderBottom: `1px solid rgba(102,102,102,0.2)`,
          background: COLORS.background.header,
          backdropFilter: "blur(10px)",
          gap: isCompact ? SPACING.sm : SPACING.md,
        }}
      >
        <h1
          style={{
            fontSize: isCompact ? 18 : 22,
            fontWeight: 900,
            color: COLORS.primary,
            margin: 0,
            paddingTop: isCompact ? 0 : "10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            lineHeight: 1.3,
            wordBreak: "break-word",
            maxWidth: isCompact ? "100%" : "calc(100% - 140px)",
            textAlign: isCompact ? "center" : "left",
          }}
        >
          {product.name}
        </h1>
        <div style={{ 
          display: "flex", 
          justifyContent: isCompact ? "center" : "flex-end",
          marginTop: isCompact ? SPACING.sm : "6px",
        }}>
          <button
            onClick={handleBack}
            onMouseEnter={(e) => {
              if (!isCompact) {
                e.currentTarget.style.background = STYLES.buttonHover.background;
                e.currentTarget.style.border = STYLES.buttonHover.border;
                e.currentTarget.style.transform = STYLES.buttonHover.transform;
              }
            }}
            onMouseLeave={(e) => {
              if (!isCompact) {
                e.currentTarget.style.background = STYLES.button.background;
                e.currentTarget.style.border = STYLES.button.border;
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
            style={{
              ...STYLES.button,
              padding: isCompact ? "8px 16px" : STYLES.button.padding,
              fontSize: isCompact ? 12 : STYLES.button.fontSize,
            }}
          >
            <span style={{ fontSize: isCompact ? 14 : 18 }}>←</span> Назад
          </button>
        </div>
      </header>
      <ProductDetail product={product} />
    </div>
  );
}

