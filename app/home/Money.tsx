"use client";

/**
 * Экран финансов «Что по бабкам».
 * Суммирует партии, показывает детализацию и карточки с оплатами.
 * Управляет раскрытием блоков и эффектами наведения под разные брейкпоинты.
 */
import { Fragment, type MouseEvent, type CSSProperties, type ReactNode } from "react";
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

interface DetailTableConfig<TItem> {
  cardId: string;
  items: TItem[];
  emptyText: string;
  amountColor: string;
  getKey: (item: TItem) => string;
  renderLabel: (item: TItem) => ReactNode;
  getAmount: (item: TItem) => number;
}

interface MetricCardConfig<TItem> {
  cardId: string;
  label: string;
  total: number;
  summary: string;
  amountColor: string;
  details: DetailTableConfig<TItem>;
}

export const Money = ({
  expandedCards,
  onToggleCard,
  pending,
  deposits,
}: MoneyProps) => {
  const { isMobile, isWide: isDesktop } = useBreakpoint();
  const introDescription = isMobile
    ? "Сколько ещё нужно оплатить и сколько уже внесено депозитами и предоплатами."
    : "Слева то, что ещё нужно оплатить, справа уже внесённые депозиты и предоплаты.";
  const introCopyStyle = STYLES.pageIntroCopy(isMobile);

  const responsiveTypography = {
    h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 20 : 28 },
    body: { ...TYPOGRAPHY.body, fontSize: isMobile ? 12 : 14 },
    caption: { ...TYPOGRAPHY.caption, fontSize: isMobile ? 10 : 11 },
    amount: { ...TYPOGRAPHY.amount, fontSize: isMobile ? 30 : 36 },
  } as const;

  const CARD_STYLE = {
    ...CARD_TEMPLATES.metricCard(isMobile),
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: isMobile ? 20 : 20,
    background: isMobile
      ? "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(18,18,21,0.98) 100%)"
      : CARD_TEMPLATES.metricCard(isMobile).background,
    boxShadow: isMobile ? "0 14px 30px rgba(0, 0, 0, 0.22)" : CARD_TEMPLATES.metricCard(isMobile).boxShadow,
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
    marginTop: isMobile ? SPACING.smPlus : SPACING.lg,
    paddingTop: isMobile ? SPACING.smPlus : SPACING.lg,
    borderTop: `1px solid ${COLORS.border.default}`,
    animation: "fadeIn 0.3s ease",
  } as const;

  const detailGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "minmax(0, 1fr) auto" : isDesktop ? "2.5fr 1fr" : "1.5fr 1fr",
    gap: 0,
    borderRadius: isMobile ? 14 : 16,
    overflow: "hidden",
    border: `1px solid ${COLORS.border.default}`,
    background: isMobile ? "rgba(13,13,16,0.98)" : COLORS.background.soft,
  } as const;

  const getCellStyle = (isLast: boolean, alignRight = false): CSSProperties => ({
    padding: isMobile ? "10px 10px" : SPACING.md,
    borderBottom: isLast ? undefined : `1px solid ${COLORS.border.default}`,
    borderLeft: alignRight ? `1px solid ${COLORS.border.default}` : undefined,
    textAlign: alignRight ? "right" : "left",
    background: isMobile ? "rgba(13,13,16,0.98)" : "transparent",
    transition: "background 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: alignRight ? "flex-end" : "flex-start",
    minHeight: isMobile ? 44 : 48,
  });

  const rowHoverHandlers = getHoverHandlers();

  const detailHeadingStyle = {
    ...responsiveTypography.body,
    color: COLORS.text.secondary,
    marginBottom: isMobile ? SPACING.md : SPACING.lg,
    marginTop: 0,
    fontSize: isMobile ? 12 : 13,
    fontWeight: 600,
  } as const;

  const renderDetailsTable = <TItem,>({
    cardId,
    items,
    emptyText,
    amountColor,
    getKey,
    renderLabel,
    getAmount,
  }: DetailTableConfig<TItem>) => {
    if (!expandedCards.has(cardId)) {
      return null;
    }

    if (items.length === 0) {
      return (
        <div style={detailContainerStyle}>
          <p
            style={{
              ...responsiveTypography.body,
              color: COLORS.text.secondary,
              margin: 0,
            }}
          >
            {emptyText}
          </p>
        </div>
      );
    }

    return (
      <div style={detailContainerStyle}>
        <p style={detailHeadingStyle}>Детализация:</p>
        <div style={detailGridStyle}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <Fragment key={getKey(item)}>
                <div style={getCellStyle(isLast)} {...rowHoverHandlers}>
                  {renderLabel(item)}
                </div>
                <div style={getCellStyle(isLast, true)} {...rowHoverHandlers}>
                  <span
                    style={{
                      ...responsiveTypography.body,
                      color: amountColor,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(getAmount(item))}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMetricCard = <TItem,>({
    cardId,
    label,
    total,
    summary,
    amountColor,
    details,
  }: MetricCardConfig<TItem>) => (
    <div
      onClick={() => onToggleCard(cardId)}
      style={{
        ...CARD_STYLE,
        padding: isMobile ? SPACING.smPlus : SPACING.xl,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.xsPlus : SPACING.md,
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
          {label}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
          {expandedCards.has(cardId) ? (
            <span style={{ fontSize: 14, color: COLORS.text.secondary, transition: "transform 0.3s ease" }}>▼</span>
          ) : (
            <span style={{ fontSize: 14, color: COLORS.text.secondary }}>▶</span>
          )}
        </div>
      </div>
      <p
        style={{
          ...responsiveTypography.amount,
          color: amountColor,
          letterSpacing: -1,
          margin: 0,
        }}
      >
        {formatCurrency(total)}
      </p>
      <p
        style={{
          ...STYLES.metricHint,
          margin: 0,
          marginTop: isMobile ? 0 : SPACING.xs,
        }}
      >
        {summary}
      </p>
      {renderDetailsTable(details)}
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.smPlus : SPACING.xl,
        paddingTop: isMobile ? SPACING.smPlus : SPACING.lg,
        paddingBottom: isMobile ? SPACING.smPlus : SPACING.lg,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.smPlus : SPACING.xl * 2,
      }}
    >
      <div style={CARD_TEMPLATES.pageIntro(isMobile)}>
        <h2
          style={{
            ...responsiveTypography.h2,
            color: COLORS.text.primary,
            margin: 0,
          }}
        >
          Надвигающаяся расплата
        </h2>
        <p style={introCopyStyle}>
          {introDescription}
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
          {renderMetricCard({
            cardId: "total_payment",
            label: "Всего к оплате",
            total: pending.total,
            summary: "По данным из партий и предоплат",
            amountColor: COLORS.error,
            details: {
              cardId: "total_payment",
              items: pending.items,
              emptyText: "Все партии оплачены",
              amountColor: COLORS.error,
              getKey: (item) => item.id,
              getAmount: (item) => item.amount,
              renderLabel: (item) => (
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
              ),
            },
          })}
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
          {renderMetricCard({
            cardId: "deposits",
            label: "Депозитов внесено",
            total: deposits.total,
            summary: "Депозиты и предоплаты",
            amountColor: COLORS.success,
            details: {
              cardId: "deposits",
              items: deposits.items,
              emptyText: "Нет активных депозитов",
              amountColor: COLORS.success,
              getKey: (item) => item.id,
              getAmount: (item) => item.amount,
              renderLabel: (item) => (
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
              ),
            },
          })}
        </div>
      </div>
    </div>
  );
};


