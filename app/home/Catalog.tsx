"use client";

/**
 * Экран каталога на главной странице.
 * Показывает список категорий и товары выбранной категории.
 * Переключается между видами, использует ProductCard и CategoryCard.
 */
import type { Product } from "@/types/product";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { COLORS, SPACING, STYLES, CARD_TEMPLATES } from "@/constants/styles";

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
    padding: isMobile ? SPACING.md : SPACING.xl,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? SPACING.md : SPACING.lg,
  };

  if (selectedCategory) {
    return (
      <div style={pageStyle}>
        <div style={CARD_TEMPLATES.introCard(isMobile)}>
          <p style={{ ...STYLES.sectionEyebrow, margin: 0 }}>Выбрана категория</p>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACING.xs }}>
            <h2 style={{ ...STYLES.sectionTitle, fontSize: isMobile ? 26 : 32, margin: 0 }}>
              {selectedCategory}
            </h2>
            <p style={{ ...STYLES.sectionDescription, margin: 0 }}>
              {categoryProducts.length} {categoryProducts.length === 1 ? "позиция" : "позиций"} в наличии.
            </p>
          </div>
        </div>

        <div
          style={{
            ...CARD_TEMPLATES.sectionGrid(isMobile, 280),
            alignItems: "stretch",
          }}
        >
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={CARD_TEMPLATES.introCard(isMobile)}>
        <p style={{ ...STYLES.sectionEyebrow, margin: 0 }}>
          Каталог
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.xs }}>
          <h2 style={{ ...STYLES.sectionTitle, fontSize: isMobile ? 26 : 32, margin: 0 }}>
            Каталог изделий
          </h2>
          <p style={{ ...STYLES.sectionDescription, margin: 0 }}>
            Выберите материал или категорию, чтобы перейти к карточкам изделий.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: SPACING.sm,
            paddingTop: SPACING.sm,
          }}
        >
          <span style={STYLES.categoryBadge}>{catalogGroups.length} категорий</span>
          <span
            style={{
              ...STYLES.sizeBadge,
              color: COLORS.text.primary,
            }}
          >
            Навигация по разделам
          </span>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: COLORS.text.primary, marginBottom: 6 }}>
          Каталог
        </h2>
        <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 13 : 14, margin: 0 }}>
          Выберите категорию, чтобы перейти к товарам.
        </p>
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
            onClick={() => onSelectCategory(group.title)}
          />
        ))}
      </div>
    </div>
  );
};

