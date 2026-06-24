"use client";

import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/styles";
import type { ProductMaterials as ProductMaterialsValue } from "@/types/product";

interface ProductMaterialsProps {
  materials: ProductMaterialsValue;
  isCompact: boolean;
}

export const ProductMaterials = ({ materials, isCompact }: ProductMaterialsProps) => {
  const bodyTypography = {
    ...TYPOGRAPHY.body,
    fontSize: isCompact ? 14 : 16,
  };
  const sectionHeaderStyle = {
    ...TYPOGRAPHY.caption,
    fontSize: isCompact ? 11 : 12,
    color: COLORS.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    margin: 0,
    marginBottom: isCompact ? SPACING.md : SPACING.sm,
  };
  const materialSubheaderStyle = {
    ...TYPOGRAPHY.caption,
    fontSize: isCompact ? 11 : 12,
    color: COLORS.text.secondary,
    margin: 0,
    marginBottom: SPACING.xs,
  };
  const materialBodyStyle = {
    ...bodyTypography,
    color: COLORS.text.primary,
    margin: 0,
    fontSize: isCompact ? bodyTypography.fontSize : TYPOGRAPHY.body.fontSize,
    lineHeight: isCompact ? 1.55 : 1.45,
  };

  return (
    <div
      style={{
        paddingTop: isCompact ? SPACING.lg : SPACING.md,
        borderTop: `1px solid ${COLORS.border.default}`,
        minHeight: 0,
      }}
    >
      <p style={sectionHeaderStyle}>
        Материалы
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: isCompact ? SPACING.md : SPACING.smPlus }}>
        {materials.outer && (
          <div>
            <p style={materialSubheaderStyle}>
              Верхний материал
            </p>
            <p style={materialBodyStyle}>
              {materials.outer}
            </p>
          </div>
        )}
        {materials.lining && (
          <div>
            <p style={materialSubheaderStyle}>
              Подкладка
            </p>
            <p style={materialBodyStyle}>
              {materials.lining}
            </p>
          </div>
        )}
        {materials.comments && (
          <div>
            <p style={materialSubheaderStyle}>
              Состав
            </p>
            <p
              style={{
                ...materialBodyStyle,
                whiteSpace: "pre-line",
                maxHeight: isCompact ? undefined : 72,
                overflowY: isCompact ? undefined : "auto",
                paddingRight: isCompact ? undefined : 4,
              }}
            >
              {materials.comments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
