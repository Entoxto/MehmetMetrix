"use client";

/**
 * Компактная карточка товара.
 * Показывает превью в каталоге и ведёт на полную страницу по клику.
 * Содержит картинку, цену, быстрые метки и hover-анимацию.
 */
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { STYLES, COLORS, CARD_HOVER_EFFECTS, SPACING } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";
import { getOptimizedImagePath, getJpgFallbackPath, getBlurPlaceholder } from "@/lib/imageUtils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [imageSrc, setImageSrc] = useState<string>(() => getOptimizedImagePath(product.photo));
  const [imageError, setImageError] = useState(false);
  
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.product.hover,
    CARD_HOVER_EFFECTS.product.default
  );

  const cardStyle: CSSProperties = {
    ...STYLES.card,
    padding: 0,
    transition: "all 0.3s ease",
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
        href={{ pathname: `/product/${product.id}`, query: { from: "catalog" } }}
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
            height: 300,
            background: COLORS.background.cardExpanded,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {imageError ? (
            <span style={{ color: COLORS.text.muted, fontSize: 48 }}>📷</span>
          ) : (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                objectFit: "cover",
              }}
              loading="lazy"
              placeholder="blur"
              blurDataURL={getBlurPlaceholder()}
              unoptimized={true}
              onError={() => {
                if (imageSrc.includes('/webp/')) {
                  // Пытаемся загрузить JPG fallback
                  const jpgPath = getJpgFallbackPath(imageSrc);
                  setImageSrc(jpgPath);
                } else {
                  // И JPG не загрузился - показываем эмодзи
                  setImageError(true);
                }
              }}
            />
          )}
        </div>
        <div style={{ padding: SPACING.md + 4, display: "flex", flexDirection: "column", minHeight: 180 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: SPACING.sm + 4,
              color: COLORS.primary,
              minHeight: 60,
              maxHeight: 60,
              overflow: "hidden",
              lineHeight: "1.3",
            }}
          >
            {product.name}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.sm + 4, alignItems: "start" }}>
            <div>
              {/* NOTE: All prices are in USD dollars only */}
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 11,
                  textTransform: "uppercase",
                  marginBottom: SPACING.xs,
                  height: 15,
                  lineHeight: "15px",
                }}
              >
                Цена
              </p>
              {product.price ? (
                <p style={{ color: COLORS.success, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: "24px" }}>
                  ${product.price.toLocaleString()}
                </p>
              ) : (
                <p style={{ color: COLORS.primary, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: "24px" }}>
                  уточняется
                </p>
              )}
            </div>
            <div>
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 11,
                  textTransform: "uppercase",
                  marginBottom: SPACING.xs,
                  height: 15,
                  lineHeight: "15px",
                }}
              >
                Размеры
              </p>
              <div style={{ display: "flex", gap: SPACING.xs + 2, flexWrap: "wrap" }}>
                {product.sizes.map((size) => (
                  <span key={size} style={STYLES.sizeBadge}>
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

