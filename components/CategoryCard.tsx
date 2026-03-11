"use client";

/**
 * Карточка категории каталога.
 * Показывает название, короткое описание и бейдж с количеством.
 * Используется на главной для выбора категории.
 */
import { STYLES, COLORS, CARD_HOVER_EFFECTS, SPACING } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}

export const CategoryCard = ({
  title,
  description,
  badge,
  onClick,
}: CategoryCardProps) => {
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
        padding: 24,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: SPACING.lg,
        minHeight: 220,
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
        <p style={{ ...STYLES.sectionEyebrow, margin: 0 }}>
          Категория
        </p>
        <h3
          style={{
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: -0.4,
            margin: 0,
            color: COLORS.text.primary,
          }}
        >
          {title}
        </h3>
        <p style={{ color: COLORS.text.secondary, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACING.md }}>
        <span style={{ display: "inline-flex", width: "max-content", ...STYLES.categoryBadge }}>
          {badge}
        </span>
        <span
          style={{
            color: COLORS.primary,
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Смотреть
        </span>
      </div>
    </div>
  );
};


