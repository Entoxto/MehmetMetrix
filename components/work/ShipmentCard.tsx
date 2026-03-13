"use client";

/**
 * Карточка поставки внутри YearGroup.
 * Показывает заголовок, статус, дату/ETA и раскрывающуюся таблицу позиций.
 */

import type { CSSProperties, MouseEvent } from "react";
import { COLORS, SPACING, STATUS_CHIP_STYLE, STYLES } from "@/constants/styles";
import { formatCurrency, formatModelCount, formatUnitCount, getStatusLabel } from "@/lib/format";
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
  const modelsCount = shipment.batch.positions.length;
  const unitsCount = shipment.batch.positions.reduce((sum, position) => sum + position.qty, 0);

  const cardContainerStyle: CSSProperties = {
    ...cardStyle,
    padding: isMobile ? SPACING.smPlus : cardStyle.padding,
    position: "relative",
    overflow: "hidden",
    background: isExpanded
      ? "linear-gradient(180deg, rgba(244,195,77,0.12) 0%, rgba(29,29,33,0.96) 16%, rgba(20,20,24,0.96) 100%)"
      : cardStyle.background,
    border: isExpanded ? `1px solid ${COLORS.border.primary}` : cardStyle.border,
    boxShadow: isExpanded ? "0 18px 36px rgba(0, 0, 0, 0.26)" : cardStyle.boxShadow,
    animation: isExpanded ? "fadeIn 220ms ease-out" : undefined,
  };

  return (
    <div
      id={`batch-${shipment.id}`}
      style={cardContainerStyle}
      {...(isMobile || isExpanded ? {} : hoverHandlers)}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: isExpanded ? 4 : 2,
          background: isExpanded
            ? "linear-gradient(180deg, rgba(244,195,77,0.9) 0%, rgba(244,195,77,0.25) 100%)"
            : "linear-gradient(180deg, rgba(244,195,77,0.55) 0%, rgba(244,195,77,0.12) 100%)",
        }}
      />

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
        aria-expanded={isExpanded}
        aria-label={`${shipment.title}, ${statusLabelText}`}
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr auto" : "1fr",
          gap: isDesktop ? SPACING.lg : SPACING.smPlus,
          alignItems: "center",
          minHeight: isDesktop ? 60 : "auto",
          position: "relative",
          zIndex: 1,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? SPACING.xsPlus : SPACING.sm }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? SPACING.sm : SPACING.md }}>
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
                color: COLORS.text.primary,
                margin: 0,
                ...(isMobile
                  ? {
                      fontSize: 17,
                      lineHeight: 1.2,
                      whiteSpace: "normal",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }
                  : {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }),
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? SPACING.xsPlus : SPACING.sm }}>
            <span style={{ ...STYLES.sizeBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "4px 8px" : STYLES.sizeBadge.padding }}>
              {formatModelCount(modelsCount)}
            </span>
            <span style={{ ...STYLES.sizeBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "4px 8px" : STYLES.sizeBadge.padding }}>
              {formatUnitCount(unitsCount)}
            </span>
            <span style={{ ...STYLES.sizeBadge, fontSize: isMobile ? 10 : 12, padding: isMobile ? "4px 8px" : STYLES.sizeBadge.padding }}>
              {formatCurrency(shipment.totalAmount)}
            </span>
            {shipment.hasPriceGaps && (
              <span style={{ ...STYLES.sizeBadge, color: COLORS.text.muted, fontSize: isMobile ? 10 : 12, padding: isMobile ? "4px 8px" : STYLES.sizeBadge.padding }}>
                есть уточнения
              </span>
            )}
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
              background:
                "linear-gradient(90deg, rgba(244,195,77,0.4) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.08) 100%)",
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
                  color: highlightStatus ? COLORS.success : COLORS.text.primary,
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


