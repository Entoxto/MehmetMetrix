"use client";

import type { CSSProperties, MouseEvent } from "react";
import { COLORS, SPACING, STYLES } from "@/constants/styles";
import { formatCurrency, formatModelCount, formatUnitCount } from "@/lib/format";
import type { YearShipmentMetrics } from "@/lib/shipmentMetrics";
import { ClickableCard } from "@/components/ui/ClickableCard";

interface YearHeaderProps {
  year: number;
  metrics: YearShipmentMetrics;
  isExpanded: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  onToggle: () => void;
  cardStyle: CSSProperties;
  hoverHandlers: {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (e: MouseEvent<HTMLElement>) => void;
  };
  typography: {
    h2: CSSProperties;
    amount: CSSProperties;
  };
}

const mobileTurnoverStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "baseline",
  justifyContent: "flex-end",
  gap: 6,
  minWidth: 0,
  whiteSpace: "nowrap",
};

const mobileMetaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: SPACING.xsPlus,
  fontSize: 10,
  lineHeight: 1.2,
  color: COLORS.text.secondary,
  minWidth: 0,
};

const mobileMetaItemStyle: CSSProperties = {
  whiteSpace: "nowrap",
  fontWeight: 600,
};

const mobileMetaSeparatorStyle: CSSProperties = {
  color: COLORS.text.tertiary,
  lineHeight: 1,
};

const desktopMetaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: SPACING.xsPlus,
  color: COLORS.text.secondary,
  fontSize: 12,
  lineHeight: 1.3,
  fontWeight: 650,
};

const desktopMetaSeparatorStyle: CSSProperties = {
  color: COLORS.text.tertiary,
  lineHeight: 1,
};

const getYearHeaderStyle = ({
  cardStyle,
  isExpanded,
  isMobile,
}: {
  cardStyle: CSSProperties;
  isExpanded: boolean;
  isMobile: boolean;
}): CSSProperties => ({
  ...cardStyle,
  padding: isMobile ? "8px" : cardStyle.padding,
  cursor: "pointer",
  marginBottom: 0,
  position: "relative",
  zIndex: 1,
  overflow: "hidden",
  borderRadius: isExpanded
    ? isMobile
      ? "18px 18px 14px 14px"
      : "24px 24px 18px 18px"
    : cardStyle.borderRadius,
  border: isExpanded ? `1px solid ${COLORS.border.primary}` : cardStyle.border,
  background: isExpanded
    ? `linear-gradient(135deg, rgba(244,195,77,0.16) 0%, rgba(32,32,37,0.98) 24%, ${COLORS.background.cardExpanded} 100%)`
    : isMobile
    ? "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(18,18,21,0.98) 100%)"
    : cardStyle.background,
  boxShadow: isExpanded ? "0 22px 44px rgba(0, 0, 0, 0.3)" : cardStyle.boxShadow,
});

const Chevron = ({ isExpanded, isMobile }: { isExpanded: boolean; isMobile: boolean }) => (
  <span
    style={{
      fontSize: isMobile ? 15 : 20,
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
);

export const YearHeader = ({
  year,
  metrics,
  isExpanded,
  isMobile,
  isDesktop,
  onToggle,
  cardStyle,
  hoverHandlers,
  typography,
}: YearHeaderProps) => {
  const headerStyle = getYearHeaderStyle({ cardStyle, isExpanded, isMobile });
  const hoverProps = isMobile || isExpanded ? {} : hoverHandlers;

  return (
    <ClickableCard
      onPress={onToggle}
      style={headerStyle}
      aria-expanded={isExpanded}
      aria-label={`Год ${year}, поставок: ${metrics.shipmentsCount}`}
      {...hoverProps}
    >
      {isExpanded && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: isMobile ? 18 : 24,
            right: isMobile ? 18 : 24,
            bottom: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(244,195,77,0.5) 18%, rgba(244,195,77,0.2) 82%, transparent 100%)",
          }}
        />
      )}

      {isMobile ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gridTemplateAreas: `"title turnover" "meta meta"`,
            gap: SPACING.xsPlus,
            alignItems: "center",
          }}
        >
          <div
            style={{
              gridArea: "title",
              display: "flex",
              alignItems: "center",
              gap: SPACING.sm,
              minWidth: 0,
            }}
          >
            <Chevron isExpanded={isExpanded} isMobile={isMobile} />
            <h2
              style={{
                ...typography.h2,
                color: COLORS.text.primary,
                margin: 0,
                flex: 1,
              }}
            >
              {year}
            </h2>
          </div>
          <div style={{ ...mobileTurnoverStyle, gridArea: "turnover" }}>
            <span
              style={{
                ...STYLES.metricLabel,
                fontSize: 6,
                letterSpacing: 0.8,
                margin: 0,
                whiteSpace: "nowrap",
                lineHeight: 1,
                color: COLORS.text.tertiary,
              }}
            >
              Оборот
            </span>
            <span
              style={{
                ...typography.amount,
                fontSize: 16,
                margin: 0,
                lineHeight: 1,
                color: COLORS.text.primary,
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(metrics.totalAmount)}
            </span>
          </div>
          <div style={{ ...mobileMetaRowStyle, gridArea: "meta" }}>
            <span style={{ ...mobileMetaItemStyle, color: COLORS.primary }}>
              {metrics.shipmentsCount} поставок
            </span>
            <span aria-hidden="true" style={mobileMetaSeparatorStyle}>
              •
            </span>
            <span style={mobileMetaItemStyle}>{formatModelCount(metrics.modelsCount)}</span>
            <span aria-hidden="true" style={mobileMetaSeparatorStyle}>
              •
            </span>
            <span style={mobileMetaItemStyle}>{formatUnitCount(metrics.unitsCount)}</span>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "1fr auto" : "1fr",
            gap: isDesktop ? SPACING.lg : SPACING.md,
            alignItems: "center",
            minHeight: isDesktop ? 56 : "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: SPACING.xsPlus }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
              <Chevron isExpanded={isExpanded} isMobile={isMobile} />
              <h2
                style={{
                  ...typography.h2,
                  color: COLORS.text.primary,
                  margin: 0,
                  flex: 1,
                }}
              >
                {year}
              </h2>
            </div>
            <div style={desktopMetaRowStyle}>
              <span style={{ color: COLORS.primary }}>{metrics.shipmentsCount} поставок</span>
              <span aria-hidden="true" style={desktopMetaSeparatorStyle}>
                •
              </span>
              <span>{formatModelCount(metrics.modelsCount)}</span>
              <span aria-hidden="true" style={desktopMetaSeparatorStyle}>
                •
              </span>
              <span>{formatUnitCount(metrics.unitsCount)}</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              paddingRight: isDesktop ? SPACING.md : 0,
            }}
          >
            <span
              style={{
                ...STYLES.metricLabel,
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              Годовой оборот
            </span>
            <span
              style={{
                ...typography.amount,
                fontSize: 22,
                margin: 0,
                lineHeight: 1.2,
                color: COLORS.text.primary,
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(metrics.totalAmount)}
            </span>
          </div>
        </div>
      )}
    </ClickableCard>
  );
};
