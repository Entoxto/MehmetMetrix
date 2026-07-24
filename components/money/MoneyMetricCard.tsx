"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  CARD_HOVER_EFFECTS,
  CARD_TEMPLATES,
  COLORS,
  MOTION,
  SPACING,
  STYLES,
} from "@/constants/styles";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { MoneyDetailsTable } from "@/components/money/MoneyDetailsTable";
import { formatCurrency } from "@/lib/format";
import { createCardHoverHandlers } from "@/lib/cardHoverHandlers";

interface MoneyDetailsConfig<TItem> {
  items: TItem[];
  emptyText: string;
  amountColor: string;
  getKey: (item: TItem) => string;
  renderLabel: (item: TItem) => ReactNode;
  getAmount: (item: TItem) => number;
}

interface MoneyMetricCardProps<TItem> {
  animationIndex: number;
  label: string;
  total: number;
  summary: string;
  amountColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isDesktop: boolean;
  bodyTypography: CSSProperties;
  amountTypography: CSSProperties;
  details: MoneyDetailsConfig<TItem>;
}

export const MoneyMetricCard = <TItem,>({
  animationIndex,
  label,
  total,
  summary,
  amountColor,
  isExpanded,
  onToggle,
  isMobile,
  isDesktop,
  bodyTypography,
  amountTypography,
  details,
}: MoneyMetricCardProps<TItem>) => {
  const templateStyle = CARD_TEMPLATES.metricCard(isMobile);
  const cardStyle = {
    ...templateStyle,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: 20,
    background: isMobile
      ? "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(18,18,21,0.98) 100%)"
      : templateStyle.background,
    boxShadow: isMobile ? "0 14px 30px rgba(0, 0, 0, 0.22)" : templateStyle.boxShadow,
    transition: "all 0.25s ease",
  } as const;

  return (
    <ClickableCard
      onPress={onToggle}
      aria-expanded={isExpanded}
      aria-label={label}
      style={{
        ...cardStyle,
        padding: isMobile ? SPACING.smPlus : SPACING.xl,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.xsPlus : SPACING.md,
        animation: MOTION.staggerEnter(animationIndex, isMobile ? 90 : 120),
      }}
      {...(isMobile
        ? {}
        : createCardHoverHandlers(CARD_HOVER_EFFECTS.money.hover, {
            boxShadow: cardStyle.boxShadow,
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
          <span
            aria-hidden="true"
            style={{
              fontSize: 14,
              color: COLORS.text.secondary,
              display: "inline-block",
              transition: "transform 0.3s ease",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              lineHeight: 1,
            }}
          >
            ▶
          </span>
        </div>
      </div>
      <p
        style={{
          ...amountTypography,
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
      <MoneyDetailsTable
        isExpanded={isExpanded}
        items={details.items}
        emptyText={details.emptyText}
        amountColor={details.amountColor}
        getKey={details.getKey}
        renderLabel={details.renderLabel}
        getAmount={details.getAmount}
        isMobile={isMobile}
        isDesktop={isDesktop}
        bodyTypography={bodyTypography}
      />
    </ClickableCard>
  );
};
