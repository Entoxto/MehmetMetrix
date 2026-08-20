"use client";

/**
 * Метка «Под вопросом» для позиции, выпуск которой пока не подтверждён.
 */

import { Question } from "@phosphor-icons/react";
import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export const UnderQuestionTag = () => {
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
        background: "rgba(251, 191, 36, 0.12)",
        color: COLORS.primary,
        border: `1px solid ${COLORS.border.primary}`,
      }}
    >
      <Question size={isMobile ? 12 : 14} weight="bold" aria-hidden="true" />
      Под вопросом
    </span>
  );
};
