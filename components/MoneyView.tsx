"use client";

import React from "react";
import { Card } from "./Card";
import { COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";

interface MoneyViewProps {
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  shipment9Total: number;
  shipment8Total: number;
  materialPrepayment: number;
  totalPayment: number;
}

// Форматирование денег с тонким пробелом: $45 970
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("ru-RU").replace(/\s/g, "\u2009")}`;
};

export const MoneyView: React.FC<MoneyViewProps> = ({
  expandedCards,
  onToggleCard,
  shipment9Total,
  shipment8Total,
  materialPrepayment,
  totalPayment,
}) => {
  const { isMobile, breakpoint } = useBreakpoint();
  // Десктоп = >=1024px (laptop и desktop)
  const isDesktop = breakpoint === "laptop" || breakpoint === "desktop";

  // Единая типографика
  const TYPOGRAPHY = {
    h2: { fontSize: isMobile ? 24 : 32, fontWeight: 900, lineHeight: 1.2 },
    h3: { fontSize: isMobile ? 20 : 24, fontWeight: 800, lineHeight: 1.3 },
    body: { fontSize: 12, lineHeight: 1.5 },
    caption: { fontSize: 10, lineHeight: 1.4 },
    amount: { fontSize: isMobile ? 28 : 32, fontWeight: 900, lineHeight: 1.1 },
  };

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
      <div style={{ marginBottom: 8, textAlign: "center" }}>
        <h2
          style={{
            ...TYPOGRAPHY.h2,
            color: COLORS.primary,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Надвигающаяся расплата <span style={{ fontSize: isMobile ? 20 : 28 }}>💸</span>
        </h2>
      </div>

      <div
        style={{
          display: isMobile ? "flex" : "grid",
          flexDirection: isMobile ? "column" : undefined,
          gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
          gap: 0,
          alignItems: "center",
        }}
      >
        {/* ЛЕВАЯ ЧАСТЬ - ОПЛАТЫ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingRight: isMobile ? 0 : 32, paddingLeft: 0, width: "100%" }}>
          <Card
            expandable
            cardId="total_payment"
            expanded={expandedCards.has("total_payment")}
            onToggle={() => onToggleCard("total_payment")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p
                  style={{
                    ...TYPOGRAPHY.caption,
                    color: COLORS.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: 0,
                  }}
                >
                  Всего к оплате
                </p>
                {expandedCards.has("total_payment") && (
                  <span style={{ fontSize: 12, transition: "transform 0.3s ease" }}>▼</span>
                )}
                {!expandedCards.has("total_payment") && <span style={{ fontSize: 12 }}>▶</span>}
              </div>
              <p style={{ ...TYPOGRAPHY.amount, color: COLORS.error, letterSpacing: -1, margin: 0 }}>
                {formatCurrency(totalPayment)}
              </p>
              <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.muted, fontStyle: "italic", margin: 0 }}>
                По данным из партий и предоплат
              </p>
              {expandedCards.has("total_payment") && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${COLORS.border.default}`,
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.secondary, marginBottom: 12, marginTop: 0 }}>
                    Детализация:
                  </p>
                  {/* 2-колоночная сетка на десктопе, 1 колонка на мобиле */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                      gap: isDesktop ? SPACING.md : 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: SPACING.sm,
                      }}
                    >
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.text.primary,
                          margin: 0,
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        Оплата за партию 9
                      </span>
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.error,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(shipment9Total)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: SPACING.sm,
                      }}
                    >
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.text.primary,
                          margin: 0,
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        Оплата за партию 8
                      </span>
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.error,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(shipment8Total)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: SPACING.sm,
                        gridColumn: isDesktop ? "1 / -1" : "1",
                      }}
                    >
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.text.primary,
                          margin: 0,
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          flex: 1,
                          minWidth: 0,
                          maxWidth: isDesktop ? "none" : "100%",
                        }}
                      >
                        Предоплата за материал коричневая матовая и коричневая глянцевая кожа питона
                      </span>
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.error,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(materialPrepayment)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* РАЗДЕЛИТЕЛЬ */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 200,
              padding: "0 16px",
            }}
          >
            <div
              style={{
                width: 2,
                height: "100%",
                background: "linear-gradient(to bottom, transparent, rgba(251,191,36,0.3) 10%, rgba(251,191,36,0.3) 90%, transparent)",
              }}
            />
          </div>
        )}

        {/* Горизонтальный разделитель на мобильных */}
        {isMobile && (
          <div
            style={{
              width: "100%",
              height: 2,
              background: "linear-gradient(to right, transparent, rgba(251,191,36,0.3) 10%, rgba(251,191,36,0.3) 90%, transparent)",
              margin: `${SPACING.lg}px 0`,
            }}
          />
        )}

        {/* ПРАВАЯ ЧАСТЬ - ДЕПОЗИТЫ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: isMobile ? 0 : 32, paddingRight: 0, width: "100%" }}>
          <Card
            expandable
            cardId="deposits"
            expanded={expandedCards.has("deposits")}
            onToggle={() => onToggleCard("deposits")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p
                  style={{
                    ...TYPOGRAPHY.caption,
                    color: COLORS.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    margin: 0,
                  }}
                >
                  Депозитов внесено
                </p>
                {expandedCards.has("deposits") && (
                  <span style={{ fontSize: 12, transition: "transform 0.3s ease" }}>▼</span>
                )}
                {!expandedCards.has("deposits") && <span style={{ fontSize: 12 }}>▶</span>}
              </div>
              <p style={{ ...TYPOGRAPHY.amount, color: COLORS.success, letterSpacing: -1, margin: 0 }}>
                {formatCurrency(15840)}
              </p>
              <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.muted, fontStyle: "italic", margin: 0 }}>
                Депозиты и предоплаты
              </p>
              {expandedCards.has("deposits") && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${COLORS.border.default}`,
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.secondary, marginBottom: 12, marginTop: 0 }}>
                    Детализация:
                  </p>
                  {/* 2-колоночная сетка на десктопе, 1 колонка на мобиле */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                      gap: isDesktop ? SPACING.md : 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: SPACING.sm,
                      }}
                    >
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.text.primary,
                          margin: 0,
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        Предоплата hermes mouse
                      </span>
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.success,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(2000)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: SPACING.sm,
                      }}
                    >
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.text.primary,
                          margin: 0,
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        Депозит подлежащий списанию при ближайшей оплате
                      </span>
                      <span
                        style={{
                          ...TYPOGRAPHY.body,
                          color: COLORS.success,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(13840)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

