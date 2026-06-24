"use client";

import { Fragment, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { COLORS, SPACING } from "@/constants/styles";
import { formatCurrency } from "@/lib/format";

interface MoneyDetailsTableProps<TItem> {
  isExpanded: boolean;
  items: TItem[];
  emptyText: string;
  amountColor: string;
  getKey: (item: TItem) => string;
  renderLabel: (item: TItem) => ReactNode;
  getAmount: (item: TItem) => number;
  isMobile: boolean;
  isDesktop: boolean;
  bodyTypography: CSSProperties;
}

export const MoneyDetailsTable = <TItem,>({
  isExpanded,
  items,
  emptyText,
  amountColor,
  getKey,
  renderLabel,
  getAmount,
  isMobile,
  isDesktop,
  bodyTypography,
}: MoneyDetailsTableProps<TItem>) => {
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

  const rowHoverHandlers = isMobile
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

  if (!isExpanded) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div style={detailContainerStyle}>
        <p
          style={{
            ...bodyTypography,
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
      <p
        style={{
          ...bodyTypography,
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
                    ...bodyTypography,
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
