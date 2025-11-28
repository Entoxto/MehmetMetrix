"use client";

import { useMemo, useState, useCallback } from "react";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";
import { buildShipments } from "@/lib/shipments";
import { useBreakpoint } from "@/constants/MonitorSize";
import { Work } from "@/app/home/Work";
import { Shell } from "@/components/Shell";

export default function WorkPage() {
  const { isMobile, breakpoint } = useBreakpoint();
  const isDesktop = breakpoint === "laptop" || breakpoint === "desktop";

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  // По умолчанию 2025 год открыт
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([2025]));

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }, []);

  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  const shipments = useMemo(() => buildShipments(products), [products]);

  return (
    <Shell>
      <Work
        isMobile={isMobile}
        isDesktop={isDesktop}
        shipments={shipments}
        expandedCards={expandedCards}
        onToggleCard={toggleCard}
        expandedYears={expandedYears}
        onToggleYear={toggleYear}
      />
    </Shell>
  );
}


