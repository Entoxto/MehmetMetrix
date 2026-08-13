import { Suspense } from "react";
import { getDataBundle } from "@/lib/dataSource";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

export default async function CatalogPage() {
  const data = await getDataBundle();

  return (
    <Suspense fallback={<div style={APP_SHELL_STYLES.loaderContainer}>Загрузка каталога...</div>}>
      <CatalogPageClient
        products={data.products.products}
        updatedAt={data.meta.updatedAt}
      />
    </Suspense>
  );
}
