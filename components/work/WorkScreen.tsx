"use client";

/**
 * Экран «Работа».
 * Показывает поставки, сгруппированные по годам, группирует позиции по статусам и помогает следить за пошивом.
 * Использует YearGroup для группировки по годам и профильные компоненты поставок.
 * Адаптируется под мобильный и десктоп.
 */
import { useMemo } from "react";
import { groupShipmentsByYear } from "@/lib/shipmentGrouping";
import { YearGroup } from "@/components/work/YearGroup";
import { PageFrame } from "@/components/ui/PageFrame";
import { PageIntro } from "@/components/ui/PageIntro";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useWorkNavigationState } from "@/hooks/useWorkNavigationState";
import type { Shipment } from "@/types/shipment";

interface WorkScreenProps {
  shipments: Shipment[];
}

export const WorkScreen = ({ shipments }: WorkScreenProps) => {
  const { isMobile, isWide: isDesktop } = useBreakpoint();
  const { expandedCards, expandedYears, toggleCard, toggleYear } =
    useWorkNavigationState(shipments);

  // Группируем поставки по годам
  const shipmentsByYear = useMemo(() => groupShipmentsByYear(shipments), [shipments]);

  return (
    <PageFrame>
      <PageIntro
        title="Все партии и их статусы"
        description="История поставок по годам: текущие партии, завершенные отгрузки и состояние оплаты в одном месте."
      />

      {Array.from(shipmentsByYear.entries()).map(([year, yearShipments], index) => (
        <YearGroup
          key={year}
          year={year}
          shipments={yearShipments}
          animationIndex={index}
          isExpanded={expandedYears.has(year)}
          onToggle={() => toggleYear(year)}
          expandedCards={expandedCards}
          onToggleCard={toggleCard}
          isMobile={isMobile}
          isDesktop={isDesktop}
        />
      ))}
    </PageFrame>
  );
};


