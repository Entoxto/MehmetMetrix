"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { getProducts } from "@/lib/products";
import { getDataMeta } from "@/lib/meta";
import { formatModelCount } from "@/lib/format";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Catalog } from "@/app/home/Catalog";
import { Shell } from "@/components/Shell";
import { HOME_STYLES } from "@/app/home/styles";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Мех: "Меринос, чернобурка, нутрия — всё, что хочется гладить.",
  Замша: "Мягкая, как голос Мехмета, когда он говорит про сроки.",
  Кожа: "Коровка старалась, не подведи её в каталоге.",
  Экзотика: "Для тех, кто любит, чтобы шкура шипела дорого.",
};

function CatalogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useBreakpoint();

  const selectedCategory = searchParams.get("category");

  // Цены берутся напрямую из products.json (обновляются шагом актуализации каталога)
  const products: Product[] = useMemo(() => getProducts(), []);
  const dataMeta = useMemo(() => getDataMeta(), []);

  const catalogGroups = useMemo(() => {
    const categoryMap = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = 0;
      }
      acc[product.category]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryMap).map(([cat, count]) => ({
      title: cat,
      desc: CATEGORY_DESCRIPTIONS[cat] || "",
      badge: formatModelCount(count),
    }));
  }, [products]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products
      .filter((product) => product.category === selectedCategory && product.inStock)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
  }, [products, selectedCategory]);

  const handleSelectCategory = (category: string | null) => {
    if (category) {
      router.push(`/catalog?category=${encodeURIComponent(category)}`);
    } else {
      router.push("/catalog");
    }
  };

  const backHref = selectedCategory ? "/catalog" : "/";
  return (
    <Shell backHref={backHref} updatedAt={dataMeta.updatedAt}>
      <Catalog
        isMobile={isMobile}
        selectedCategory={selectedCategory}
        catalogGroups={catalogGroups}
        categoryProducts={categoryProducts}
        onSelectCategory={handleSelectCategory}
      />
    </Shell>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div style={HOME_STYLES.loaderContainer}>Загрузка каталога...</div>}>
      <CatalogPageContent />
    </Suspense>
  );
}
