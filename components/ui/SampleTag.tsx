"use client";

/**
 * Небольшая метка «образец» для позиций.
 */

import { Tag } from "@phosphor-icons/react";
import { FONT_FAMILIES, SHIPMENT_TYPE_VISUALS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export const SampleTag = () => {
  const { isMobile } = useBreakpoint();
  const visual = SHIPMENT_TYPE_VISUALS.sample;

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
        letterSpacing: 0.65,
        lineHeight: 1,
        textTransform: "uppercase",
        background: visual.surface,
        color: visual.accent,
        border: `1px solid ${visual.border}`,
      }}
    >
      <Tag size={isMobile ? 12 : 14} weight="regular" aria-hidden="true" />
      Образец
    </span>
  );
};

