"use client";

/**
 * Универсальный компонент изображения с оптимизацией.
 * Цепочка fallback для карточек:
 * облегчённый WebP → полноразмерный WebP → JPG → общая заглушка → системная иконка.
 * Используй этот компонент вместо повторения логики fallback вручную.
 */

import { ImageSquare } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { COLORS } from "@/constants/styles";
import {
  PRODUCT_PHOTO_PLACEHOLDER,
  getProductImagePath,
  getOptimizedImagePath,
  getBlurPlaceholder,
} from "@/lib/imageUtils";
import type { ProductImageVariant } from "@/lib/imageUtils";

interface OptimizedImageProps {
  /** Путь к оригинальному JPG изображению; без пути используется общая заглушка */
  src?: string;
  alt: string;
  /** Полноразмерная версия или облегчённая версия для карточек */
  variant?: ProductImageVariant;
  /** fill mode (по умолчанию true) */
  fill?: boolean;
  sizes?: string;
  style?: CSSProperties;
  /** Стили только для общей заглушки, включая fallback сломанного photo */
  placeholderStyle?: CSSProperties;
  /** eager или lazy (по умолчанию lazy) */
  loading?: "eager" | "lazy";
  /** Отметить как priority (для LCP) */
  priority?: boolean;
  /** Размер системной иконки при полной ошибке fallback-цепочки */
  fallbackSize?: number;
  /** Колбэк при загрузке изображения */
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

interface ResolvedOptimizedImageProps extends Omit<OptimizedImageProps, "src" | "variant"> {
  resolvedSrc: string;
  variant: ProductImageVariant;
}

const ResolvedOptimizedImage = ({
  resolvedSrc,
  alt,
  variant,
  fill,
  sizes,
  style,
  placeholderStyle,
  loading,
  priority,
  fallbackSize,
  onLoad,
}: ResolvedOptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(() =>
    getOptimizedImagePath(resolvedSrc, variant)
  );
  const [imageError, setImageError] = useState(false);
  const isPlaceholder = imageSrc.includes("__photo_pending.");

  if (imageError) {
    return (
      <ImageSquare
        size={fallbackSize}
        weight="duotone"
        color={COLORS.text.muted}
        aria-label="Изображение недоступно"
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      style={isPlaceholder ? { ...style, ...placeholderStyle } : style}
      loading={priority ? undefined : loading}
      priority={priority}
      placeholder="blur"
      blurDataURL={getBlurPlaceholder()}
      unoptimized={true}
      onLoad={onLoad}
      onError={() => {
        if (imageSrc.includes("/webp/card/")) {
          setImageSrc(getOptimizedImagePath(resolvedSrc, "full"));
        } else if (imageSrc.includes("/webp/")) {
          setImageSrc(resolvedSrc);
        } else if (imageSrc !== PRODUCT_PHOTO_PLACEHOLDER) {
          setImageSrc(getOptimizedImagePath(PRODUCT_PHOTO_PLACEHOLDER, variant));
        } else {
          setImageError(true);
        }
      }}
    />
  );
};

export const OptimizedImage = ({
  src,
  alt,
  variant = "full",
  fill = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  style,
  placeholderStyle,
  loading = "lazy",
  priority = false,
  fallbackSize = 48,
  onLoad,
}: OptimizedImageProps) => {
  const resolvedSrc = getProductImagePath(src);

  return (
    <ResolvedOptimizedImage
      key={`${resolvedSrc}:${variant}`}
      resolvedSrc={resolvedSrc}
      alt={alt}
      variant={variant}
      fill={fill}
      sizes={sizes}
      style={style}
      placeholderStyle={placeholderStyle}
      loading={loading}
      priority={priority}
      fallbackSize={fallbackSize}
      onLoad={onLoad}
    />
  );
};
