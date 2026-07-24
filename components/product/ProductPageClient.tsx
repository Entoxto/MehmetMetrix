"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProductDetail } from "@/components/product/ProductDetail";
import type { Product } from "@/types/product";

interface ProductPageClientProps {
  product: Product;
}

export const ProductPageClient = ({ product }: ProductPageClientProps) => {
  const searchParams = useSearchParams();

  const backHref = useMemo(() => {
    const from = searchParams.get("from");

    if (from === "work") {
      const shipmentId = searchParams.get("batch");
      const positionId = searchParams.get("pos");
      const params = new URLSearchParams();

      if (shipmentId) params.set("batch", shipmentId);
      if (positionId) params.set("pos", positionId);

      const queryString = params.toString();
      const hash = positionId ? `#pos-${positionId}` : "";
      return `/work${queryString ? `?${queryString}` : ""}${hash}`;
    }

    if (from === "catalog") {
      const category = searchParams.get("category");
      return category
        ? `/catalog?category=${encodeURIComponent(category)}`
        : "/catalog";
    }

    return "/catalog";
  }, [searchParams]);

  return (
    <AppShell backHref={backHref} backMode="explicit">
      <ProductDetail product={product} />
    </AppShell>
  );
};
