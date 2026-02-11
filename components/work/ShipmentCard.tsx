"use client";

/**
 * Карточка поставки внутри YearGroup.
 * Показывает заголовок, статус, дату/ETA и раскрывающуюся таблицу позиций.
 */

import type { CSSProperties, MouseEvent } from "react";
import { COLORS, SPACING, STATUS_CHIP_STYLE } from "@/constants/styles";
import { formatCurrency, getStatusLabel } from "@/lib/format";
import { isPaidStatus } from "@/lib/statusText";
import { BatchView } from "@/components/work/BatchView";
import type { ShipmentWithItems } from "@/types/shipment";

interface ShipmentCardProps {
  shipment: ShipmentWithItems;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isDesktop: boolean;
  cardStyle: CSSProperties;
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

/**
 * Блок даты/ETA поставки — единый для десктопа и мобильных.
 */
const ShipmentDateInfo = ({
  shipment,
  isDesktop,
  isMobile,
  typography,
}: {
  shipment: ShipmentWithItems;
  isDesktop: boolean;
  isMobile: boolean;
  typography: { caption: CSSProperties };
}) => {
  const label = shipment.receivedDate ? "Дата получения" : "План доставки";
  const value = shipment.receivedDate || shipment.eta;
  const detailValueFontSize = isMobile ? 14 : 15;
  const labelColor = isDesktop ? "rgba(212, 212, 212, 0.6)" : COLORS.text.muted;

  if (!value) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        ...(isDesktop
          ? {
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 4,
              minHeight: 60,
              paddingRight: SPACING.md,
            }
          : {
              gap: SPACING.xs,
              marginTop: SPACING.xs,
              paddingTop: SPACING.sm,
              borderTop: `1px solid ${COLORS.border.default}`,
            }),
      }}
    >
      <p
        style={{
          ...typography.caption,
          color: labelColor,
          textTransform: "uppercase",
          margin: 0,
          lineHeight: 1.4,
          ...(isDesktop ? { textAlign: "right" } : {}),
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: detailValueFontSize,
          lineHeight: 1.4,
          color: COLORS.text.primary,
          fontWeight: 600,
          margin: 0,
          ...(isDesktop ? { textAlign: "right" } : {}),
        }}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </p>
    </div>
  );
};

export const ShipmentCard = ({
  shipment,
  isExpanded,
  onToggle,
  isMobile,
  isDesktop,
  cardStyle,
  hoverHandlers,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: ShipmentCardProps) => {
  const titleWithNonBreakingSpace = shipment.title.replace(/\s+№/, "\u00A0№");
  const highlightStatus = isPaidStatus(shipment.status);
  const statusLabelText = getStatusLabel(shipment.status);

  return (
    <div
      id={`batch-${shipment.id}`}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{ ...cardStyle, cursor: "pointer", outline: "none" }}
      {...(isMobile ? {} : hoverHandlers)}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${COLORS.primary}`;
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      aria-expanded={isExpanded}
      aria-label={`${shipment.title}, ${statusLabelText}`}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr auto" : "1fr",
          gap: isDesktop ? SPACING.lg : SPACING.md,
          alignItems: "center",
          minHeight: isDesktop ? 60 : "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
            <span
              style={{
                fontSize: isMobile ? 14 : 18,
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
            <h3
              style={{
                ...typography.h3,
                color: COLORS.primary,
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flex: 1,
              }}
            >
              {titleWithNonBreakingSpace}
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
            <div
              style={STATUS_CHIP_STYLE(highlightStatus, isMobile)}
              role="status"
              aria-label={`Статус: ${statusLabelText}`}
            >
              <span style={{ textTransform: "uppercase" }}>{statusLabelText}</span>
            </div>
          </div>
        </div>

        {isDesktop && (
          <ShipmentDateInfo
            shipment={shipment}
            isDesktop={true}
            isMobile={isMobile}
            typography={typography}
          />
        )}

        {!isDesktop && (
          <ShipmentDateInfo
            shipment={shipment}
            isDesktop={false}
            isMobile={isMobile}
            typography={typography}
          />
        )}
      </div>

      {isExpanded && (
        <>
          <div
            style={{
              width: "100%",
              height: 1,
              background: COLORS.border.default,
              marginTop: SPACING.md,
              marginBottom: SPACING.md,
            }}
            aria-hidden="true"
          />
          <BatchView
            batch={shipment.batch}
            onRowHover={onRowHover}
            cellBaseBackground={cellBaseBackground}
            cellBaseBorder={cellBaseBorder}
            typography={typography}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: SPACING.md,
              borderTop: `1px solid ${COLORS.border.default}`,
              paddingTop: SPACING.md,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ ...typography.body, margin: 0, color: COLORS.text.secondary }}>
                Итого по поставке
              </p>
              {shipment.hasPriceGaps && (
                <p
                  style={{
                    ...typography.caption,
                    margin: 0,
                    marginTop: 4,
                    color: COLORS.text.muted,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Без учёта позиций с уточняемой стоимостью, оплаченных ранее или без оплаты
                </p>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p
                style={{
                  ...typography.caption,
                  margin: 0,
                  color: COLORS.text.secondary,
                  textTransform: "uppercase",
                }}
              >
                Сумма поставки
              </p>
              <p
                style={{
                  ...typography.amount,
                  margin: 0,
                  color: highlightStatus ? COLORS.success : COLORS.primary,
                }}
              >
                {formatCurrency(shipment.totalAmount)}
              </p>
            </div>
          </div>

          {shipment.hasPriceGaps && (
            <p
              style={{
                ...typography.body,
                margin: 0,
                marginTop: SPACING.sm,
                color: COLORS.text.secondary,
                fontStyle: "italic",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              Стоимость по отдельным образцам, оплаченным ранее или возвращённым после ремонта
              не включена.
            </p>
          )}
        </>
      )}
    </div>
  );
};
