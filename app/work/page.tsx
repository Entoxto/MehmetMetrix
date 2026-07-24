import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { buildShipments } from "@/lib/shipments";
import { getDataMeta } from "@/lib/meta";
import { WorkScreen } from "@/components/work/WorkScreen";
import { AppShell } from "@/components/layout/AppShell";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

export default function WorkPage() {
  const products = getProducts();
  const dataMeta = getDataMeta();
  const shipments = buildShipments(products);

  return (
    <AppShell updatedAt={dataMeta.updatedAt}>
      <Suspense fallback={<div style={APP_SHELL_STYLES.errorContainer}>Загрузка истории...</div>}>
        <WorkScreen shipments={shipments} />
      </Suspense>
    </AppShell>
  );
}
