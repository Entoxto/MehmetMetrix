"use client";

import { useMemo, useState } from "react";
import moneyData from "@/data/money.json";
import { getProducts } from "@/lib/products";
import { buildShipments, getPendingShipmentSummaries } from "@/lib/shipments";
import { getDataMeta } from "@/lib/meta";
import { Money } from "@/app/home/Money";
import { Shell } from "@/components/Shell";

type PendingItem = { id: string; title: string; amount: number };
type DepositConfig = { id?: string; title?: string; lines?: string[]; amount?: number };
type DepositItem = { id: string; lines: string[]; amount: number };

export default function MoneyPage() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const products = useMemo(() => getProducts(), []);
  const dataMeta = useMemo(() => getDataMeta(), []);

  const shipments = useMemo(() => buildShipments(products), [products]);

  const pendingItems: PendingItem[] = useMemo(() => {
    return getPendingShipmentSummaries(shipments).map(({ id, title, amount }) => ({
      id,
      title,
      amount,
    }));
  }, [shipments]);

  const pendingTotal = pendingItems.reduce((sum, item) => sum + item.amount, 0);

  const depositItems: DepositItem[] = useMemo(() => {
    const depositsConfig = Array.isArray((moneyData as { deposits?: DepositConfig[] }).deposits)
      ? ((moneyData as { deposits?: DepositConfig[] }).deposits as DepositConfig[])
      : [];

    return depositsConfig.map((item, index) => ({
      id: item.id ?? `deposit-${index}`,
      lines:
        item.lines && item.lines.length > 0
          ? item.lines
          : item.title
          ? [item.title]
          : [`Депозит ${index + 1}`],
      amount: typeof item.amount === "number" ? item.amount : Number(item.amount ?? 0),
    }));
  }, []);

  const depositTotal = depositItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Shell updatedAt={dataMeta.updatedAt}>
      <Money
        expandedCards={expandedCards}
        onToggleCard={toggleCard}
        pending={{ total: pendingTotal, items: pendingItems }}
        deposits={{ total: depositTotal, items: depositItems }}
      />
    </Shell>
  );
}
