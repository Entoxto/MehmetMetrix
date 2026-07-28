"use client";

/**
 * Карточка поставки внутри YearGroup.
 * Показывает заголовок, статус, дату/ETA и раскрывающуюся таблицу позиций.
 */

import { CaretRight } from "@phosphor-icons/react";
import type { CSSProperties, MouseEvent } from "react";
import { COLORS, SPACING, STATUS_CHIP_STYLE, MOTION, SURFACES } from "@/constants/styles";
import { formatCurrency, getStatusLabel } from "@/lib/format";
import { isPaidStatus } from "@/lib/statusText";
import { getShipmentModelCount, getShipmentUnitCount } from "@/lib/shipmentMetrics";
import {
  ShipmentDateInfo,
  ShipmentMetricsSummary,
} from "@/components/work/ShipmentCardSummary";
import { ShipmentContentsList } from "@/components/work/ShipmentContentsList";
import { ShipmentPositionsTable } from "@/components/work/ShipmentPositionsTable";
import { ShipmentTypeBadges } from "@/components/work/ShipmentTypeBadges";
import { ClickableCard, isNestedInteractiveTarget } from "@/components/ui/ClickableCard";
import type { Shipment } from "@/types/shipment";

interface ShipmentCardProps {
  shipment: Shipment;
  animationIndex?: number;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isDesktop: boolean;
  cardStyle: CSSProperties;
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

export const ShipmentCard = ({
  shipment,
  animationIndex = 0,
  isExpanded,
  onToggle,
  isMobile,
  isDesktop,
  cardStyle,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: ShipmentCardProps) => {
  const titleWithNonBreakingSpace = shipment.title.replace(/\s+№/, "\u00A0№");
  const highlightStatus = isPaidStatus(shipment.status);
  const statusLabelText = getStatusLabel(shipment.status);
  const modelsCount = getShipmentModelCount(shipment);
  const unitsCount = getShipmentUnitCount(shipment);
  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isNestedInteractiveTarget(event.target, event.currentTarget)) return;
    onToggle();
  };

  const cardContainerStyle: CSSProperties = {
    ...cardStyle,
    padding: isMobile ? SPACING.smPlus : cardStyle.padding,
    position: "relative",
    overflow: "hidden",
    background: isExpanded ? SURFACES.cardExpanded : SURFACES.card,
    border: isExpanded ? `1px solid ${COLORS.border.primary}` : cardStyle.border,
    boxShadow: isExpanded ? "0 18px 36px rgba(0, 0, 0, 0.26)" : cardStyle.boxShadow,
    animation: isExpanded ? "fadeIn 220ms ease-out" : MOTION.staggerEnter(animationIndex, isMobile ? 40 : 55),
    cursor: "pointer",
  };

  return (
    <div
      id={`batch-${shipment.id}`}
      className="mm-interactive-surface"
      data-hover="soft"
      onClick={handleCardClick}
      style={cardContainerStyle}
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

      <ClickableCard
        onPress={onToggle}
        hoverVariant="soft"
        aria-expanded={isExpanded}
        aria-label={`${shipment.title}, ${statusLabelText}`}
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1fr auto" : "1fr",
          gap: isDesktop ? SPACING.lg : SPACING.sm,
          alignItems: isDesktop ? "center" : "start",
          minHeight: isDesktop ? 42 : "auto",
          position: "relative",
          zIndex: 1,
          cursor: "pointer",
          borderRadius: isMobile ? 10 : 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: isMobile ? SPACING.sm : SPACING.md,
            minWidth: 0,
          }}
        >
          <CaretRight
            size={isMobile ? 16 : 20}
            weight="fill"
            style={{
              color: COLORS.primary,
              transition: MOTION.interactiveTransition,
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              flexShrink: 0,
              marginTop: isMobile ? 2 : 4,
            }}
            aria-hidden="true"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              columnGap: isMobile ? SPACING.sm : SPACING.md,
              rowGap: isMobile ? SPACING.xsPlus : SPACING.sm,
              minWidth: 0,
              flex: 1,
            }}
          >
            <h3
              style={{
                ...typography.h3,
                color: COLORS.text.primary,
                margin: 0,
                minWidth: 0,
                maxWidth: "100%",
                ...(isMobile
                  ? {
                      fontSize: 17,
                      lineHeight: 1.2,
                    }
                  : {
                      fontSize: 24,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }),
              }}
            >
              {titleWithNonBreakingSpace}
            </h3>
            <ShipmentTypeBadges shipment={shipment} isMobile={isMobile} />
          </div>
        </div>

        {isDesktop && (
          <ShipmentDateInfo
            shipment={shipment}
            isDesktop={isDesktop}
            isMobile={isMobile}
            typography={typography}
          />
        )}
      </ClickableCard>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING.xs,
          marginTop: isMobile ? SPACING.sm : SPACING.smPlus,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={STATUS_CHIP_STYLE(highlightStatus, isMobile)}
          role="status"
          aria-label={`Статус: ${statusLabelText}`}
        >
          <span style={{ textTransform: "uppercase" }}>{statusLabelText}</span>
        </div>
      </div>

      {!isExpanded && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "minmax(0, 1fr) minmax(300px, 0.72fr)"
              : "1fr",
            gap: isDesktop ? SPACING.xl : SPACING.smPlus,
            alignItems: "end",
            marginTop: isMobile ? SPACING.smPlus : SPACING.md,
            position: "relative",
            zIndex: 1,
          }}
        >
          <ShipmentContentsList shipment={shipment} isMobile={isMobile} />
          <ShipmentMetricsSummary
            modelsCount={modelsCount}
            unitsCount={unitsCount}
            totalAmount={shipment.totalAmount}
            isMobile={isMobile}
            typography={typography}
          />
        </div>
      )}

      {!isDesktop && (
        <ShipmentDateInfo
          shipment={shipment}
          isDesktop={isDesktop}
          isMobile={isMobile}
          typography={typography}
        />
      )}

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
          <ShipmentPositionsTable
            shipmentId={shipment.id}
            positions={shipment.positions}
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
