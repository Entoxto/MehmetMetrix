import type { CSSProperties } from "react";
import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/styles";
import { formatCurrency, formatModelCount, formatUnitCount } from "@/lib/format";
import type { Shipment } from "@/types/shipment";

interface ShipmentDateInfoProps {
  shipment: Shipment;
  isDesktop: boolean;
  isMobile: boolean;
  typography: {
    caption: CSSProperties;
  };
}

export const ShipmentDateInfo = ({
  shipment,
  isDesktop,
  isMobile,
  typography,
}: ShipmentDateInfoProps) => {
  const label = shipment.receivedDate ? "Дата получения" : "План доставки";
  const value = shipment.receivedDate || shipment.eta;

  if (!value) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        ...(isDesktop
          ? {
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 4,
              minHeight: 60,
              paddingRight: SPACING.md,
            }
          : {
              gap: SPACING.xs,
              marginTop: SPACING.xs,
              paddingTop: SPACING.sm,
              borderTop: `1px solid ${COLORS.border.default}`,
            }),
      }}
    >
      <p
        style={{
          ...typography.caption,
          color: isDesktop ? "rgba(212, 212, 212, 0.6)" : COLORS.text.muted,
          textTransform: "uppercase",
          margin: 0,
          lineHeight: 1.4,
          ...(isDesktop ? { textAlign: "right" } : {}),
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: isMobile ? 14 : 15,
          lineHeight: 1.4,
          color: COLORS.text.primary,
          fontWeight: 600,
          fontFamily: FONT_FAMILIES.ui,
          fontVariantNumeric: "tabular-nums",
          margin: 0,
          ...(isDesktop ? { textAlign: "right" } : {}),
        }}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </p>
    </div>
  );
};

interface ShipmentMetricsSummaryProps {
  modelsCount: number;
  unitsCount: number;
  totalAmount: number;
  isMobile: boolean;
  typography: {
    caption: CSSProperties;
    amount: CSSProperties;
  };
}

export const ShipmentMetricsSummary = ({
  modelsCount,
  unitsCount,
  totalAmount,
  isMobile,
  typography,
}: ShipmentMetricsSummaryProps) => {
  const metrics = [
    { label: "Позиции", value: formatModelCount(modelsCount) },
    { label: "Количество", value: formatUnitCount(unitsCount) },
    { label: "Сумма", value: formatCurrency(totalAmount) },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: isMobile ? SPACING.sm : SPACING.md,
        minWidth: 0,
        paddingTop: isMobile ? SPACING.sm : SPACING.md,
        borderTop: `1px solid ${COLORS.border.default}`,
      }}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 2 : SPACING.xs,
            minWidth: 0,
          }}
        >
          <span
            style={{
              ...typography.caption,
              color: COLORS.text.tertiary,
              fontSize: isMobile ? 8 : 10,
              lineHeight: 1.2,
              letterSpacing: isMobile ? 0.65 : 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {metric.label}
          </span>
          <span
            style={{
              ...typography.amount,
              color: COLORS.text.primary,
              fontSize: isMobile ? 12 : 15,
              lineHeight: 1.25,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
};
