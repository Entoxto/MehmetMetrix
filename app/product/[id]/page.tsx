"use client";

import { useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProducts } from "@/lib/products";
import { Shell } from "@/components/Shell";
import { HOME_STYLES } from "@/app/home/styles";

function ProductPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const productId = params.id as string;

  const products = useMemo(() => getProducts(), []);

  // Цена берётся напрямую из products.json (обновляется шагом актуализации каталога)
  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  // Возврат сохраняет контекст источника: Work (партия/позиция) или Catalog (категория)
  const backHref = useMemo(() => {
    const from = searchParams.get("from");
    const batch = searchParams.get("batch");
    const pos = searchParams.get("pos");

    if (from === "work") {
      const params = new URLSearchParams();
      if (batch) params.set("batch", batch);
      if (pos) params.set("pos", pos);
      const queryString = params.toString();
      const hash = pos ? `#pos-${pos}` : "";
      return `/work?${queryString}${hash}`;
    } else if (from === "catalog") {
      const category = searchParams.get("category");
      if (category) {
         return `/catalog?category=${encodeURIComponent(category)}`;
      }
      return "/catalog";
    }

    return "/catalog";
  }, [searchParams]);

  if (!product) {
    return (
      <Shell>
        <div style={HOME_STYLES.errorContainer}>
          <p style={HOME_STYLES.errorMessage}>Товар не найден</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell backHref={backHref} backMode="explicit">
      <ProductDetail product={product} />
    </Shell>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div style={HOME_STYLES.loaderContainer}>Загрузка...</div>}>
      <ProductPageContent />
    </Suspense>
  );
}
