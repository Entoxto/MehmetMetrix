"use client";

/**
 * Экран каталога на главной странице.
 * Показывает список категорий и товары выбранной категории.
 * Переключается между видами, использует ProductCard и CategoryCard.
 */
import type { Product } from "@/types/product";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SPACING, CARD_TEMPLATES } from "@/constants/styles";
import { PageFrame } from "@/components/ui/PageFrame";
import { PageIntro } from "@/components/ui/PageIntro";
import { formatCountLabel, formatModelCount } from "@/lib/format";

interface CatalogGroup {
  title: string;
  desc: string;
  badge: string;
}

interface CatalogScreenProps {
  isMobile: boolean;
  selectedCategory: string | null;
  catalogGroups: CatalogGroup[];
  categoryProducts: Product[];
  onSelectCategory: (category: string | null) => void;
}

export const CatalogScreen = ({
  isMobile,
  selectedCategory,
  catalogGroups,
  categoryProducts,
  onSelectCategory,
}: CatalogScreenProps) => {
  if (selectedCategory) {
    return (
      <PageFrame>
        <PageIntro
          title={selectedCategory}
          meta={<span>{formatModelCount(categoryProducts.length)} в каталоге</span>}
        />

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
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <PageIntro
        title="Каталог изделий"
        description="Выберите материал или категорию, чтобы перейти к карточкам изделий."
        meta={
          <span>
            {formatCountLabel(catalogGroups.length, "категория", "категории", "категорий")} в каталоге
          </span>
        }
      />
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
    </PageFrame>
  );
};



