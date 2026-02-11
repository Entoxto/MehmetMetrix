"use client";

/**
 * Полный просмотр товара.
 * Показывает фото, описание, размеры и цену для экрана ProductCard/[id].
 * Подстраивает макет под мобильный и планшет через useBreakpoint.
 */
import { useState, useMemo } from "react";
import { COLORS, SPACING, TYPOGRAPHY, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatCurrency, formatCurrencyRUB } from "@/lib/format";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

// Константы для ограничений размеров изображения
const IMAGE_CONSTRAINTS = {
  maxWidth: 650,
  maxHeight: 450,
  minWidth: 300, // Минимальная ширина для десктопа (используется в containerDimensions)
  minHeight: 300,
};

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // Вычисляем оптимальные размеры контейнера на основе aspect-ratio с учетом всех ограничений
  const containerDimensions = useMemo(() => {
    if (!imageAspectRatio) {
      // Если aspect-ratio ещё не загружен, возвращаем минимальные размеры
      return { 
        width: isCompact ? "100%" : `${IMAGE_CONSTRAINTS.minWidth}px`, 
        height: `${IMAGE_CONSTRAINTS.minHeight}px` 
      };
    }

    if (isCompact) {
      // На мобильных: ширина 100%, высота вычисляется динамически на основе aspect-ratio
      return { 
        width: "100%", 
        height: "auto", // Динамическая высота
        aspectRatio: imageAspectRatio.toString(), // Используем CSS aspect-ratio для автоматической высоты
      };
    }

    // На десктопе: вычисляем оптимальные размеры, сохраняя пропорции
    let width = IMAGE_CONSTRAINTS.maxWidth;
    let height = width / imageAspectRatio;

    // Если высота превышает максимум - ограничиваем по высоте
    if (height > IMAGE_CONSTRAINTS.maxHeight) {
      height = IMAGE_CONSTRAINTS.maxHeight;
      width = height * imageAspectRatio;
    }

    // Применяем минимальные ограничения
    width = Math.max(width, IMAGE_CONSTRAINTS.minWidth);
    height = Math.max(height, IMAGE_CONSTRAINTS.minHeight);

    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [isCompact, imageAspectRatio]);

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

  // Единые стили для заголовков секций
  const SECTION_HEADER_STYLE = {
    ...responsiveTypography.caption,
    color: COLORS.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    margin: 0,
    marginBottom: SPACING.sm,
  };

  // Единые стили для подзаголовков материалов (Верхний материал, Подкладка, Последняя себестоимость)
  const MATERIAL_SUBHEADER_STYLE = {
    ...responsiveTypography.caption,
    color: COLORS.text.secondary,
    margin: 0,
    marginBottom: SPACING.xs,
  };

  return (
    <div
      style={{
        flex: 1,
        paddingLeft: isCompact ? SPACING.md : SPACING.lg, // Уменьшенный padding для десктопа
        paddingRight: isCompact ? SPACING.md : SPACING.lg, // Уменьшенный padding для десктопа
        paddingTop: isCompact ? SPACING.md : SPACING.md, // Одинаковый padding сверху с заголовком
        paddingBottom: isCompact ? SPACING.xl * 2 : SPACING.lg, // Уменьшенный padding для десктопа
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
       <div
         style={{
           display: isCompact ? "flex" : "grid", // Grid для десктопа: равное деление на две колонки
           gridTemplateColumns: isCompact ? undefined : "1fr 1fr", // Две равные колонки на десктопе
           flexDirection: isCompact ? "column" : undefined,
           gap: isCompact ? SPACING.lg : SPACING.lg, // Уменьшенный gap для десктопа
           alignItems: isCompact ? undefined : "stretch", // Растягиваем на всю высоту
           width: isCompact ? "100%" : "auto", // На мобильных растягиваем на всю ширину, на десктопе только необходимую
           maxWidth: isCompact ? "100%" : "1400px", // Максимальная ширина контейнера
         }}
       >
      {/* Фото товара */}
      <div
        style={{
          width: containerDimensions.width,
          height: containerDimensions.height === "auto" ? undefined : containerDimensions.height,
          ...(containerDimensions.aspectRatio ? { aspectRatio: containerDimensions.aspectRatio } : {}),
          ...PHOTO_STYLE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          justifySelf: isCompact ? undefined : "center", // Центрируем внутри grid-колонки
        }}
      >
        <OptimizedImage
          src={product.photo}
          alt={product.name}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "contain" }}
          priority
          fallbackSize={isCompact ? 48 : 80}
          onLoad={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.naturalWidth && img.naturalHeight) {
              setImageAspectRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
      </div>

       {/* Информация о товаре - вертикальная раскладка */}
       <div
         style={{
           display: "flex",
           flexDirection: "column",
           gap: isCompact ? SPACING.lg : SPACING.lg, // Уменьшенный gap для десктопа
           width: "100%", // На десктопе grid автоматически задает ширину (50% через 1fr)
           minHeight: isCompact ? "auto" : 0, // Для выравнивания высоты с фото на десктопе
         }}
       >
        {/* Размеры */}
        <div>
          <p style={SECTION_HEADER_STYLE}>
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
          <p style={SECTION_HEADER_STYLE}>
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
                ...SECTION_HEADER_STYLE,
                marginBottom: SPACING.md, // Для секции материалов нужен больший отступ
              }}
            >
              Материалы
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
              {product.materials.outer && (
                <div>
                  <p style={MATERIAL_SUBHEADER_STYLE}>
                    Верхний материал
                  </p>
                  <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.outer}
                  </p>
                </div>
              )}
              {product.materials.lining && (
                <div>
                  <p style={MATERIAL_SUBHEADER_STYLE}>
                    Подкладка
                  </p>
                  <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
                    {product.materials.lining}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Последняя себестоимость */}
        {product.cost != null && (
          <div
            style={{
              paddingTop: SPACING.lg,
              borderTop: `1px solid ${COLORS.border.default}`,
            }}
          >
            <p style={{ ...SECTION_HEADER_STYLE, color: COLORS.primary }}>
              Последняя себестоимость
            </p>
            <p style={{ ...responsiveTypography.body, color: COLORS.text.primary, margin: 0 }}>
              {formatCurrencyRUB(product.cost)}
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

