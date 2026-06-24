"use client";

import { useState } from "react";
import Link from "next/link";
import { CARD_TEMPLATES, COLORS, MOTION, SPACING, STYLES, TYPOGRAPHY } from "@/constants/styles";
import { formatCurrency, formatCurrencyRUB } from "@/lib/format";
import { ProductMaterials } from "@/components/product/ProductMaterials";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
  isCompact: boolean;
  desktopMinHeight: number;
}

export const ProductInfo = ({
  product,
  isCompact,
  desktopMinHeight,
}: ProductInfoProps) => {
  const [isCategoryLinkHovered, setIsCategoryLinkHovered] = useState(false);
  const hasMaterials = Boolean(
    product.materials?.outer || product.materials?.lining || product.materials?.comments
  );

  const responsiveTypography = {
    h1: { ...TYPOGRAPHY.h1, fontSize: isCompact ? 24 : 32 },
    h2: { ...TYPOGRAPHY.h2, fontSize: isCompact ? 14 : 16 },
    body: { ...TYPOGRAPHY.body, fontSize: isCompact ? 14 : 16 },
    caption: { ...TYPOGRAPHY.caption, fontSize: isCompact ? 11 : 12 },
    price: { fontSize: isCompact ? 32 : 40, fontWeight: 700, lineHeight: 1.2 },
  };

  const sizeChipStyle = {
    ...STYLES.sizeBadge,
    padding: isCompact ? "10px 16px" : "12px 20px",
    fontSize: isCompact ? 14 : 16,
  };

  const sectionHeaderStyle = {
    ...responsiveTypography.caption,
    color: COLORS.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    margin: 0,
    marginBottom: SPACING.sm,
  };

  const categoryHref = `/catalog?category=${encodeURIComponent(product.category)}`;
  const categoryLinkStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "max-content",
    textDecoration: "none",
    cursor: "pointer",
    background: isCategoryLinkHovered ? "rgba(244,195,77,0.14)" : COLORS.background.accent,
    color: COLORS.primary,
    padding: isCompact ? "8px 16px" : "9px 18px",
    borderRadius: 999,
    border: `1px solid ${isCategoryLinkHovered ? COLORS.border.primaryHover : COLORS.border.primary}`,
    fontSize: isCompact ? 12 : 13,
    fontWeight: 700,
    lineHeight: 1,
    boxShadow: isCategoryLinkHovered
      ? "0 10px 24px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255,255,255,0.05)"
      : "inset 0 1px 0 rgba(255,255,255,0.04)",
    transform: isCategoryLinkHovered ? "translateY(-1px)" : "translateY(0)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
  } as const;

  return (
    <div
      style={{
        ...CARD_TEMPLATES.introCard(isCompact),
        gap: isCompact ? SPACING.lg : SPACING.lg,
        width: "100%",
        minHeight: isCompact ? "auto" : `${desktopMinHeight}px`,
        justifyContent: "space-between",
        animation: MOTION.staggerEnter(1, 110),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: isCompact ? SPACING.lg : SPACING.md, minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: SPACING.sm }}>
            <Link
              href={categoryHref}
              style={categoryLinkStyle}
              aria-label={`Открыть категорию ${product.category} в каталоге`}
              onMouseEnter={() => setIsCategoryLinkHovered(true)}
              onMouseLeave={() => setIsCategoryLinkHovered(false)}
              onTouchStart={() => setIsCategoryLinkHovered(true)}
              onTouchEnd={() => setIsCategoryLinkHovered(false)}
            >
              {product.category}
              <span
                aria-hidden="true"
                style={{
                  fontSize: isCompact ? 12 : 13,
                  transform: isCategoryLinkHovered ? "translateX(1px)" : "translateX(0)",
                  transition: "transform 0.2s ease",
                }}
              >
                →
              </span>
            </Link>
          </div>
          <h1
            style={{
              ...responsiveTypography.h1,
              color: COLORS.text.primary,
              margin: 0,
              fontSize: isCompact ? 24 : 28,
              lineHeight: 1.15,
              letterSpacing: -0.6,
            }}
          >
            {product.name}
          </h1>
        </div>

        <div>
          <p style={sectionHeaderStyle}>
            Размеры
          </p>
          <div style={{ display: "flex", gap: SPACING.sm, flexWrap: "wrap" }}>
            {product.sizes.length > 0 ? product.sizes.map((size) => (
              <span key={size} style={sizeChipStyle}>
                {size.toUpperCase()}
              </span>
            )) : (
              <span style={{ ...sizeChipStyle, color: COLORS.text.muted }}>
                нет данных
              </span>
            )}
          </div>
        </div>

        <div>
          <p style={sectionHeaderStyle}>
            Цена
          </p>
          {product.price ? (
            <p style={{ ...responsiveTypography.price, color: COLORS.success, margin: 0 }}>
              {formatCurrency(product.price)}
            </p>
          ) : (
            <p style={{ ...responsiveTypography.price, color: COLORS.primary, margin: 0 }}>
              уточняется
            </p>
          )}
        </div>

        {hasMaterials && product.materials && (
          <ProductMaterials materials={product.materials} isCompact={isCompact} />
        )}
      </div>

      <div
        style={{
          paddingTop: SPACING.lg,
          borderTop: `1px solid ${COLORS.border.default}`,
          marginTop: isCompact ? 0 : "auto",
        }}
      >
        <p style={{ ...sectionHeaderStyle, color: COLORS.primary }}>
          Последняя себестоимость
        </p>
        <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
          {product.cost != null ? formatCurrencyRUB(product.cost) : "—"}
        </p>
      </div>
    </div>
  );
};
