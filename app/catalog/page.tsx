import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getDataMeta } from "@/lib/meta";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

export default function CatalogPage() {
  const products = getProducts();
  const dataMeta = getDataMeta();

  return (
    <Suspense fallback={<div style={APP_SHELL_STYLES.loaderContainer}>Загрузка каталога...</div>}>
      <CatalogPageClient products={products} updatedAt={dataMeta.updatedAt} />
    </Suspense>
  );
}
