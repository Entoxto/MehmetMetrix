"use client";

/**
 * Универсальный компонент изображения с оптимизацией.
 * Цепочка fallback: WebP → JPG → эмодзи 📷
 * Используй этот компонент вместо повторения логики fallback вручную.
 */

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";
import { COLORS } from "@/constants/styles";
import { getOptimizedImagePath, getJpgFallbackPath, getBlurPlaceholder } from "@/lib/imageUtils";

interface OptimizedImageProps {
  /** Путь к оригинальному JPG изображению (из products.json) */
  src: string;
  alt: string;
  /** fill mode (по умолчанию true) */
  fill?: boolean;
  sizes?: string;
  style?: CSSProperties;
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
  loading = "lazy",
  priority = false,
  fallbackSize = 48,
  onLoad,
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>(() => getOptimizedImagePath(src));
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return <span style={{ color: COLORS.text.muted, fontSize: fallbackSize }}>📷</span>;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      style={style}
      loading={priority ? undefined : loading}
      priority={priority}
      placeholder="blur"
      blurDataURL={getBlurPlaceholder()}
      unoptimized={true}
      onLoad={onLoad}
      onError={() => {
        if (imageSrc.includes("/webp/")) {
          setImageSrc(getJpgFallbackPath(imageSrc));
        } else {
          setImageError(true);
        }
      }}
    />
  );
};
