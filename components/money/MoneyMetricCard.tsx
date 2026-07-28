"use client";

import { CaretRight } from "@phosphor-icons/react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import {
  CARD_TEMPLATES,
  COLORS,
  MOTION,
  SPACING,
  STYLES,
  SURFACES,
} from "@/constants/styles";
import { ClickableCard, isNestedInteractiveTarget } from "@/components/ui/ClickableCard";
import { MoneyDetailsTable } from "@/components/money/MoneyDetailsTable";
import { formatCurrency } from "@/lib/format";

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
    borderLeft: `2px solid ${amountColor}`,
    background: SURFACES.card,
    boxShadow: isMobile ? "0 14px 30px rgba(0, 0, 0, 0.22)" : templateStyle.boxShadow,
    transition: MOTION.interactiveTransition,
  } as const;
  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isNestedInteractiveTarget(event.target, event.currentTarget)) return;
    onToggle();
  };

  return (
    <div
      className="mm-interactive-surface"
      data-hover="soft"
      onClick={handleCardClick}
      style={{
        ...cardStyle,
        padding: isMobile ? SPACING.smPlus : SPACING.xl,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.xsPlus : SPACING.md,
        animation: MOTION.staggerEnter(animationIndex, isMobile ? 90 : 120),
      }}
    >
      <ClickableCard
        onPress={onToggle}
        hoverVariant="soft"
        aria-expanded={isExpanded}
        aria-label={label}
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
          <CaretRight
            aria-hidden="true"
            size={isMobile ? 15 : 18}
            weight="fill"
            style={{
              color: COLORS.text.secondary,
              transition: "transform 0.3s ease",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              flexShrink: 0,
            }}
          />
        </div>
      </ClickableCard>
      <p
        style={{
          ...amountTypography,
          color: amountColor,
          letterSpacing: -0.35,
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
    </div>
  );
};
