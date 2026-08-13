import { Suspense } from "react";
import { getDataBundle } from "@/lib/dataSource";
import { buildShipments } from "@/lib/shipments";
import { WorkScreen } from "@/components/work/WorkScreen";
import { AppShell } from "@/components/layout/AppShell";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

export default async function WorkPage() {
  const data = await getDataBundle();
  const products = data.products.products;
  const shipments = buildShipments(products, data.shipments);

  return (
    <AppShell updatedAt={data.meta.updatedAt}>
      <Suspense fallback={<div style={APP_SHELL_STYLES.errorContainer}>Загрузка истории...</div>}>
        <WorkScreen shipments={shipments} />
      </Suspense>
    </AppShell>
  );
}
