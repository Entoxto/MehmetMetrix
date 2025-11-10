"use client";

/**
 * Полный просмотр товара.
 * Показывает фото, описание, размеры и цену для экрана ProductCard/[id].
 * Подстраивает макет под мобильный и планшет через useBreakpoint.
 */
import { COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;

  // Единая типографика
  const TYPOGRAPHY = {
    h1: { fontSize: isCompact ? 24 : 32, fontWeight: 800, lineHeight: 1.3 },
    h2: { fontSize: isCompact ? 14 : 16, fontWeight: 600, lineHeight: 1.4 },
    body: { fontSize: isCompact ? 14 : 16, lineHeight: 1.5 },
    caption: { fontSize: isCompact ? 11 : 12, lineHeight: 1.4 },
    price: { fontSize: isCompact ? 32 : 40, fontWeight: 700, lineHeight: 1.2 },
  };

  // Стили для чипов размеров
  const SIZE_CHIP_STYLE = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isCompact ? "10px 16px" : "12px 20px",
    borderRadius: 8,
    fontSize: isCompact ? 14 : 16,
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
    borderRadius: isCompact ? 16 : 20,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
    overflow: "hidden" as const,
    background: COLORS.background.cardExpanded,
  };

  return (
    <div
      style={{
        flex: 1,
        padding: isCompact ? SPACING.md : SPACING.xl,
        paddingBottom: isCompact ? SPACING.xl * 2 : SPACING.xl, // Безопасный отступ для toast на мобиле
        display: isCompact ? "flex" : "grid",
        flexDirection: isCompact ? "column" : undefined,
        gridTemplateColumns: isCompact ? undefined : "1fr 1fr",
        gap: isCompact ? SPACING.lg : SPACING.xl,
        alignItems: isCompact ? undefined : "stretch",
        maxWidth: isCompact ? "100%" : "none",
      }}
    >
      {/* Фото товара - квадратное (1:1) */}
      <div
        style={{
          width: "100%",
          aspectRatio: isCompact ? undefined : "1 / 1",
          height: isCompact ? 300 : "auto",
          maxWidth: isCompact ? "100%" : "500px",
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
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span style="color: ${COLORS.text.muted}; font-size: ${isCompact ? 48 : 80}px;">📷</span>`;
            }
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
          gap: isCompact ? SPACING.lg : SPACING.xl,
          flex: 1,
          minHeight: isCompact ? "auto" : 0, // Для одинаковой высоты с фото на десктопе
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
            {product.sizes.map((size) => (
              <span key={size} style={SIZE_CHIP_STYLE}>
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

