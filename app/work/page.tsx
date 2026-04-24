"use client";

import { useMemo } from "react";
import { getProducts } from "@/lib/products";
import { buildShipments } from "@/lib/shipments";
import { getDataMeta } from "@/lib/meta";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useWorkNavigationState } from "@/hooks/useWorkNavigationState";
import { Work } from "@/app/home/Work";
import { Shell } from "@/components/Shell";

export default function WorkPage() {
  const { isMobile, isWide: isDesktop } = useBreakpoint();

  const products = useMemo(() => getProducts(), []);
  const dataMeta = useMemo(() => getDataMeta(), []);

  const shipments = useMemo(() => buildShipments(products), [products]);
  const { expandedCards, expandedYears, toggleCard, toggleYear } =
    useWorkNavigationState(shipments);

  return (
    <Shell updatedAt={dataMeta.updatedAt}>
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
