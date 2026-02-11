"use client";

import { useMemo, useState } from "react";
import moneyData from "@/data/money.json";
import { getProducts } from "@/lib/products";
import { buildShipments } from "@/lib/shipments";
import { Money } from "@/app/home/Money";
import { Shell } from "@/components/Shell";
import { isPaidStatus } from "@/lib/statusText";

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

  const shipments = useMemo(() => buildShipments(products), [products]);

  const pendingItems: PendingItem[] = useMemo(() => {
    return shipments
      .map((shipment) => {
        // Партия считается оплаченной, если её статус содержит "оплачен" (и не "не оплачен" / "частично")
        const isShipmentPaid = isPaidStatus(shipment.status);

        // Если вся партия оплачена — пропускаем
        if (isShipmentPaid) {
          return null;
        }

        // Считаем сумму только по НЕ оплаченным позициям внутри партии
        // Позиция учитывается, если:
        // 1. У неё есть сумма (sum !== null)
        // 2. Её статус НЕ считается оплаченным (isPaidStatus === false)
        const pendingAmount = shipment.batch.positions
          .filter((position) => position.sum !== null && !isPaidStatus(position.statusLabel))
          .reduce((sum, position) => sum + (position.sum ?? 0), 0);

        if (pendingAmount <= 0) {
          return null;
        }

        const normalizedTitle =
          shipment.title?.replace(/^Поставка/i, "поставку") ?? `поставку ${shipment.id}`;

        return {
          id: shipment.id,
          title: `Оплата за ${normalizedTitle}`,
          amount: pendingAmount,
        };
      })
      .filter((item): item is PendingItem => Boolean(item));
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
    <Shell>
      <Money
        expandedCards={expandedCards}
        onToggleCard={toggleCard}
        pending={{ total: pendingTotal, items: pendingItems }}
        deposits={{ total: depositTotal, items: depositItems }}
      />
    </Shell>
  );
}
