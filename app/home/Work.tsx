"use client";

/**
 * Экран «Работа».
 * Показывает партии, группирует позиции по статусам и помогает следить за пошивом.
 * Использует BatchView и PositionRow, раскрывающиеся карточки и hover-эффекты.
 * Адаптируется под мобильный и десктоп.
 */
import type { MouseEvent } from "react";
import { COLORS, SPACING, CARD_TEMPLATES, STATUS_CHIP_STYLE, CARD_HOVER_EFFECTS, TYPOGRAPHY } from "@/constants/styles";
import { formatCurrency } from "@/lib/format";
import { createCardHoverHandlers } from "@/lib/utils";
import { BatchView } from "@/components/work/BatchView";
import type { ShipmentWithItems } from "@/lib/shipments";

interface WorkProps {
  isMobile: boolean;
  isDesktop: boolean;
  shipments: ShipmentWithItems[];
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
}

export const Work = ({
  isMobile,
  isDesktop,
  shipments,
  expandedCards,
  onToggleCard,
}: WorkProps) => {
  const responsiveTypography = {
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
  };
  const detailValueFontSize = isMobile ? 14 : 15;

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

  const cardStyle = CARD_TEMPLATES.container(isMobile);
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.work.hover,
    CARD_HOVER_EFFECTS.work.default
  );

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.md : SPACING.xl,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.md : SPACING.lg,
      }}
    >
      <div>
        <h2
          style={{
            ...responsiveTypography.h2,
            color: COLORS.primary,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Что сейчас в работе <span style={{ fontSize: isMobile ? 20 : 28 }}>🧵</span>
        </h2>
        <p
          style={{
            color: COLORS.text.secondary,
            fontSize: isMobile ? 12 : 13,
            fontStyle: "italic",
          }}
        >
          Актуальные партии, статусы и суммы по поставкам.
        </p>
      </div>

      {shipments.map((shipment) => {
        const isExpanded = expandedCards.has(shipment.id);
        const titleWithNonBreakingSpace = shipment.title.replace(/\s+№/, "\u00A0№");
        const highlightStatus = shipment.id === "shipment-10";

        return (
          <div
            key={shipment.id}
            role="button"
            tabIndex={0}
            onClick={() => onToggleCard(shipment.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleCard(shipment.id);
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
            aria-label={`${shipment.title}, ${shipment.status.label}`}
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
                      ...responsiveTypography.h3,
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
                    aria-label={`Статус: ${shipment.status.label}`}
                  >
                    <span
                      style={{
                        fontSize: isMobile ? "clamp(12px, 2vw, 13px)" : "clamp(13px, 0.9vw, 14px)",
                        lineHeight: 1,
                      }}
                      aria-hidden="true"
                    >
                      {shipment.status.icon}
                    </span>
                    <span style={{ textTransform: "uppercase" }}>{shipment.status.label}</span>
                  </div>
                </div>
              </div>

              {isDesktop && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 4,
                    minHeight: 60,
                    paddingRight: SPACING.md,
                  }}
                >
                  {shipment.receivedDate ? (
                    <>
                      <p
                        style={{
                          ...responsiveTypography.caption,
                          color: "rgba(212, 212, 212, 0.6)",
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                          textAlign: "right",
                        }}
                      >
                        Дата получения
                      </p>
                      <p
                        style={{
                          fontSize: detailValueFontSize,
                          lineHeight: 1.4,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                          textAlign: "right",
                        }}
                        aria-label={`Дата получения: ${shipment.receivedDate}`}
                      >
                        {shipment.receivedDate}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          ...responsiveTypography.caption,
                          color: "rgba(212, 212, 212, 0.6)",
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                          textAlign: "right",
                        }}
                      >
                        План доставки
                      </p>
                      <p
                        style={{
                          fontSize: detailValueFontSize,
                          lineHeight: 1.4,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                          textAlign: "right",
                        }}
                        aria-label={`План доставки: ${shipment.eta}`}
                      >
                        {shipment.eta}
                      </p>
                    </>
                  )}
                </div>
              )}

              {!isDesktop && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: SPACING.xs,
                    marginTop: SPACING.xs,
                    paddingTop: SPACING.sm,
                    borderTop: `1px solid ${COLORS.border.default}`,
                  }}
                >
                  {shipment.receivedDate ? (
                    <>
                      <p
                        style={{
                          ...responsiveTypography.caption,
                          color: COLORS.text.muted,
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        Дата получения
                      </p>
                      <p
                        style={{
                          fontSize: detailValueFontSize,
                          lineHeight: 1.4,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                        }}
                        aria-label={`Дата получения: ${shipment.receivedDate}`}
                      >
                        {shipment.receivedDate}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          ...responsiveTypography.caption,
                          color: COLORS.text.muted,
                          textTransform: "uppercase",
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        План доставки
                      </p>
                      <p
                        style={{
                          fontSize: detailValueFontSize,
                          lineHeight: 1.4,
                          color: COLORS.text.primary,
                          fontWeight: 600,
                          margin: 0,
                        }}
                        aria-label={`План доставки: ${shipment.eta}`}
                      >
                        {shipment.eta}
                      </p>
                    </>
                  )}
                </div>
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
                  onRowHover={handleShipmentRowHover}
                  cellBaseBackground={shipmentCellBaseBackground}
                  cellBaseBorder={shipmentCellBaseBorder}
                  typography={responsiveTypography}
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
                    <p style={{ ...responsiveTypography.body, margin: 0, color: COLORS.text.secondary }}>
                      Итого по партии
                    </p>
                    {shipment.hasPriceGaps && (
                      <p
                        style={{
                          ...responsiveTypography.caption,
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
                        ...responsiveTypography.caption,
                        margin: 0,
                        color: COLORS.text.secondary,
                        textTransform: "uppercase",
                      }}
                    >
                      {shipment.receivedDate ? "Сумма партии" : "Сумма к оплате"}
                    </p>
                    <p
                      style={{
                        ...responsiveTypography.amount,
                        margin: 0,
                        color: shipment.receivedDate || shipment.id === "shipment-10"
                          ? COLORS.success
                          : COLORS.primary,
                      }}
                    >
                      {formatCurrency(shipment.totalAmount)}
                    </p>
                  </div>
                </div>

                {shipment.hasPriceGaps && (
                  <p
                    style={{
                      ...responsiveTypography.body,
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
      })}
    </div>
  );
};

