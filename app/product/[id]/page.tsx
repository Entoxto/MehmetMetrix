import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map((product) => ({ id: product.id }));
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProducts().find((item) => item.id === params.id);

  if (!product) {
    return (
      <div style={APP_SHELL_STYLES.errorContainer}>
        <p style={APP_SHELL_STYLES.errorMessage}>Товар не найден</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={APP_SHELL_STYLES.loaderContainer}>Загрузка...</div>}>
      <ProductPageClient product={product} />
    </Suspense>
  );
}
