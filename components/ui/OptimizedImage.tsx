"use client";

/**
 * Универсальный компонент изображения с оптимизацией.
 * Цепочка fallback: WebP → JPG → общая заглушка → эмодзи 📷
 * Используй этот компонент вместо повторения логики fallback вручную.
 */

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { COLORS } from "@/constants/styles";
import {
  PRODUCT_PHOTO_PLACEHOLDER,
  getProductImagePath,
  getOptimizedImagePath,
  getJpgFallbackPath,
  getBlurPlaceholder,
} from "@/lib/imageUtils";

interface OptimizedImageProps {
  /** Путь к оригинальному JPG изображению; без пути используется общая заглушка */
  src?: string;
  alt: string;
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
  /** Размер эмодзи-заглушки при ошибке (по умолчанию 48) */
  fallbackSize?: number;
  /** Колбэк при загрузке изображения */
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const OptimizedImage = ({
  src,
  alt,
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
  const [imageSrc, setImageSrc] = useState<string>(() => getOptimizedImagePath(resolvedSrc));
  const [imageError, setImageError] = useState(false);
  const isPlaceholder = imageSrc.includes("__photo_pending.");

  useEffect(() => {
    setImageSrc(getOptimizedImagePath(resolvedSrc));
    setImageError(false);
  }, [resolvedSrc]);

  if (imageError) {
    return <span style={{ color: COLORS.text.muted, fontSize: fallbackSize }}>📷</span>;
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
        if (imageSrc.includes("/webp/")) {
          setImageSrc(getJpgFallbackPath(imageSrc));
        } else if (imageSrc !== PRODUCT_PHOTO_PLACEHOLDER) {
          setImageSrc(getOptimizedImagePath(PRODUCT_PHOTO_PLACEHOLDER));
        } else {
          setImageError(true);
        }
      }}
    />
  );
};
