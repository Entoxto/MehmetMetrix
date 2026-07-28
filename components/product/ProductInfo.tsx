"use client";

import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { CARD_TEMPLATES, COLORS, FONT_FAMILIES, MOTION, SPACING, STYLES, TYPOGRAPHY, getCategoryVisual } from "@/constants/styles";
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
  const hasMaterials = Boolean(
    product.materials?.outer || product.materials?.lining || product.materials?.comments
  );
  const categoryVisual = getCategoryVisual(product.category);

  const responsiveTypography = {
    h1: { ...TYPOGRAPHY.h1, fontSize: isCompact ? 24 : 32 },
    h2: { ...TYPOGRAPHY.h2, fontSize: isCompact ? 14 : 16 },
    body: { ...TYPOGRAPHY.body, fontSize: isCompact ? 14 : 16 },
    caption: { ...TYPOGRAPHY.caption, fontSize: isCompact ? 11 : 12 },
    price: {
      fontSize: isCompact ? 32 : 40,
      fontWeight: 700,
      lineHeight: 1.15,
      fontFamily: FONT_FAMILIES.ui,
      fontVariantNumeric: "tabular-nums" as const,
      fontFeatureSettings: '"tnum"',
      letterSpacing: -0.35,
    },
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
    background: categoryVisual.accentSoft,
    color: categoryVisual.accent,
    padding: isCompact ? "8px 16px" : "9px 18px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border.primary}`,
    fontSize: isCompact ? 12 : 13,
    fontWeight: 700,
    fontFamily: FONT_FAMILIES.ui,
    lineHeight: 1,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    transition: MOTION.interactiveTransition,
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
              className="mm-interactive-surface"
              data-hover="soft"
              aria-label={`Открыть категорию ${product.category} в каталоге`}
            >
              {product.category}
              <ArrowRight
                aria-hidden="true"
                size={isCompact ? 12 : 13}
                weight="bold"
                style={{
                  flexShrink: 0,
                }}
              />
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
        <p
          style={{
            ...responsiveTypography.body,
            color: COLORS.text.primary,
            margin: 0,
            fontFamily: FONT_FAMILIES.ui,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {product.cost != null ? formatCurrencyRUB(product.cost) : "—"}
        </p>
      </div>
    </div>
  );
};
