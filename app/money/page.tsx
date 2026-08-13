import { getDataBundle } from "@/lib/dataSource";
import { buildShipments } from "@/lib/shipments";
import { buildMoneyOverview } from "@/lib/money";
import { MoneyScreen } from "@/components/money/MoneyScreen";
import { AppShell } from "@/components/layout/AppShell";

export default async function MoneyPage() {
  const data = await getDataBundle();
  const shipments = buildShipments(data.products.products, data.shipments);
  const moneyOverview = buildMoneyOverview(shipments, data.money);

  return (
    <AppShell updatedAt={data.meta.updatedAt}>
      <MoneyScreen
        pending={moneyOverview.pending}
        deposits={moneyOverview.deposits}
      />
    </AppShell>
  );
}
