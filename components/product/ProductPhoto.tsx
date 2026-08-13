"use client";

import { useMemo, useState } from "react";
import { COLORS, MOTION, SURFACES } from "@/constants/styles";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const IMAGE_CONSTRAINTS = {
  maxWidth: 650,
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
        width: "100%",
        height: isCompact
          ? `${IMAGE_CONSTRAINTS.minHeight}px`
          : `${desktopMinHeight}px`,
      };
    }

    if (isCompact) {
      return {
        width: "100%",
        height: "auto",
        aspectRatio: imageAspectRatio.toString(),
      };
    }

    const naturalWidth = desktopMinHeight * imageAspectRatio;
    const width = Math.min(
      IMAGE_CONSTRAINTS.maxWidth,
      Math.max(naturalWidth, IMAGE_CONSTRAINTS.minWidth)
    );

    return {
      width: `min(100%, ${width}px)`,
      height: "auto",
      aspectRatio: imageAspectRatio.toString(),
    };
  }, [desktopMinHeight, isCompact, imageAspectRatio]);

  return (
    <div
      style={{
        width: containerDimensions.width,
        height:
          containerDimensions.height === "auto"
            ? undefined
            : containerDimensions.height,
        ...(containerDimensions.aspectRatio && hasProductPhoto
          ? { aspectRatio: containerDimensions.aspectRatio }
          : {}),
        borderRadius: isCompact ? 16 : 20,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        background: SURFACES.inset,
        border: `1px solid ${COLORS.border.default}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        justifySelf: isCompact ? undefined : "center",
        alignSelf: isCompact ? undefined : "start",
        minHeight:
          !isCompact && !imageAspectRatio ? `${desktopMinHeight}px` : undefined,
        animation: MOTION.staggerEnter(0, 0),
      }}
    >
      <OptimizedImage
        src={photo}
        alt={productName}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{
          objectFit: "contain",
          objectPosition: "center center",
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
