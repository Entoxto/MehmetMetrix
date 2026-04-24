"use client";

import { useMemo, useState } from "react";
import { getProducts } from "@/lib/products";
import { buildShipments } from "@/lib/shipments";
import { getDataMeta } from "@/lib/meta";
import { getMoneyOverview } from "@/lib/money";
import { Money } from "@/app/home/Money";
import { Shell } from "@/components/Shell";

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
  const moneyOverview = useMemo(() => getMoneyOverview(shipments), [shipments]);

  return (
    <Shell updatedAt={dataMeta.updatedAt}>
      <Money
        expandedCards={expandedCards}
        onToggleCard={toggleCard}
        pending={moneyOverview.pending}
        deposits={moneyOverview.deposits}
      />
    </Shell>
  );
}
