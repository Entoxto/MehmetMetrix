import moneyData from "@/data/money.json";
import { getPendingShipmentSummaries } from "@/lib/shipments";
import type { ShipmentWithItems } from "@/types/shipment";

export interface MoneyStatusItem {
  id: string;
  title: string;
  amount: number;
  href?: string;
}

export interface MoneyDepositItem {
  id: string;
  lines: string[];
  amount: number;
}

export interface MoneyOverview {
  pending: {
    total: number;
    items: MoneyStatusItem[];
  };
  deposits: {
    total: number;
    items: MoneyDepositItem[];
  };
}

export type MoneyConfig = {
  pendingManual?: unknown;
  deposits?: unknown;
};

type ManualPendingConfig = {
  id?: unknown;
  title?: unknown;
  amount?: unknown;
};

type DepositConfig = {
  id?: unknown;
  title?: unknown;
  lines?: unknown;
  amount?: unknown;
};

function readFiniteAmount(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${path} должен быть положительным числом`);
  }

  return value;
}

function readOptionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readManualPendingItems(config: MoneyConfig): MoneyStatusItem[] {
  const items = Array.isArray(config.pendingManual) ? config.pendingManual : [];

  return items.map((rawItem, index) => {
    const item = rawItem as ManualPendingConfig;
    const title = readOptionalText(item.title) ?? `Ручная строка ${index + 1}`;

    return {
      id: readOptionalText(item.id) ?? `pending-manual-${index}`,
      title,
      amount: readFiniteAmount(item.amount, `money.pendingManual[${index}].amount`),
    };
  });
}

function readDepositItems(config: MoneyConfig): MoneyDepositItem[] {
  const items = Array.isArray(config.deposits) ? config.deposits : [];

  return items.map((rawItem, index) => {
    const item = rawItem as DepositConfig;
    const lines = Array.isArray(item.lines)
      ? item.lines
          .map((line) => readOptionalText(line))
          .filter((line): line is string => Boolean(line))
      : [];
    const fallbackTitle = readOptionalText(item.title);

    return {
      id: readOptionalText(item.id) ?? `deposit-${index}`,
      lines: lines.length > 0 ? lines : [fallbackTitle ?? `Депозит ${index + 1}`],
      amount: readFiniteAmount(item.amount, `money.deposits[${index}].amount`),
    };
  });
}

export function buildMoneyOverview(
  shipments: readonly ShipmentWithItems[],
  config: MoneyConfig
): MoneyOverview {
  const shipmentPendingItems: MoneyStatusItem[] = getPendingShipmentSummaries(shipments).map(
    ({ id, title, amount }) => ({
      id,
      title,
      amount,
      href: `/work?batch=${id}`,
    })
  );

  const pendingItems = [...shipmentPendingItems, ...readManualPendingItems(config)];
  const depositItems = readDepositItems(config);

  return {
    pending: {
      total: pendingItems.reduce((sum, item) => sum + item.amount, 0),
      items: pendingItems,
    },
    deposits: {
      total: depositItems.reduce((sum, item) => sum + item.amount, 0),
      items: depositItems,
    },
  };
}

export function getMoneyOverview(shipments: readonly ShipmentWithItems[]): MoneyOverview {
  return buildMoneyOverview(shipments, moneyData as MoneyConfig);
}
