"use client";

import { useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { COLORS } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";
import { Shell } from "@/components/Shell";

function ProductPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isMobile, isTablet } = useBreakpoint();
  const isCompact = isMobile || isTablet;

  const productId = params.id as string;

  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  // Цена берётся напрямую из products.json (обновляется скриптом update_prices.py)
  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  // Determine back link logic
  const backHref = useMemo(() => {
    const from = searchParams.get("from");
    const batch = searchParams.get("batch");
    const pos = searchParams.get("pos");

    if (from === "work") {
      const params = new URLSearchParams();
      // We don't need 'view=work' anymore, just path /work
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
    
    return "/catalog"; // Default fallback
  }, [searchParams]);

  if (!product) {
    return (
      <Shell>
        <div
          style={{
            flex: 1,
            padding: isCompact ? 16 : 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <p style={{ color: COLORS.error, fontSize: 16 }}>Товар не найден</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title={product.name}
      subtitle={product.category}
      backHref={backHref}
    >
      <ProductDetail product={product} />
    </Shell>
  );
}

export default function ProductPage() {
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
          Загрузка...
        </div>
      }
    >
      <ProductPageContent />
    </Suspense>
  );
}
