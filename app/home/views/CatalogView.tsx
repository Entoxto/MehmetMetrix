"use client";

import type { Product } from "@/types/product";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { COLORS, SPACING } from "@/constants/styles";

interface CatalogGroup {
  title: string;
  desc: string;
  badge: string;
}

interface CatalogViewProps {
  isMobile: boolean;
  selectedCategory: string | null;
  categoryDescriptions: Record<string, string>;
  catalogGroups: CatalogGroup[];
  categoryProducts: Product[];
  onSelectCategory: (category: string | null) => void;
}

export const CatalogView = ({
  isMobile,
  selectedCategory,
  categoryDescriptions,
  catalogGroups,
  categoryProducts,
  onSelectCategory,
}: CatalogViewProps) => {
  if (selectedCategory) {
    return (
      <div style={{ flex: 1, padding: isMobile ? SPACING.md : SPACING.xl }}>
        <div style={{ marginBottom: isMobile ? SPACING.md : SPACING.lg }}>
          <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 12 : 13, fontStyle: "italic" }}>
            {categoryDescriptions[selectedCategory]}
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gap: isMobile ? SPACING.md : SPACING.lg,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
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
    <div style={{ flex: 1, padding: isMobile ? SPACING.md : SPACING.xl }}>
      <div style={{ marginBottom: isMobile ? SPACING.md : SPACING.lg }}>
        <h2 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: COLORS.primary, marginBottom: 6 }}>
          Каталог
        </h2>
        <p style={{ color: COLORS.text.secondary, fontSize: isMobile ? 12 : 13, fontStyle: "italic" }}>
          Выбери, чем сегодня восхищаться.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gap: isMobile ? SPACING.md : 20,
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
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

