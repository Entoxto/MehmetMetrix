"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import productsData from "@/data/products.json";
import shipmentsData from "@/data/shipments.json";
import type { Product, ProductsData } from "@/types/product";
import type { ShipmentConfig } from "@/types/shipment";
import { useBreakpoint } from "@/constants/MonitorSize";
import { Catalog } from "@/app/home/Catalog";
import { Shell } from "@/components/Shell";
import { COLORS } from "@/constants/styles";
import { getPriceMap } from "@/lib/prices";

function CatalogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useBreakpoint();

  const selectedCategory = searchParams.get("category");

  // Получаем карту актуальных цен из партий
  const priceMap = useMemo(() => {
    return getPriceMap(shipmentsData as readonly ShipmentConfig[]);
  }, []);

  // Обогащаем продукты актуальными ценами из партий
  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return (productsDataTyped.products || []).map(product => ({
        ...product,
        price: priceMap.get(product.id) ?? product.price,
      }));
    } catch {
      return [];
    }
  }, [priceMap]);

  const categoryDescriptions: Record<string, string> = useMemo(
    () => ({
      Мех: "Меринос, чернобурка, нутрия — всё, что хочется гладить.",
      Замша: "Мягкая, как голос Мехмета, когда он говорит про сроки.",
      Кожа: "Коровка старалась, не подведи её в каталоге.",
      Экзотика: "Для тех, кто любит, чтобы шкура шипела дорого.",
    }),
    []
  );

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
      desc: categoryDescriptions[cat] || "",
      badge: `${count} ${count === 1 ? "позиция" : "позиций"}`,
    }));
  }, [categoryDescriptions, products]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter((product) => product.category === selectedCategory && product.inStock);
  }, [products, selectedCategory]);

  const handleSelectCategory = (category: string | null) => {
    if (category) {
      router.push(`/catalog?category=${encodeURIComponent(category)}`);
    } else {
      router.push("/catalog");
    }
  };

  const backHref = selectedCategory ? "/catalog" : "/";
  const subtitle = selectedCategory ? categoryDescriptions[selectedCategory] : null;

  return (
    <Shell
      title={selectedCategory}
      subtitle={subtitle}
      backHref={backHref}
    >
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
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
            color: COLORS.text.primary,
          }}
        >
          Загрузка каталога...
        </div>
      }
    >
      <CatalogPageContent />
    </Suspense>
  );
}


