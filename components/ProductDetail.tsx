"use client";

/**
 * Полный просмотр товара.
 * Показывает фото, описание, размеры и цену для экрана ProductCard/[id].
 * Подстраивает макет под мобильный и планшет через useBreakpoint.
 */
import Image from "next/image";
import { useState, useMemo } from "react";
import { COLORS, SPACING, TYPOGRAPHY, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import { formatCurrency } from "@/lib/format";
import { getOptimizedImagePath, getJpgFallbackPath, getBlurPlaceholder } from "@/lib/imageUtils";
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
  mobileHeight: 300,
};

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;
  const [imageSrc, setImageSrc] = useState<string>(() => getOptimizedImagePath(product.photo));
  const [imageError, setImageError] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // Вычисляем оптимальные размеры контейнера на основе aspect-ratio с учетом всех ограничений
  const containerDimensions = useMemo(() => {
    if (isCompact || !imageAspectRatio) {
      return { 
        width: "100%", 
        height: IMAGE_CONSTRAINTS.mobileHeight 
      };
    }

    // Вычисляем оптимальные размеры, сохраняя пропорции
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

  // Единые стили для подзаголовков материалов (Верхний материал, Подкладка, Примечания)
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
        paddingLeft: isCompact ? SPACING.md : SPACING.xl, // Одинаковый padding слева с заголовком
        paddingRight: isCompact ? SPACING.md : SPACING.xl, // Одинаковый padding справа с заголовком
        paddingTop: isCompact ? SPACING.md : SPACING.md, // Одинаковый padding сверху с заголовком
        paddingBottom: isCompact ? SPACING.xl * 2 : SPACING.xl, // Безопасный отступ для toast на мобиле
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
           gap: isCompact ? SPACING.lg : SPACING.xl,
           alignItems: isCompact ? undefined : "stretch", // Растягиваем на всю высоту
           width: "auto", // Занимает только необходимую ширину контента
           maxWidth: isCompact ? "100%" : "1400px", // Максимальная ширина контейнера
         }}
       >
      {/* Фото товара */}
      <div
        style={{
          width: isCompact ? "100%" : containerDimensions.width, // Вычисленная ширина с учетом всех ограничений
          height: isCompact ? IMAGE_CONSTRAINTS.mobileHeight : containerDimensions.height, // Вычисленная высота с учетом всех ограничений
          ...PHOTO_STYLE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          justifySelf: isCompact ? undefined : "center", // Центрируем внутри grid-колонки
        }}
      >
        {imageError ? (
          <span style={{ color: COLORS.text.muted, fontSize: isCompact ? 48 : 80 }}>📷</span>
        ) : (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: isCompact ? "cover" : "contain", // На мобильных растягиваем на всю ширину, на десктопе показываем полностью
              objectPosition: isCompact ? "top center" : undefined, // На мобильных обрезаем снизу, сохраняя верх
            }}
            loading="eager"
            priority
            placeholder="blur"
            blurDataURL={getBlurPlaceholder()}
            unoptimized={true}
            onLoad={(e) => {
              // Получаем реальные размеры изображения для расчета aspect-ratio
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                setImageAspectRatio(aspectRatio);
              }
            }}
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

       {/* Информация о товаре - вертикальная раскладка */}
       <div
         style={{
           display: "flex",
           flexDirection: "column",
           gap: isCompact ? SPACING.lg : SPACING.xl,
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
              {product.materials.comments && (
                <div>
                  <p style={MATERIAL_SUBHEADER_STYLE}>
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

