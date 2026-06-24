"use client";

import { useMemo, useState } from "react";
import { COLORS, MOTION } from "@/constants/styles";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const IMAGE_CONSTRAINTS = {
  maxWidth: 650,
  maxHeight: 450,
  minWidth: 300,
  minHeight: 300,
};

interface ProductPhotoProps {
  productName: string;
  photo?: string;
  isCompact: boolean;
  desktopMinHeight: number;
}

export const ProductPhoto = ({
  productName,
  photo,
  isCompact,
  desktopMinHeight,
}: ProductPhotoProps) => {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const hasProductPhoto = Boolean(photo?.trim());

  const containerDimensions = useMemo(() => {
    if (!imageAspectRatio) {
      return {
        width: isCompact ? "100%" : `${IMAGE_CONSTRAINTS.minWidth}px`,
        height: `${IMAGE_CONSTRAINTS.minHeight}px`,
      };
    }

    if (isCompact) {
      return {
        width: "100%",
        height: "auto",
        aspectRatio: imageAspectRatio.toString(),
      };
    }

    let width = IMAGE_CONSTRAINTS.maxWidth;
    let height = width / imageAspectRatio;

    if (height > IMAGE_CONSTRAINTS.maxHeight) {
      height = IMAGE_CONSTRAINTS.maxHeight;
      width = height * imageAspectRatio;
    }

    width = Math.max(width, IMAGE_CONSTRAINTS.minWidth);
    height = Math.max(height, IMAGE_CONSTRAINTS.minHeight);

    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [isCompact, imageAspectRatio]);

  return (
    <div
      style={{
        width: isCompact ? containerDimensions.width : "100%",
        height: isCompact
          ? containerDimensions.height === "auto"
            ? undefined
            : containerDimensions.height
          : `${desktopMinHeight}px`,
        ...(containerDimensions.aspectRatio && hasProductPhoto
          ? { aspectRatio: containerDimensions.aspectRatio }
          : {}),
        borderRadius: isCompact ? 16 : 20,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        background: COLORS.background.cardExpanded,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        justifySelf: isCompact ? undefined : "center",
        minHeight: isCompact ? undefined : `${desktopMinHeight}px`,
        animation: MOTION.staggerEnter(0, 0),
      }}
    >
      <OptimizedImage
        src={photo}
        alt={productName}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{
          objectFit: isCompact ? "contain" : "cover",
          objectPosition: "center center",
          transform: isCompact ? undefined : "scale(1.02)",
        }}
        placeholderStyle={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        priority
        fallbackSize={isCompact ? 48 : 80}
        onLoad={(event) => {
          const img = event.currentTarget as HTMLImageElement;
          if (hasProductPhoto && img.naturalWidth && img.naturalHeight) {
            setImageAspectRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    </div>
  );
};
