"use client";

/**
 * Компактная карточка товара.
 * Показывает превью в каталоге и ведёт на полную страницу по клику.
 * Содержит картинку, цену, быстрые метки и hover-анимацию.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { STYLES, COLORS, CARD_HOVER_EFFECTS, SPACING, MOTION } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  animationIndex?: number;
}

export const ProductCard = ({ product, animationIndex = 0 }: ProductCardProps) => {
  const { isMobile } = useBreakpoint();
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.product.hover,
    CARD_HOVER_EFFECTS.product.default
  );

  const cardStyle: CSSProperties = {
    ...STYLES.card,
    padding: 0,
    overflow: "hidden",
    borderRadius: isMobile ? 20 : 20,
    background: isMobile
      ? "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(18,18,21,0.98) 100%)"
      : STYLES.card.background,
    transition: MOTION.interactiveTransition,
    animation: MOTION.staggerEnter(animationIndex, isMobile ? 65 : 85),
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
            height: isMobile ? 260 : 360,
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
            padding: isMobile ? SPACING.smPlus : SPACING.lg,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? SPACING.smPlus : SPACING.md,
            minHeight: isMobile ? "auto" : 220,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACING.sm, flexWrap: "wrap" }}>
            <span style={{ ...STYLES.categoryBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "4px 10px" : STYLES.categoryBadge.padding }}>
              {product.category}
            </span>
            <span style={{ ...STYLES.sectionEyebrow, color: COLORS.text.tertiary, fontSize: isMobile ? 9 : STYLES.sectionEyebrow.fontSize }}>
              {product.sizes.length > 0 ? `${product.sizes.length} размеров` : "Размеры уточняются"}
            </span>
          </div>
          <h3
            style={{
              fontSize: isMobile ? 17 : 22,
              fontWeight: 800,
              margin: 0,
              color: isMobile ? COLORS.text.softTitle : COLORS.text.primary,
              minHeight: isMobile ? "auto" : 58,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: isMobile ? "1.18" : "1.25",
              letterSpacing: isMobile ? -0.15 : -0.3,
            }}
          >
            {product.name}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? SPACING.smPlus : SPACING.md, alignItems: "start" }}>
            <div>
              <p
                style={{
                  ...STYLES.metricLabel,
                  color: COLORS.text.muted,
                  fontSize: isMobile ? 10 : 11,
                  marginBottom: SPACING.xs,
                  marginTop: 0,
                }}
              >
                Цена
              </p>
              {product.price ? (
                <p style={{ color: COLORS.success, fontSize: isMobile ? 20 : 24, fontWeight: 800, margin: 0, lineHeight: isMobile ? "24px" : "28px" }}>
                  ${product.price.toLocaleString()}
                </p>
              ) : (
                <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 15 : 18, fontWeight: 700, margin: 0, lineHeight: isMobile ? "20px" : "24px" }}>
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
                  <span key={size} style={{ ...STYLES.sizeBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "3px 8px" : STYLES.sizeBadge.padding }}>
                    {size.toUpperCase()}
                  </span>
                ))}
                {product.sizes.length > 4 && (
                  <span style={{ ...STYLES.sizeBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "3px 8px" : STYLES.sizeBadge.padding }}>+{product.sizes.length - 4}</span>
                )}
                {product.sizes.length === 0 && (
                  <span style={{ ...STYLES.sizeBadge, color: COLORS.text.muted, fontSize: isMobile ? 10 : 12, padding: isMobile ? "3px 8px" : STYLES.sizeBadge.padding }}>нет данных</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
