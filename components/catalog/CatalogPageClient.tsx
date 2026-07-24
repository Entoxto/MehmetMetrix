"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogScreen } from "@/components/catalog/CatalogScreen";
import { AppShell } from "@/components/layout/AppShell";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatModelCount } from "@/lib/format";
import type { Product } from "@/types/product";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Мех: "Меринос, чернобурка, нутрия — всё, что хочется гладить.",
  Замша: "Мягкая, как голос Мехмета, когда он говорит про сроки.",
  Кожа: "Коровка старалась, не подведи её в каталоге.",
  Экзотика: "Для тех, кто любит, чтобы шкура шипела дорого.",
};

interface CatalogPageClientProps {
  products: Product[];
  updatedAt?: string;
}

export const CatalogPageClient = ({ products, updatedAt }: CatalogPageClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useBreakpoint();
  const selectedCategory = searchParams.get("category");

  const catalogGroups = useMemo(() => {
    const categoryMap = products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryMap).map(([category, count]) => ({
      title: category,
      desc: CATEGORY_DESCRIPTIONS[category] || "",
      badge: formatModelCount(count),
    }));
  }, [products]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];

    return products
      .filter((product) => product.category === selectedCategory && product.inStock)
      .sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" }));
  }, [products, selectedCategory]);

  const handleSelectCategory = (category: string | null) => {
    router.push(category ? `/catalog?category=${encodeURIComponent(category)}` : "/catalog");
  };

  return (
    <AppShell
      backHref={selectedCategory ? "/catalog" : "/"}
      updatedAt={updatedAt}
    >
      <CatalogScreen
        isMobile={isMobile}
        selectedCategory={selectedCategory}
        catalogGroups={catalogGroups}
        categoryProducts={categoryProducts}
        onSelectCategory={handleSelectCategory}
      />
    </AppShell>
  );
};
