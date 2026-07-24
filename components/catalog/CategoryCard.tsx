"use client";

/**
 * Карточка категории каталога.
 * Показывает название, короткое описание и бейдж с количеством.
 * Используется в каталоге для выбора категории.
 */
import { STYLES, COLORS, CARD_HOVER_EFFECTS, SPACING, MOTION, getCategoryVisual } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/cardHoverHandlers";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface CategoryCardProps {
  title: string;
  description: string;
  badge: string;
  animationIndex?: number;
  onClick: () => void;
}

export const CategoryCard = ({
  title,
  description,
  badge,
  animationIndex = 0,
  onClick,
}: CategoryCardProps) => {
  const { isMobile } = useBreakpoint();
  const visual = getCategoryVisual(title);
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.category.hover,
    CARD_HOVER_EFFECTS.category.default
  );

  return (
    <ClickableCard
      onPress={onClick}
      {...hoverHandlers}
      style={{
        ...STYLES.card,
        position: "relative",
        overflow: "hidden",
        padding: isMobile ? "14px 16px" : 24,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: isMobile ? "flex-start" : "space-between",
        gap: isMobile ? SPACING.sm : SPACING.lg,
        minHeight: isMobile ? 132 : 190,
        borderRadius: isMobile ? 18 : 20,
        background: visual.surface,
        transition: MOTION.interactiveTransition,
        animation: MOTION.staggerEnter(animationIndex, isMobile ? 70 : 90),
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: isMobile ? 16 : SPACING.lg,
          right: isMobile ? 16 : SPACING.lg,
          height: 1,
          background: visual.line,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: SPACING.sm }}>
        <p style={{ ...STYLES.sectionEyebrow, margin: 0, fontSize: isMobile ? 9 : STYLES.sectionEyebrow.fontSize, color: COLORS.text.tertiary }}>
          Категория
        </p>
        <h3
          style={{
            fontSize: isMobile ? 18 : 24,
            fontWeight: 800,
            lineHeight: isMobile ? 1.15 : 1.2,
            letterSpacing: isMobile ? -0.25 : -0.4,
            margin: 0,
            color: isMobile ? COLORS.text.softTitle : COLORS.text.primary,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: COLORS.text.secondary,
            fontSize: isMobile ? 12 : 14,
            margin: 0,
            lineHeight: isMobile ? 1.45 : 1.55,
          }}
        >
          {description}
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACING.md }}>
        <span
          style={{
            display: "inline-flex",
            width: "max-content",
            ...STYLES.categoryBadge,
            color: visual.accent,
            background: visual.accentSoft,
            border: `1px solid ${visual.accentSoft}`,
            fontSize: isMobile ? 10 : 12,
            padding: isMobile ? "4px 10px" : STYLES.categoryBadge.padding,
          }}
        >
          {badge}
        </span>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: isMobile ? 20 : 24,
            height: isMobile ? 20 : 24,
            color: visual.accent,
            fontSize: isMobile ? 14 : 16,
            opacity: 0.72,
            whiteSpace: "nowrap",
          }}
        >
          →
        </span>
      </div>
    </ClickableCard>
  );
};
