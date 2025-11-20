"use client";

/**
 * Полный просмотр товара.
 * Показывает фото, описание, размеры и цену для экрана ProductCard/[id].
 * Подстраивает макет под мобильный и планшет через useBreakpoint.
 */
import { COLORS, SPACING, TYPOGRAPHY, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;

  // Адаптивная типографика на основе глобальной
  const responsiveTypography = {
    h1: { ...TYPOGRAPHY.h1, fontSize: isCompact ? 24 : 32 },
    h2: { ...TYPOGRAPHY.h2, fontSize: isCompact ? 14 : 16 },
    body: { ...TYPOGRAPHY.body, fontSize: isCompact ? 14 : 16 },
    caption: { ...TYPOGRAPHY.caption, fontSize: isCompact ? 11 : 12 },
    price: { fontSize: isCompact ? 32 : 40, fontWeight: 700, lineHeight: 1.2 },
  };

  // Стили для чипов размеров на основе глобального STYLES.sizeBadge
  const SIZE_CHIP_STYLE = {
    ...STYLES.sizeBadge,
    padding: isCompact ? "10px 16px" : "12px 20px",
    fontSize: isCompact ? 14 : 16,
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
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          display: isCompact ? "flex" : "grid",
          flexDirection: isCompact ? "column" : undefined,
          gridTemplateColumns: isCompact ? undefined : "1fr 1fr",
          gap: isCompact ? SPACING.lg : SPACING.xl,
          alignItems: isCompact ? undefined : "stretch",
          width: isCompact ? "100%" : "100%",
          maxWidth: isCompact ? "100%" : "1200px", // Ограничиваем максимальную ширину на десктопе
        }}
      >
      {/* Фото товара */}
      <div
        style={{
          width: "100%",
          height: isCompact ? 300 : "auto", // На десктопе grid выровняет высоту автоматически
          minHeight: isCompact ? 300 : 400, // Минимальная высота для пропорциональности
          ...PHOTO_STYLE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "stretch", // Растягивается на всю высоту строки grid
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
              ...responsiveTypography.caption,
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
              ...responsiveTypography.caption,
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
            <p style={{ ...responsiveTypography.price, color: COLORS.success, margin: 0 }}>
              {formatCurrency(product.price)}
            </p>
          ) : (
            <p style={{ ...responsiveTypography.price, color: COLORS.primary, margin: 0 }}>
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
                ...responsiveTypography.caption,
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
                      ...responsiveTypography.caption,
                      color: COLORS.text.secondary,
                      margin: 0,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Верхний материал
                  </p>
                  <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.outer}
                  </p>
                </div>
              )}
              {product.materials.lining && (
                <div>
                  <p
                    style={{
                      ...responsiveTypography.caption,
                      color: COLORS.text.secondary,
                      margin: 0,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Подкладка
                  </p>
                  <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.lining}
                  </p>
                </div>
              )}
              {product.materials.comments && (
                <div>
                  <p
                    style={{
                      ...responsiveTypography.caption,
                      color: COLORS.text.secondary,
                      margin: 0,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Примечания
                  </p>
                  <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.comments}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

