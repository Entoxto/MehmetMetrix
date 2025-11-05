"use client";

import React from "react";
import { STYLES, COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { isMobile } = useBreakpoint();

  // Единая типографика
  const TYPOGRAPHY = {
    h1: { fontSize: isMobile ? 24 : 32, fontWeight: 800, lineHeight: 1.3 },
    h2: { fontSize: isMobile ? 14 : 16, fontWeight: 600, lineHeight: 1.4 },
    body: { fontSize: isMobile ? 14 : 16, lineHeight: 1.5 },
    caption: { fontSize: isMobile ? 11 : 12, lineHeight: 1.4 },
    price: { fontSize: isMobile ? 32 : 40, fontWeight: 700, lineHeight: 1.2 },
  };

  // Стили для чипов размеров
  const SIZE_CHIP_STYLE = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isMobile ? "10px 16px" : "12px 20px",
    borderRadius: 8,
    fontSize: isMobile ? 14 : 16,
    fontWeight: 600,
    lineHeight: 1.4,
    border: "1px solid",
    transition: "all 0.2s ease",
    cursor: "default",
    background: "rgba(251,191,36,0.15)",
    color: COLORS.primary,
    borderColor: "rgba(251,191,36,0.3)",
  };

  // Единые стили для фото
  const PHOTO_STYLE = {
    borderRadius: isMobile ? 16 : 20,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
    overflow: "hidden" as const,
    background: COLORS.background.cardExpanded,
  };

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.md : SPACING.xl,
        paddingBottom: isMobile ? SPACING.xl * 2 : SPACING.xl, // Безопасный отступ для toast на мобиле
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "1fr 1fr",
        gap: isMobile ? SPACING.lg : SPACING.xl,
        alignItems: isMobile ? undefined : "stretch",
        maxWidth: isMobile ? "100%" : "none",
      }}
    >
      {/* Фото товара - квадратное (1:1) */}
      <div
        style={{
          width: "100%",
          aspectRatio: isMobile ? undefined : "1 / 1",
          height: isMobile ? 300 : "auto",
          maxWidth: isMobile ? "100%" : "500px",
          ...PHOTO_STYLE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <img
          src={product.photo}
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            target.parentElement!.innerHTML = `<span style="color: ${COLORS.text.muted}; font-size: ${isMobile ? 48 : 80}px;">📷</span>`;
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Информация о товаре - вертикальная раскладка */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? SPACING.lg : SPACING.xl,
          flex: 1,
          minHeight: isMobile ? "auto" : 0, // Для одинаковой высоты с фото на десктопе
        }}
      >
        {/* Размеры */}
        <div>
          <p
            style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: 0,
              marginBottom: SPACING.sm,
            }}
          >
            Размеры
          </p>
          <div style={{ display: "flex", gap: SPACING.sm, flexWrap: "wrap" }}>
            {product.sizes.map((size: string, i: number) => (
              <span key={i} style={SIZE_CHIP_STYLE}>
                {size.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Цена */}
        <div>
          <p
            style={{
              ...TYPOGRAPHY.caption,
              color: COLORS.text.secondary,
              textTransform: "uppercase",
              letterSpacing: 1,
              margin: 0,
              marginBottom: SPACING.sm,
            }}
          >
            {/* NOTE: All prices are in USD dollars only */}
            Цена
          </p>
          {product.price ? (
            <p style={{ ...TYPOGRAPHY.price, color: COLORS.success, margin: 0 }}>
              {formatCurrency(product.price)}
            </p>
          ) : (
            <p style={{ ...TYPOGRAPHY.price, color: COLORS.primary, margin: 0 }}>
              уточняется
            </p>
          )}
        </div>

        {/* Материалы */}
        {product.materials && (
          <div
            style={{
              paddingTop: SPACING.lg,
              borderTop: `1px solid ${COLORS.border.default}`,
            }}
          >
            <p
              style={{
                ...TYPOGRAPHY.caption,
                color: COLORS.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 1,
                margin: 0,
                marginBottom: SPACING.md,
              }}
            >
              Материалы
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
              {product.materials.outer && (
                <div>
                  <p
                    style={{
                      ...TYPOGRAPHY.caption,
                      color: COLORS.text.secondary,
                      margin: 0,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Верхний материал
                  </p>
                  <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.outer}
                  </p>
                </div>
              )}
              {product.materials.lining && (
                <div>
                  <p
                    style={{
                      ...TYPOGRAPHY.caption,
                      color: COLORS.text.secondary,
                      margin: 0,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Подкладка
                  </p>
                  <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.lining}
                  </p>
                </div>
              )}
              {product.materials.comments && (
                <div>
                  <p
                    style={{
                      ...TYPOGRAPHY.caption,
                      color: COLORS.text.secondary,
                      margin: 0,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Примечания
                  </p>
                  <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.comments}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

