"use client";

import { useMemo, useState } from "react";
import productsData from "@/data/products.json";
import moneyData from "@/data/money.json";
import type { Product, ProductsData } from "@/types/product";
import { buildShipments } from "@/lib/shipments";
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

  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  const shipments = useMemo(() => buildShipments(products), [products]);

  const pendingItems: PendingItem[] = useMemo(() => {
    return shipments
      .map((shipment) => {
        // В новой модели считаем сумму по позициям из batch
        // Если position.sum !== null, значит позиция требует оплаты (и сумма уже посчитана с учетом цены и кол-ва)
        const pendingAmount = shipment.batch.positions
          .filter((position) => position.sum !== null)
          .reduce((sum, position) => sum + (position.sum ?? 0), 0);

        const statusLabel = shipment.status?.label?.toLowerCase() ?? "";
        const isMarkedPaid = statusLabel.includes("оплач") && !statusLabel.includes("не оплач");

        if (isMarkedPaid || pendingAmount <= 0) {
          return null;
        }

        const normalizedTitle =
          shipment.title?.replace(/^Партия/i, "партию") ?? `партию ${shipment.id}`;

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
