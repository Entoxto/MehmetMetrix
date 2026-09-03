"use client";

import type { CSSProperties, ReactNode } from "react";
import { COLORS, MOTION, SPACING } from "@/constants/styles";

interface MoneyDetailsTableProps<TItem> {
  isExpanded: boolean;
  items: TItem[];
  emptyText: string;
  amountColor: string;
  getKey: (item: TItem) => string;
  renderLabel: (item: TItem) => ReactNode;
  renderAmount: (item: TItem) => ReactNode;
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
  renderAmount,
  isMobile,
  isDesktop,
  bodyTypography,
}: MoneyDetailsTableProps<TItem>) => {
  const detailContainerStyle = {
    marginTop: isMobile ? SPACING.smPlus : SPACING.lg,
    paddingTop: isMobile ? SPACING.smPlus : SPACING.lg,
    borderTop: `1px solid ${COLORS.border.default}`,
    animation: MOTION.softEnter,
  } as const;

  const detailGridStyle = {
    borderRadius: isMobile ? 14 : 16,
    overflow: "hidden",
    border: `1px solid ${COLORS.border.default}`,
    background: isMobile ? "rgba(13,13,16,0.98)" : COLORS.background.soft,
  } as const;

  const rowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "minmax(0, 1fr) auto"
      : isDesktop
        ? "2.5fr 1fr"
        : "1.5fr 1fr",
    transition: MOTION.interactiveTransition,
  };

  const getCellStyle = (isLast: boolean, alignRight = false): CSSProperties => ({
    padding: isMobile ? "10px 10px" : SPACING.md,
    borderBottom: isLast ? undefined : `1px solid ${COLORS.border.default}`,
    borderLeft: alignRight ? `1px solid ${COLORS.border.default}` : undefined,
    textAlign: alignRight ? "right" : "left",
    background: "transparent",
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
            <div
              className="mm-money-details-row"
              key={getKey(item)}
              style={rowStyle}
            >
              <div style={getCellStyle(isLast)}>
                {renderLabel(item)}
              </div>
              <div style={getCellStyle(isLast, true)}>
                <span
                  style={{
                    ...bodyTypography,
                    color: amountColor,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  {renderAmount(item)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
