"use client";

/**
 * Метка «Размеры на уточнении» для позиций, у которых размеры пока не разбиты.
 */

import { Ruler } from "@phosphor-icons/react";
import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export const SizesPendingTag = () => {
  const { isMobile } = useBreakpoint();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? SPACING.xs : SPACING.xsPlus,
        padding: isMobile ? "3px 9px" : "4px 11px",
        borderRadius: isMobile ? 8 : 9,
        fontSize: isMobile ? 10 : 11,
        fontWeight: 700,
        fontFamily: FONT_FAMILIES.ui,
        letterSpacing: 0.55,
        lineHeight: 1,
        background: COLORS.background.accent,
        color: COLORS.primary,
        border: `1px solid ${COLORS.border.primary}`,
      }}
    >
      <Ruler size={isMobile ? 12 : 14} weight="regular" aria-hidden="true" />
      Размеры на уточнении
    </span>
  );
};
