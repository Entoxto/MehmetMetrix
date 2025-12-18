"use client";

/**
 * Компонент группы поставок по году.
 * Отображает год с выпадающим списком поставок внутри.
 * При раскрытии поставки отображаются без отступа, не уменьшая ширину экрана.
 */

import { useMemo } from "react";
import type { MouseEvent } from "react";
import { COLORS, SPACING, CARD_TEMPLATES, STATUS_CHIP_STYLE, CARD_HOVER_EFFECTS, TYPOGRAPHY } from "@/constants/styles";
import { formatCurrency, getStatusLabel } from "@/lib/format";
import { isPaidStatus } from "@/lib/statusText";
import { createCardHoverHandlers } from "@/lib/utils";
import { BatchView } from "@/components/work/BatchView";
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
          {!isExpanded && (
            <span
              style={{
                ...responsiveTypography.caption,
                color: COLORS.text.secondary,
                margin: 0,
              }}
            >
              {shipments.length} {shipments.length === 1 ? "поставка" : shipments.length < 5 ? "поставки" : "поставок"}
            </span>
          )}
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
            shipments.map((shipment) => {
              const isExpandedCard = expandedCards.has(shipment.id);
              const titleWithNonBreakingSpace = shipment.title.replace(/\s+№/, "\u00A0№");
              // Подсветка статуса: если партия считается оплаченной по тексту статуса
              const highlightStatus = isPaidStatus(shipment.status);
              // Текст статуса — как есть из Excel (или преобразованный из старого кода)
              const statusLabelText = getStatusLabel(shipment.status);

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
                  aria-expanded={isExpandedCard}
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
                            transform: isExpandedCard ? "rotate(90deg)" : "rotate(0deg)",
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
                          aria-label={`Статус: ${statusLabelText}`}
                        >
                          <span style={{ textTransform: "uppercase" }}>{statusLabelText}</span>
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

                  {isExpandedCard && (
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
                            Итого по поставке
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
                            Сумма поставки
                          </p>
                          <p
                            style={{
                              ...responsiveTypography.amount,
                              margin: 0,
                              // Цвет определяется по статусу партии: оплачено → зелёный, иначе → акцентный
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
            })
          )}
        </div>
      )}
    </div>
  );
};

