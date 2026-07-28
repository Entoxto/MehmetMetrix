"use client";

import { useId, type ReactNode } from "react";
import { CARD_TEMPLATES, COLORS, MOTION, SPACING, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface PageIntroProps {
  title: string;
  description?: string;
  meta?: ReactNode;
}

export const PageIntro = ({ title, description, meta }: PageIntroProps) => {
  const { isMobile } = useBreakpoint();
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      style={{
        ...CARD_TEMPLATES.pageIntro(isMobile),
        position: "relative",
        overflow: "hidden",
        padding: isMobile ? "14px 16px 13px" : `${SPACING.md}px ${SPACING.lg}px`,
        gap: isMobile ? SPACING.xsPlus : SPACING.sm,
        animation: MOTION.softEnter,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: isMobile ? SPACING.md : SPACING.lg,
          right: isMobile ? SPACING.md : SPACING.lg,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(244,195,77,0.72) 0%, rgba(244,195,77,0.2) 45%, rgba(244,195,77,0) 100%)",
        }}
      />
      <h2
        id={titleId}
        style={{
          ...STYLES.sectionTitle,
          fontSize: isMobile ? 22 : 28,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {description && <p style={STYLES.pageIntroCopy(isMobile)}>{description}</p>}
      {meta && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: SPACING.sm,
            color: COLORS.text.muted,
            fontSize: isMobile ? 11 : 12,
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "rgba(244,195,77,0.78)",
              boxShadow: "0 0 0 4px rgba(244,195,77,0.1)",
              flexShrink: 0,
            }}
          />
          {meta}
        </div>
      )}
    </section>
  );
};
