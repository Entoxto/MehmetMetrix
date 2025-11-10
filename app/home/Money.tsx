"use client";

/**
 * Экран финансов «Что по бабкам».
 * Суммирует партии, показывает детализацию и карточки с оплатами.
 * Управляет раскрытием блоков и эффектами наведения под разные брейкпоинты.
 */
import { COLORS, SPACING, CARD_HOVER_EFFECTS } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import { formatCurrency, createCardHoverHandlers } from "@/lib/utils";

interface MoneyProps {
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  shipment11Total: number;
  materialPrepayment: number;
  totalPayment: number;
}

export const Money = ({
  expandedCards,
  onToggleCard,
  shipment11Total,
  materialPrepayment,
  totalPayment,
}: MoneyProps) => {
  const { isMobile, breakpoint } = useBreakpoint();
  // Десктоп = >=1024px (laptop и desktop)
  const isDesktop = breakpoint === "laptop" || breakpoint === "desktop";

  // Единая типографика
  const TYPOGRAPHY = {
    h2: { fontSize: isMobile ? 24 : 40, fontWeight: 900, lineHeight: 1.2 },
    h3: { fontSize: isMobile ? 20 : 24, fontWeight: 800, lineHeight: 1.3 },
    body: { fontSize: 12, lineHeight: 1.5 },
    caption: { fontSize: isMobile ? 10 : 11, lineHeight: 1.4 },
    amount: { fontSize: isMobile ? 28 : 36, fontWeight: 900, lineHeight: 1.1 },
  };

  // Стили для легких и дорогих карточек
  const CARD_STYLE = {
    background: isMobile ? COLORS.background.card : "rgba(38,38,38,0.4)",
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: isMobile ? 16 : 24,
    boxShadow: isMobile
      ? "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)"
      : "0 8px 32px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(251,191,36,0.1)",
    backdropFilter: isMobile ? "none" : "blur(10px)",
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.md : SPACING.xl,
        paddingTop: isMobile ? SPACING.md : SPACING.lg,
        paddingBottom: isMobile ? SPACING.md : SPACING.lg,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.md : SPACING.xl * 2,
      }}
    >
      {/* Заголовок секции с легким свечением */}
      <div style={{ marginBottom: isMobile ? 8 : SPACING.md, textAlign: "center" }}>
        <h2
          style={{
            ...TYPOGRAPHY.h2,
            color: COLORS.primary,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textShadow: isMobile
              ? "none"
              : `0 0 20px rgba(251,191,36,0.3), 0 0 40px rgba(251,191,36,0.15), 0 0 60px rgba(251,191,36,0.1)`,
            letterSpacing: isMobile ? 0 : -1,
          }}
        >
          Надвигающаяся расплата <span style={{ fontSize: isMobile ? 20 : 36 }}>💸</span>
        </h2>
      </div>

      <div
        style={{
          display: isMobile ? "flex" : "grid",
          flexDirection: isMobile ? "column" : undefined,
          gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
          gap: isMobile ? SPACING.lg : SPACING.xl * 2,
          alignItems: "stretch",
        }}
      >
        {/* ЛЕВАЯ ЧАСТЬ - ОПЛАТЫ */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : SPACING.lg, width: "100%" }}>
          <div
            onClick={() => onToggleCard("total_payment")}
            style={{
              ...CARD_STYLE,
              padding: isMobile ? SPACING.md : SPACING.xl,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? SPACING.sm : SPACING.md,
            }}
            {...(isMobile
              ? {}
              : createCardHoverHandlers(CARD_HOVER_EFFECTS.money.hover, {
                  boxShadow: CARD_STYLE.boxShadow as string,
                  transform: "translateY(0)",
                }))}
          >
            {/* Заголовок и сумма на одной горизонтали */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: SPACING.md,
                marginBottom: isMobile ? 0 : SPACING.xs,
              }}
            >
              <p
                style={{
                  ...TYPOGRAPHY.caption,
                  color: COLORS.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  margin: 0,
                  fontSize: isMobile ? 10 : 11,
                }}
              >
                Всего к оплате
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
                {expandedCards.has("total_payment") && (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary, transition: "transform 0.3s ease" }}>
                    ▼
                  </span>
                )}
                {!expandedCards.has("total_payment") && (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary }}>▶</span>
                )}
              </div>
            </div>
            <p style={{ ...TYPOGRAPHY.amount, color: COLORS.error, letterSpacing: -1, margin: 0, fontSize: isMobile ? 28 : 36 }}>
              {formatCurrency(totalPayment)}
            </p>
            <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.muted, fontStyle: "italic", margin: 0, marginTop: isMobile ? 0 : SPACING.xs }}>
              По данным из партий и предоплат
            </p>
            {expandedCards.has("total_payment") && (
              <div
                style={{
                  marginTop: isMobile ? SPACING.md : SPACING.lg,
                  paddingTop: isMobile ? SPACING.md : SPACING.lg,
                  borderTop: `1px solid ${COLORS.border.default}`,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <p
                  style={{
                    ...TYPOGRAPHY.body,
                    color: COLORS.text.secondary,
                    marginBottom: isMobile ? SPACING.md : SPACING.lg,
                    marginTop: 0,
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                  }}
                >
                  Детализация:
                </p>
                {/* Таблица детализации с разделителями и hover-эффектом */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isDesktop ? "2.5fr 1fr" : "1.5fr 1fr",
                    gap: 0,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border.default}`,
                  }}
                >
                  {/* Строка 1 */}
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderBottom: `1px solid ${COLORS.border.default}`,
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
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
                      }}
                    >
                      Оплата за партию 9
                    </span>
                  </div>
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderBottom: `1px solid ${COLORS.border.default}`,
                      borderLeft: `1px solid ${COLORS.border.default}`,
                      textAlign: "right",
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
                    }}
                  >
                    <span
                      style={{
                        ...TYPOGRAPHY.body,
                        color: COLORS.error,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {formatCurrency(shipment11Total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
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
              padding: `0 ${SPACING.md}px`,
            }}
          >
            <div
              style={{
                width: 1,
                height: "100%",
                background: "linear-gradient(to bottom, transparent, rgba(251,191,36,0.2) 20%, rgba(251,191,36,0.2) 80%, transparent)",
              }}
            />
          </div>
        )}

        {/* Горизонтальный разделитель на мобильных */}
        {isMobile && (
          <div
            style={{
              width: "100%",
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(251,191,36,0.2) 20%, rgba(251,191,36,0.2) 80%, transparent)",
            }}
          />
        )}

        {/* ПРАВАЯ ЧАСТЬ - ДЕПОЗИТЫ */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : SPACING.lg, width: "100%" }}>
          <div
            onClick={() => onToggleCard("deposits")}
            style={{
              ...CARD_STYLE,
              padding: isMobile ? SPACING.md : SPACING.xl,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? SPACING.sm : SPACING.md,
            }}
            {...(isMobile
              ? {}
              : createCardHoverHandlers(CARD_HOVER_EFFECTS.money.hover, {
                  boxShadow: CARD_STYLE.boxShadow as string,
                  transform: "translateY(0)",
                }))}
          >
            {/* Заголовок и сумма на одной горизонтали */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: SPACING.md,
                marginBottom: isMobile ? 0 : SPACING.xs,
              }}
            >
              <p
                style={{
                  ...TYPOGRAPHY.caption,
                  color: COLORS.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  margin: 0,
                  fontSize: isMobile ? 10 : 11,
                }}
              >
                Депозитов внесено
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
                {expandedCards.has("deposits") && (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary, transition: "transform 0.3s ease" }}>
                    ▼
                  </span>
                )}
                {!expandedCards.has("deposits") && (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary }}>▶</span>
                )}
              </div>
            </div>
            <p style={{ ...TYPOGRAPHY.amount, color: COLORS.success, letterSpacing: -1, margin: 0, fontSize: isMobile ? 28 : 36 }}>
              {formatCurrency(17930)}
            </p>
            <p style={{ ...TYPOGRAPHY.body, color: COLORS.text.muted, fontStyle: "italic", margin: 0, marginTop: isMobile ? 0 : SPACING.xs }}>
              Депозиты и предоплаты
            </p>
            {expandedCards.has("deposits") && (
              <div
                style={{
                  marginTop: isMobile ? SPACING.md : SPACING.lg,
                  paddingTop: isMobile ? SPACING.md : SPACING.lg,
                  borderTop: `1px solid ${COLORS.border.default}`,
                  animation: "fadeIn 0.3s ease",
                }}
              >
                <p
                  style={{
                    ...TYPOGRAPHY.body,
                    color: COLORS.text.secondary,
                    marginBottom: isMobile ? SPACING.md : SPACING.lg,
                    marginTop: 0,
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                  }}
                >
                  Детализация:
                </p>
                {/* Таблица детализации с разделителями и hover-эффектом */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isDesktop ? "2.5fr 1fr" : "1.5fr 1fr",
                    gap: 0,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.border.default}`,
                  }}
                >
                  {/* Строка 1 */}
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderBottom: `1px solid ${COLORS.border.default}`,
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
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
                      }}
                    >
                      Предоплата hermes mouse ≈ 35 изделий
                    </span>
                  </div>
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderBottom: `1px solid ${COLORS.border.default}`,
                      borderLeft: `1px solid ${COLORS.border.default}`,
                      textAlign: "right",
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
                    }}
                  >
                    <span
                      style={{
                        ...TYPOGRAPHY.body,
                        color: COLORS.success,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {formatCurrency(2000)}
                    </span>
                  </div>
                  {/* Строка 2 - Предоплата на питона (перенесена из левой карточки) */}
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderBottom: `1px solid ${COLORS.border.default}`,
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
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
                      }}
                    >
                      Предоплата на коричневого питона
                      <br />
                      глянцевый ≈ 20 изделий
                      <br />
                      матовый ≈ 10 изделий
                    </span>
                  </div>
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderBottom: `1px solid ${COLORS.border.default}`,
                      borderLeft: `1px solid ${COLORS.border.default}`,
                      textAlign: "right",
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
                    }}
                  >
                    <span
                      style={{
                        ...TYPOGRAPHY.body,
                        color: COLORS.success,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {formatCurrency(materialPrepayment)}
                    </span>
                  </div>
                  {/* Строка 3 - Депозит подлежащий списанию */}
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
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
                      }}
                    >
                      Депозит подлежащий списанию при ближайшей оплате
                    </span>
                  </div>
                  <div
                    style={{
                      padding: isMobile ? SPACING.sm : SPACING.md,
                      borderLeft: `1px solid ${COLORS.border.default}`,
                      textAlign: "right",
                      background: "transparent",
                      transition: "background 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      minHeight: isMobile ? 40 : 48,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "rgba(251,191,36,0.05)";
                          }
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        const row = e.currentTarget.parentElement;
                        if (row) {
                          const children = Array.from(row.children);
                          const rowIndex = Math.floor(children.indexOf(e.currentTarget) / 2);
                          const startIdx = rowIndex * 2;
                          const endIdx = startIdx + 2;
                          for (let i = startIdx; i < endIdx && i < children.length; i++) {
                            (children[i] as HTMLElement).style.background = "transparent";
                          }
                        }
                      }
                    }}
                  >
                    <span
                      style={{
                        ...TYPOGRAPHY.body,
                        color: COLORS.success,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {formatCurrency(12830)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

