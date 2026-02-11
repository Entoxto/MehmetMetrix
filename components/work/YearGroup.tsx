"use client";

/**
 * Компонент группы поставок по году.
 * Отображает год с выпадающим списком поставок внутри.
 * При раскрытии поставки отображаются без отступа, не уменьшая ширину экрана.
 */

import { useMemo } from "react";
import type { MouseEvent } from "react";
import { COLORS, SPACING, CARD_TEMPLATES, CARD_HOVER_EFFECTS, TYPOGRAPHY } from "@/constants/styles";
import { formatCurrency } from "@/lib/format";
import { createCardHoverHandlers } from "@/lib/utils";
import { ShipmentCard } from "@/components/work/ShipmentCard";
import type { ShipmentWithItems } from "@/types/shipment";

interface YearGroupProps {
  year: number;
  shipments: ShipmentWithItems[];
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
  isExpanded,
  onToggle,
  expandedCards,
  onToggleCard,
  isMobile,
  isDesktop,
}: YearGroupProps) => {
  // Типографика с учётом брейкпоинтов
  const responsiveTypography = useMemo(
    () => ({
      h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 22 : 30 },
      h3: { ...TYPOGRAPHY.h3, fontSize: isMobile ? 18 : 22 },
      body: { ...TYPOGRAPHY.body, fontSize: isMobile ? 11 : 13 },
      caption: { ...TYPOGRAPHY.caption, fontSize: isMobile ? 9 : 11 },
      amount: { ...TYPOGRAPHY.amount, fontSize: isMobile ? 22 : 30 },
      tableHeader: {
        ...TYPOGRAPHY.tableHeader,
        fontSize: isMobile ? 9 : 11,
      },
      tableCell: {
        ...TYPOGRAPHY.tableCell,
        fontSize: isMobile ? 10 : 12,
      },
    }),
    [isMobile]
  );

  // Годовой оборот: сумма totalAmount по всем поставкам года
  const yearlyTurnover = useMemo(
    () => shipments.reduce((sum, shipment) => sum + shipment.totalAmount, 0),
    [shipments]
  );

  const shipmentCellBaseBackground = COLORS.background.card;
  const shipmentCellHoverBackground = COLORS.background.cardExpanded;
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
  const hoverHandlers = useMemo(
    () => createCardHoverHandlers(CARD_HOVER_EFFECTS.work.hover, CARD_HOVER_EFFECTS.work.default),
    []
  );

  const yearHeaderStyle: React.CSSProperties = useMemo(
    () => ({
      ...cardStyle,
      cursor: "pointer",
      outline: "none",
      marginBottom: isExpanded ? SPACING.md : 0,
    }),
    [cardStyle, isExpanded]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
      {/* Заголовок года */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        style={yearHeaderStyle}
        {...(isMobile ? {} : hoverHandlers)}
        onFocus={(e) => {
          e.currentTarget.style.outline = `2px solid ${COLORS.primary}`;
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        aria-expanded={isExpanded}
        aria-label={`Год ${year}, поставок: ${shipments.length}`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING.md,
            minHeight: isDesktop ? 50 : "auto",
          }}
        >
          <span
            style={{
              fontSize: isMobile ? 16 : 20,
              color: COLORS.primary,
              transition: "transform 0.3s ease",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              flexShrink: 0,
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            ▶
          </span>
          <h2
            style={{
              ...responsiveTypography.h2,
              color: COLORS.primary,
              margin: 0,
              flex: 1,
            }}
          >
            {year}
          </h2>
          {/* Блок с годовым оборотом справа от года */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 2,
              paddingRight: SPACING.md,
            }}
          >
            <span
              style={{
                ...responsiveTypography.caption,
                color: COLORS.text.secondary,
                textTransform: "uppercase",
                margin: 0,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              Годовой оборот
            </span>
            <span
              style={{
                ...responsiveTypography.amount,
                fontSize: isMobile ? 16 : 22,
                margin: 0,
                lineHeight: 1.2,
                color: COLORS.primary,
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(yearlyTurnover)}
            </span>
          </div>
        </div>
      </div>

      {/* Список поставок внутри года */}
      {isExpanded && (
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
                ...cardStyle,
                padding: SPACING.lg,
                textAlign: "center",
                color: COLORS.text.secondary,
                fontStyle: "italic",
              }}
            >
              Нет поставок в этом году
            </div>
          ) : (
            shipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                isExpanded={expandedCards.has(shipment.id)}
                onToggle={() => onToggleCard(shipment.id)}
                isMobile={isMobile}
                isDesktop={isDesktop}
                cardStyle={cardStyle}
                hoverHandlers={hoverHandlers}
                onRowHover={handleShipmentRowHover}
                cellBaseBackground={shipmentCellBaseBackground}
                cellBaseBorder={shipmentCellBaseBorder}
                typography={responsiveTypography}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
