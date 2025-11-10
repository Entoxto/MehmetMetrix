"use client";

/**
 * Карточка категории каталога.
 * Показывает название, короткое описание и бейдж с количеством.
 * Используется на главной для выбора категории.
 */
import { STYLES, COLORS, CARD_HOVER_EFFECTS } from "@/constants/styles";
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
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
    >
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{title}</h3>
        <p style={{ color: COLORS.text.primary, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
      <span style={{ display: "inline-flex", width: "max-content", ...STYLES.categoryBadge }}>
        {badge}
      </span>
    </div>
  );
};


