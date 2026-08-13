import { Suspense } from "react";
import { getDataBundle } from "@/lib/dataSource";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getDataBundle();
  const product = data.products.products.find((item) => item.id === params.id);

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
