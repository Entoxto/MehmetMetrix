import { getProducts } from "@/lib/products";
import { buildShipments } from "@/lib/shipments";
import { getDataMeta } from "@/lib/meta";
import { getMoneyOverview } from "@/lib/money";
import { MoneyScreen } from "@/components/money/MoneyScreen";
import { AppShell } from "@/components/layout/AppShell";

export default function MoneyPage() {
  const products = getProducts();
  const dataMeta = getDataMeta();
  const shipments = buildShipments(products);
  const moneyOverview = getMoneyOverview(shipments);

  return (
    <AppShell updatedAt={dataMeta.updatedAt}>
      <MoneyScreen
        pending={moneyOverview.pending}
        deposits={moneyOverview.deposits}
      />
    </AppShell>
  );
}
