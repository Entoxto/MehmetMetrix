"use client";

/**
 * Компонент группы поставок по году.
 * Держит вычисления и общие стили, а шапку года и лист поставок отдаёт
 * отдельным компонентам, чтобы вложенность оставалась читаемой.
 */

import { useMemo } from "react";
import type { MouseEvent } from "react";
import { COLORS, SPACING, CARD_TEMPLATES, CARD_HOVER_EFFECTS, TYPOGRAPHY, MOTION } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";
import { getYearShipmentMetrics } from "@/lib/shipmentMetrics";
import { YearHeader } from "@/components/work/YearHeader";
import { YearShipmentsSheet } from "@/components/work/YearShipmentsSheet";
import type { ShipmentWithItems } from "@/types/shipment";

interface YearGroupProps {
  year: number;
  shipments: ShipmentWithItems[];
  animationIndex?: number;
  isExpanded: boolean;
  onToggle: () => void;
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  isMobile: boolean;
  isDesktop: boolean;
}

export const YearGroup = ({
  year,
  shipments,
  animationIndex = 0,
  isExpanded,
  onToggle,
  expandedCards,
  onToggleCard,
  isMobile,
  isDesktop,
}: YearGroupProps) => {
  const responsiveTypography = useMemo(
    () => ({
      h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 20 : 30 },
      h3: { ...TYPOGRAPHY.h3, fontSize: isMobile ? 18 : 22 },
      body: { ...TYPOGRAPHY.body, fontSize: isMobile ? 11 : 13 },
      caption: { ...TYPOGRAPHY.caption, fontSize: isMobile ? 9 : 11 },
      amount: { ...TYPOGRAPHY.amount, fontSize: isMobile ? 18 : 30 },
      tableHeader: {
        ...TYPOGRAPHY.tableHeader,
        fontSize: isMobile ? 8 : 11,
      },
      tableCell: {
        ...TYPOGRAPHY.tableCell,
        fontSize: isMobile ? 10 : 12,
      },
    }),
    [isMobile]
  );

  const metrics = useMemo(() => getYearShipmentMetrics(shipments), [shipments]);

  const shipmentCellBaseBackground = isMobile ? "rgba(13,13,16,0.98)" : "rgba(18,18,22,0.78)";
  const shipmentCellHoverBackground = "rgba(34,34,39,0.96)";
  const shipmentCellBaseBorder = COLORS.border.default;
  const shipmentCellHoverBorder = COLORS.border.primaryHover;

  const handleShipmentRowHover = (event: MouseEvent<HTMLDivElement>, isHover: boolean) => {
    const row = event.currentTarget;
    const cells = Array.from(row.children) as HTMLElement[];
    cells.forEach((cell) => {
      cell.style.background = isHover ? shipmentCellHoverBackground : shipmentCellBaseBackground;
      cell.style.borderBottom = `1px solid ${
        isHover ? shipmentCellHoverBorder : shipmentCellBaseBorder
      }`;
    });
  };

  const cardStyle = useMemo(() => CARD_TEMPLATES.container(isMobile), [isMobile]);
  const shipmentCardStyle = useMemo(
    () => ({
      ...cardStyle,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(20,20,24,0.9) 100%)",
      border: `1px solid ${COLORS.border.hover}`,
      borderRadius: isMobile ? 16 : 20,
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
    }),
    [cardStyle, isMobile]
  );
  const hoverHandlers = useMemo(
    () => createCardHoverHandlers(CARD_HOVER_EFFECTS.work.hover, CARD_HOVER_EFFECTS.work.default),
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: SPACING.md,
        animation: MOTION.staggerEnter(animationIndex, isMobile ? 55 : 80),
      }}
    >
      <YearHeader
        year={year}
        metrics={metrics}
        isExpanded={isExpanded}
        isMobile={isMobile}
        isDesktop={isDesktop}
        onToggle={onToggle}
        cardStyle={cardStyle}
        hoverHandlers={hoverHandlers}
        typography={responsiveTypography}
      />

      {isExpanded && (
        <YearShipmentsSheet
          shipments={shipments}
          expandedCards={expandedCards}
          onToggleCard={onToggleCard}
          isMobile={isMobile}
          isDesktop={isDesktop}
          shipmentCardStyle={shipmentCardStyle}
          hoverHandlers={hoverHandlers}
          onRowHover={handleShipmentRowHover}
          cellBaseBackground={shipmentCellBaseBackground}
          cellBaseBorder={shipmentCellBaseBorder}
          typography={responsiveTypography}
        />
      )}
    </div>
  );
};
