"use client";

/**
 * Экран каталога на главной странице.
 * Показывает список категорий и товары выбранной категории.
 * Переключается между видами, использует ProductCard и CategoryCard.
 */
import type { Product } from "@/types/product";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { SPACING, STYLES, CARD_TEMPLATES, COLORS, MOTION } from "@/constants/styles";
import { formatCountLabel, formatModelCount } from "@/lib/format";

interface CatalogGroup {
  title: string;
  desc: string;
  badge: string;
}

interface CatalogProps {
  isMobile: boolean;
  selectedCategory: string | null;
  catalogGroups: CatalogGroup[];
  categoryProducts: Product[];
  onSelectCategory: (category: string | null) => void;
}

export const Catalog = ({
  isMobile,
  selectedCategory,
  catalogGroups,
  categoryProducts,
  onSelectCategory,
}: CatalogProps) => {
  const pageStyle = {
    flex: 1,
    padding: isMobile ? SPACING.smPlus : SPACING.xl,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? SPACING.smPlus : SPACING.lg,
  };

  const introStyle = {
    ...CARD_TEMPLATES.pageIntro(isMobile),
    position: "relative" as const,
    overflow: "hidden" as const,
    padding: isMobile ? `${SPACING.md}px ${SPACING.md}px ${SPACING.smPlus}px` : `${SPACING.md}px ${SPACING.lg}px`,
    gap: isMobile ? SPACING.xsPlus : SPACING.sm,
    background: isMobile
      ? "linear-gradient(180deg, rgba(22,22,25,0.94) 0%, rgba(16,16,19,0.98) 100%)"
      : "linear-gradient(180deg, rgba(24,24,27,0.82) 0%, rgba(21,21,24,0.94) 100%)",
    boxShadow: isMobile ? "0 8px 18px rgba(0, 0, 0, 0.14)" : "0 10px 24px rgba(0, 0, 0, 0.18)",
  };

  const introMetaStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: SPACING.sm,
    color: COLORS.text.muted,
    fontSize: isMobile ? 11 : 12,
    lineHeight: 1.4,
    fontWeight: 600,
  };

  const introCopyStyle = STYLES.pageIntroCopy(isMobile);

  const categoryIntroStyle = {
    ...introStyle,
    padding: isMobile ? "14px 16px 12px" : `${SPACING.md}px ${SPACING.lg}px ${SPACING.smPlus}px`,
    gap: isMobile ? SPACING.xs : SPACING.xsPlus,
  };

  const catalogIntroStyle = {
    ...introStyle,
    padding: isMobile ? "14px 16px 12px" : `${SPACING.md}px ${SPACING.lg}px ${SPACING.smPlus}px`,
    gap: isMobile ? SPACING.xsPlus : SPACING.sm,
  };
  const introAccentLineStyle = {
    position: "absolute" as const,
    top: 0,
    left: isMobile ? SPACING.md : SPACING.lg,
    right: isMobile ? SPACING.md : SPACING.lg,
    height: 1,
    background:
      "linear-gradient(90deg, rgba(244,195,77,0.72) 0%, rgba(244,195,77,0.22) 42%, rgba(244,195,77,0) 100%)",
  };
  const introMetaDotStyle = {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "rgba(244,195,77,0.78)",
    boxShadow: "0 0 0 4px rgba(244,195,77,0.12)",
    flexShrink: 0,
  };

  if (selectedCategory) {
    return (
      <div style={pageStyle}>
        <div style={{ ...categoryIntroStyle, animation: MOTION.softEnter }}>
          <div style={introAccentLineStyle} />
          <h2 style={{ ...STYLES.sectionTitle, fontSize: isMobile ? 22 : 28, margin: 0 }}>
            {selectedCategory}
          </h2>
          <div style={introMetaStyle}>
            <span aria-hidden="true" style={introMetaDotStyle} />
            <span>{formatModelCount(categoryProducts.length)} в каталоге</span>
          </div>
        </div>

        <div
          style={{
            ...CARD_TEMPLATES.sectionGrid(isMobile, 280),
            alignItems: "stretch",
          }}
        >
          {categoryProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} animationIndex={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ ...catalogIntroStyle, animation: MOTION.softEnter }}>
        <div style={introAccentLineStyle} />
        <h2 style={{ ...STYLES.sectionTitle, fontSize: isMobile ? 22 : 28, margin: 0 }}>
          Каталог изделий
        </h2>
        <p style={introCopyStyle}>
          Выберите материал или категорию, чтобы перейти к карточкам изделий.
        </p>
        <div style={introMetaStyle}>
          <span aria-hidden="true" style={introMetaDotStyle} />
          <span>{formatCountLabel(catalogGroups.length, "категория", "категории", "категорий")} в каталоге</span>
        </div>
      </div>
      <div
        style={{
          ...CARD_TEMPLATES.sectionGrid(isMobile, 240),
          gap: isMobile ? SPACING.md : 20,
        }}
      >
        {catalogGroups.map((group, index) => (
          <CategoryCard
            key={index}
            title={group.title}
            description={group.desc}
            badge={group.badge}
            animationIndex={index}
            onClick={() => onSelectCategory(group.title)}
          />
        ))}
      </div>
    </div>
  );
};



