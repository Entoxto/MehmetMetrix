"use client";

import type { CSSProperties, MouseEvent } from "react";
import { COLORS, SPACING } from "@/constants/styles";
import { ShipmentCard } from "@/components/work/ShipmentCard";
import type { Shipment } from "@/types/shipment";

interface YearShipmentsSheetProps {
  shipments: Shipment[];
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  isMobile: boolean;
  isDesktop: boolean;
  shipmentCardStyle: CSSProperties;
  hoverHandlers: {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (e: MouseEvent<HTMLElement>) => void;
  };
  onRowHover: (event: MouseEvent<HTMLDivElement>, isHover: boolean) => void;
  cellBaseBackground: string;
  cellBaseBorder: string;
  typography: {
    h3: CSSProperties;
    body: CSSProperties;
    caption: CSSProperties;
    amount: CSSProperties;
    tableHeader: CSSProperties;
    tableCell: CSSProperties;
  };
}

const getSheetStyle = (isMobile: boolean): CSSProperties => ({
  position: "relative",
  marginTop: isMobile ? -SPACING.sm : -SPACING.md,
  paddingTop: isMobile ? SPACING.md : SPACING.lg,
  paddingRight: isMobile ? SPACING.sm : SPACING.lg,
  paddingBottom: isMobile ? SPACING.smPlus : SPACING.lg,
  paddingLeft: isMobile ? SPACING.smPlus : SPACING.xl,
  border: `1px solid ${COLORS.border.primary}`,
  borderTop: "none",
  borderRadius: isMobile ? "0 0 18px 18px" : "0 0 28px 28px",
  background:
    "linear-gradient(180deg, rgba(244,195,77,0.08) 0%, rgba(33,33,38,0.96) 16%, rgba(16,16,19,0.94) 100%)",
  boxShadow: isMobile ? "0 18px 38px rgba(0, 0, 0, 0.28)" : "0 28px 60px rgba(0, 0, 0, 0.34)",
  overflow: "hidden",
  animation: "fadeIn 260ms ease-out",
});

export const YearShipmentsSheet = ({
  shipments,
  expandedCards,
  onToggleCard,
  isMobile,
  isDesktop,
  shipmentCardStyle,
  hoverHandlers,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: YearShipmentsSheetProps) => (
  <div style={getSheetStyle(isMobile)}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: SPACING.md,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {shipments.length === 0 ? (
        <div
          style={{
            ...shipmentCardStyle,
            padding: SPACING.lg,
            textAlign: "center",
            color: COLORS.text.secondary,
          }}
        >
          Нет поставок в этом году
        </div>
      ) : (
        shipments.map((shipment, index) => (
          <ShipmentCard
            key={shipment.id}
            shipment={shipment}
            animationIndex={index}
            isExpanded={expandedCards.has(shipment.id)}
            onToggle={() => onToggleCard(shipment.id)}
            isMobile={isMobile}
            isDesktop={isDesktop}
            cardStyle={shipmentCardStyle}
            hoverHandlers={hoverHandlers}
            onRowHover={onRowHover}
            cellBaseBackground={cellBaseBackground}
            cellBaseBorder={cellBaseBorder}
            typography={typography}
          />
        ))
      )}
    </div>
  </div>
);
