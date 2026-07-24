"use client";

/**
 * Полный просмотр товара на детальной странице.
 * Держит общую раскладку, а фото и информационную колонку отдаёт профильным компонентам.
 */
import { SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

const DESKTOP_COLUMN_MIN_HEIGHT = 560;

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;

  return (
    <div
      style={{
        flex: 1,
        paddingLeft: isCompact ? SPACING.md : SPACING.lg,
        paddingRight: isCompact ? SPACING.md : SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: isCompact ? SPACING.xl * 2 : SPACING.lg,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          display: isCompact ? "flex" : "grid",
          gridTemplateColumns: isCompact ? undefined : "1fr 1fr",
          flexDirection: isCompact ? "column" : undefined,
          gap: SPACING.lg,
          alignItems: isCompact ? undefined : "stretch",
          width: "100%",
          maxWidth: isCompact ? "100%" : "1400px",
        }}
      >
        <ProductPhoto
          productName={product.name}
          photo={product.photo}
          isCompact={isCompact}
          desktopMinHeight={DESKTOP_COLUMN_MIN_HEIGHT}
        />
        <ProductInfo
          product={product}
          isCompact={isCompact}
          desktopMinHeight={DESKTOP_COLUMN_MIN_HEIGHT}
        />
      </div>
    </div>
  );
};
