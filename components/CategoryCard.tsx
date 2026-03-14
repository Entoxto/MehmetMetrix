"use client";

/**
 * Карточка категории каталога.
 * Показывает название, короткое описание и бейдж с количеством.
 * Используется на главной для выбора категории.
 */
import { STYLES, COLORS, CARD_HOVER_EFFECTS, SPACING, MOTION } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";
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
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.category.hover,
    CARD_HOVER_EFFECTS.category.default
  );

  return (
    <div
      onClick={onClick}
      {...hoverHandlers}
      style={{
        ...STYLES.card,
        padding: isMobile ? SPACING.md : 24,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: isMobile ? "flex-start" : "space-between",
        gap: isMobile ? SPACING.smPlus : SPACING.lg,
        minHeight: isMobile ? 0 : 220,
        borderRadius: isMobile ? 18 : 20,
        background: isMobile
          ? "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(18,18,21,0.98) 100%)"
          : STYLES.card.background,
        transition: MOTION.interactiveTransition,
        animation: MOTION.staggerEnter(animationIndex, isMobile ? 70 : 90),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
        <p style={{ ...STYLES.sectionEyebrow, margin: 0, fontSize: isMobile ? 9 : STYLES.sectionEyebrow.fontSize }}>
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
            fontSize: isMobile ? 13 : 14,
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACING.md }}>
        <span style={{ display: "inline-flex", width: "max-content", ...STYLES.categoryBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "4px 10px" : STYLES.categoryBadge.padding }}>
          {badge}
        </span>
        <span
          style={{
            color: COLORS.primary,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Смотреть →
        </span>
      </div>
    </div>
  );
};
