"use client";

/**
 * Экран финансов «Что по бабкам».
 * Суммирует партии, показывает детализацию и карточки с оплатами.
 * Управляет раскрытием блоков и эффектами наведения под разные брейкпоинты.
 */
import { Fragment, type MouseEvent, type CSSProperties } from "react";
import Link from "next/link";
import { COLORS, SPACING, CARD_HOVER_EFFECTS, TYPOGRAPHY, STYLES, CARD_TEMPLATES } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatCurrency } from "@/lib/format";
import { createCardHoverHandlers } from "@/lib/utils";

interface MoneyStatusItem {
  id: string;
  title: string;
  amount: number;
}

interface MoneyDepositItem {
  id: string;
  lines: string[];
  amount: number;
}

interface MoneyProps {
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  pending: {
    total: number;
    items: MoneyStatusItem[];
  };
  deposits: {
    total: number;
    items: MoneyDepositItem[];
  };
}

export const Money = ({
  expandedCards,
  onToggleCard,
  pending,
  deposits,
}: MoneyProps) => {
  const { isMobile, isWide: isDesktop } = useBreakpoint();

  const responsiveTypography = {
    h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 24 : 32 },
    body: { ...TYPOGRAPHY.body, fontSize: isMobile ? 12 : 14 },
    caption: { ...TYPOGRAPHY.caption, fontSize: isMobile ? 10 : 11 },
    amount: { ...TYPOGRAPHY.amount, fontSize: isMobile ? 28 : 36 },
  } as const;

  const CARD_STYLE = {
    ...CARD_TEMPLATES.metricCard(isMobile),
    border: `1px solid ${COLORS.border.default}`,
    transition: "all 0.25s ease",
  } as const;

  const toggleRowHighlight = (element: HTMLDivElement, active: boolean) => {
    const grid = element.parentElement;
    if (!grid) return;
    const cells = Array.from(grid.children) as HTMLElement[];
    const index = cells.indexOf(element);
    if (index === -1) return;
    const rowIndex = Math.floor(index / 2);
    const start = rowIndex * 2;
    for (let i = start; i < start + 2 && i < cells.length; i++) {
      cells[i].style.background = active ? COLORS.background.soft : "transparent";
    }
  };

  const getHoverHandlers = () =>
    isMobile
      ? {}
      : {
          onMouseEnter: (event: MouseEvent<HTMLDivElement>) =>
            toggleRowHighlight(event.currentTarget, true),
          onMouseLeave: (event: MouseEvent<HTMLDivElement>) =>
            toggleRowHighlight(event.currentTarget, false),
        };

  const detailContainerStyle = {
    marginTop: isMobile ? SPACING.md : SPACING.lg,
    paddingTop: isMobile ? SPACING.md : SPACING.lg,
    borderTop: `1px solid ${COLORS.border.default}`,
    animation: "fadeIn 0.3s ease",
  } as const;

  const detailGridStyle = {
    display: "grid",
    gridTemplateColumns: isDesktop ? "2.5fr 1fr" : "1.5fr 1fr",
    gap: 0,
    borderRadius: 16,
    overflow: "hidden",
    border: `1px solid ${COLORS.border.default}`,
    background: COLORS.background.soft,
  } as const;

  const getCellStyle = (isLast: boolean, alignRight = false): CSSProperties => ({
    padding: isMobile ? SPACING.sm : SPACING.md,
    borderBottom: isLast ? undefined : `1px solid ${COLORS.border.default}`,
    borderLeft: alignRight ? `1px solid ${COLORS.border.default}` : undefined,
    textAlign: alignRight ? "right" : "left",
    background: "transparent",
    transition: "background 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: alignRight ? "flex-end" : "flex-start",
    minHeight: isMobile ? 40 : 48,
  });

  const renderPendingDetails = () => {
    if (!expandedCards.has("total_payment")) {
      return null;
    }

    if (pending.items.length === 0) {
      return (
        <div style={detailContainerStyle}>
          <p
            style={{
              ...responsiveTypography.body,
              color: COLORS.text.secondary,
              margin: 0,
            }}
          >
            Все партии оплачены
          </p>
        </div>
      );
    }

    const hoverHandlers = getHoverHandlers();

    return (
      <div style={detailContainerStyle}>
        <p
          style={{
            ...responsiveTypography.body,
            color: COLORS.text.secondary,
            marginBottom: isMobile ? SPACING.md : SPACING.lg,
            marginTop: 0,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
          }}
        >
          Детализация:
        </p>
        <div style={detailGridStyle}>
          {pending.items.map((item, index) => {
            const isLast = index === pending.items.length - 1;
            return (
              <Fragment key={item.id}>
                <div style={getCellStyle(isLast)} {...hoverHandlers}>
                  <Link
                    href={`/work?batch=${item.id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      ...responsiveTypography.body,
                      color: COLORS.text.primary,
                      margin: 0,
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textUnderlineOffset: 2,
                    }}
                  >
                    {item.title}
                  </Link>
                </div>
                <div style={getCellStyle(isLast, true)} {...hoverHandlers}>
                  <span
                    style={{
                      ...responsiveTypography.body,
                      color: COLORS.error,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDepositDetails = () => {
    if (!expandedCards.has("deposits")) {
      return null;
    }

    if (deposits.items.length === 0) {
      return (
        <div style={detailContainerStyle}>
          <p
          style={{
            ...responsiveTypography.body,
            color: COLORS.text.secondary,
            margin: 0,
          }}
          >
            Нет активных депозитов
          </p>
        </div>
      );
    }

    const hoverHandlers = getHoverHandlers();

    return (
      <div style={detailContainerStyle}>
        <p
          style={{
            ...responsiveTypography.body,
            color: COLORS.text.secondary,
            marginBottom: isMobile ? SPACING.md : SPACING.lg,
            marginTop: 0,
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
          }}
        >
          Детализация:
        </p>
        <div style={detailGridStyle}>
          {deposits.items.map((item, index) => {
            const isLast = index === deposits.items.length - 1;
            return (
              <Fragment key={item.id}>
                <div style={getCellStyle(isLast)} {...hoverHandlers}>
                  <span
                    style={{
                      ...responsiveTypography.body,
                      color: COLORS.text.primary,
                      margin: 0,
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {item.lines.map((line, lineIndex) => (
                      <Fragment key={lineIndex}>
                        {line}
                        {lineIndex < item.lines.length - 1 && <br />}
                      </Fragment>
                    ))}
                  </span>
                </div>
                <div style={getCellStyle(isLast, true)} {...hoverHandlers}>
                  <span
                    style={{
                      ...responsiveTypography.body,
                      color: COLORS.success,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    );
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
      <div style={CARD_TEMPLATES.introCard(isMobile)}>
        <p style={{ ...STYLES.sectionEyebrow, margin: 0 }}>Финансы</p>
        <h2
          style={{
            ...responsiveTypography.h2,
            color: COLORS.text.primary,
            margin: 0,
          }}
        >
          Надвигающаяся расплата
        </h2>
        <p style={{ ...STYLES.sectionDescription, margin: 0 }}>
          Слева то, что ещё нужно оплатить, справа уже внесённые депозиты и предоплаты.
        </p>
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
                  boxShadow: CARD_STYLE.boxShadow,
                  transform: "translateY(0)",
                }))}
          >
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
                  ...STYLES.metricLabel,
                  margin: 0,
                }}
              >
                Всего к оплате
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
                {expandedCards.has("total_payment") ? (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary, transition: "transform 0.3s ease" }}>▼</span>
                ) : (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary }}>▶</span>
                )}
              </div>
            </div>
            <p
              style={{
                ...responsiveTypography.amount,
                color: COLORS.error,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              {formatCurrency(pending.total)}
            </p>
            <p
              style={{
                ...STYLES.metricHint,
                margin: 0,
                marginTop: isMobile ? 0 : SPACING.xs,
              }}
            >
              По данным из партий и предоплат
            </p>
            {renderPendingDetails()}
          </div>
        </div>

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
                background:
                  "linear-gradient(to bottom, transparent, rgba(251,191,36,0.2) 20%, rgba(251,191,36,0.2) 80%, transparent)",
              }}
            />
          </div>
        )}

        {isMobile && (
          <div
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(251,191,36,0.2) 20%, rgba(251,191,36,0.2) 80%, transparent)",
            }}
          />
        )}

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
                  boxShadow: CARD_STYLE.boxShadow,
                  transform: "translateY(0)",
                }))}
          >
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
                  ...STYLES.metricLabel,
                  margin: 0,
                }}
              >
                Депозитов внесено
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
                {expandedCards.has("deposits") ? (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary, transition: "transform 0.3s ease" }}>▼</span>
                ) : (
                  <span style={{ fontSize: 14, color: COLORS.text.secondary }}>▶</span>
                )}
              </div>
            </div>
            <p
              style={{
                ...responsiveTypography.amount,
                color: COLORS.success,
                letterSpacing: -1,
                margin: 0,
              }}
            >
              {formatCurrency(deposits.total)}
            </p>
            <p
              style={{
                ...STYLES.metricHint,
                margin: 0,
                marginTop: isMobile ? 0 : SPACING.xs,
              }}
            >
              Депозиты и предоплаты
            </p>
            {renderDepositDetails()}
          </div>
        </div>
      </div>
    </div>
  );
};
