import { getPendingShipmentSummaries } from "@/lib/shipments";
import type { MoneyConfig } from "@/types/dataBundle";
import type { Shipment } from "@/types/shipment";

export interface MoneyStatusItem {
  id: string;
  title: string;
  amount: number | null;
  href?: string;
  unknownPricePositions: number;
  unknownPriceUnits: number;
}

export interface MoneyDepositItem {
  id: string;
  lines: string[];
  amount: number;
}

export interface MoneyOverview {
  pending: {
    total: number | null;
    knownTotal: number;
    unknownPricePositions: number;
    unknownPriceUnits: number;
    items: MoneyStatusItem[];
  };
  deposits: {
    total: number;
    items: MoneyDepositItem[];
  };
}

// MoneyConfig has already passed the shared snapshot boundary validator.
function readManualPendingItems(config: MoneyConfig): MoneyStatusItem[] {
  return (config.pendingManual ?? []).map((item, index) => ({
    id: item.id?.trim() ?? `pending-manual-${index}`,
    title: item.title.trim(),
    amount: item.amount,
    unknownPricePositions: 0,
    unknownPriceUnits: 0,
  }));
}

function readDepositItems(config: MoneyConfig): MoneyDepositItem[] {
  return (config.deposits ?? []).map((item, index) => ({
    id: item.id?.trim() ?? `deposit-${index}`,
    lines: item.lines?.map((line) => line.trim()) ?? [item.title!.trim()],
    amount: item.amount,
  }));
}

export function buildMoneyOverview(
  shipments: readonly Shipment[],
  config: MoneyConfig
): MoneyOverview {
  const shipmentPendingItems: MoneyStatusItem[] = getPendingShipmentSummaries(shipments).map(
    ({ id, title, amount, unknownPricePositions, unknownPriceUnits }) => ({
      id,
      title,
      amount,
      href: `/work?batch=${id}`,
      unknownPricePositions,
      unknownPriceUnits,
    })
  );

  const pendingItems = [...shipmentPendingItems, ...readManualPendingItems(config)];
  const depositItems = readDepositItems(config);
  const knownTotal = pendingItems.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const unknownPricePositions = pendingItems.reduce(
    (sum, item) => sum + item.unknownPricePositions,
    0
  );
  const unknownPriceUnits = pendingItems.reduce(
    (sum, item) => sum + item.unknownPriceUnits,
    0
  );

  return {
    pending: {
      total: knownTotal > 0 || unknownPricePositions === 0 ? knownTotal : null,
      knownTotal,
      unknownPricePositions,
      unknownPriceUnits,
      items: pendingItems,
    },
    deposits: {
      total: depositItems.reduce((sum, item) => sum + item.amount, 0),
      items: depositItems,
    },
  };
}
