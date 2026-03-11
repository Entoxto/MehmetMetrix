"use client";

/**
 * Компактная карточка товара.
 * Показывает превью в каталоге и ведёт на полную страницу по клику.
 * Содержит картинку, цену, быстрые метки и hover-анимацию.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { STYLES, COLORS, CARD_HOVER_EFFECTS, SPACING } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.product.hover,
    CARD_HOVER_EFFECTS.product.default
  );

  const cardStyle: CSSProperties = {
    ...STYLES.card,
    padding: 0,
    overflow: "hidden",
    transition: "all 0.25s ease",
  };

  if (CARD_HOVER_EFFECTS.product.default.boxShadow !== undefined) {
    cardStyle.boxShadow = CARD_HOVER_EFFECTS.product.default.boxShadow;
  }
  if (CARD_HOVER_EFFECTS.product.default.transform !== undefined) {
    cardStyle.transform = CARD_HOVER_EFFECTS.product.default.transform;
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={hoverHandlers.onMouseEnter}
      onMouseLeave={hoverHandlers.onMouseLeave}
    >
      <Link
        href={`/product/${product.id}?from=catalog&category=${encodeURIComponent(product.category)}`}
        prefetch={false}
        style={{
          cursor: "pointer",
          transition: "all 0.3s ease",
          textDecoration: "none",
          display: "block",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 360,
            background: COLORS.background.cardExpanded,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <OptimizedImage
            src={product.photo}
            alt={product.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: "cover",
              objectPosition: "top center",
            }}
          />
        </div>
        <div
          style={{
            padding: SPACING.lg,
            display: "flex",
            flexDirection: "column",
            gap: SPACING.md,
            minHeight: 220,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACING.md }}>
            <span style={STYLES.categoryBadge}>{product.category}</span>
            <span style={{ ...STYLES.sectionEyebrow, color: COLORS.text.tertiary }}>
              {product.sizes.length > 0 ? `${product.sizes.length} размеров` : "Размеры уточняются"}
            </span>
          </div>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              color: COLORS.text.primary,
              minHeight: 58,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: "1.25",
              letterSpacing: -0.3,
            }}
          >
            {product.name}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.md, alignItems: "start" }}>
            <div>
              <p
                style={{
                  ...STYLES.metricLabel,
                  color: COLORS.text.muted,
                  fontSize: 11,
                  marginBottom: SPACING.xs,
                  marginTop: 0,
                }}
              >
                Цена
              </p>
              {product.price ? (
                <p style={{ color: COLORS.success, fontSize: 24, fontWeight: 800, margin: 0, lineHeight: "28px" }}>
                  ${product.price.toLocaleString()}
                </p>
              ) : (
                <p style={{ color: COLORS.text.secondary, fontSize: 18, fontWeight: 700, margin: 0, lineHeight: "24px" }}>
                  уточняется
                </p>
              )}
            </div>
            <div>
              <p
                style={{
                  ...STYLES.metricLabel,
                  color: COLORS.text.muted,
                  fontSize: 11,
                  marginBottom: SPACING.xs,
                  marginTop: 0,
                }}
              >
                Размеры
              </p>
              <div style={{ display: "flex", gap: SPACING.xsPlus, flexWrap: "wrap" }}>
                {product.sizes.slice(0, 4).map((size) => (
                  <span key={size} style={STYLES.sizeBadge}>
                    {size.toUpperCase()}
                  </span>
                ))}
                {product.sizes.length > 4 && (
                  <span style={STYLES.sizeBadge}>+{product.sizes.length - 4}</span>
                )}
                {product.sizes.length === 0 && (
                  <span style={{ ...STYLES.sizeBadge, color: COLORS.text.muted }}>нет данных</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

