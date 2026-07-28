"use client";

import { Package, Tag } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { FONT_FAMILIES, SHIPMENT_TYPE_VISUALS, SPACING } from "@/constants/styles";
import { getShipmentTypeFlags } from "@/lib/shipmentMetrics";
import type { Shipment } from "@/types/shipment";

interface ShipmentTypeBadgesProps {
  shipment: Shipment;
  isMobile: boolean;
}

type ShipmentType = "batch" | "sample";

const BADGE_LABELS: Record<ShipmentType, string> = {
  batch: "Партия",
  sample: "Образец",
};

function getBadgeStyle(type: ShipmentType, isMobile: boolean): CSSProperties {
  const visual = SHIPMENT_TYPE_VISUALS[type];

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: isMobile ? SPACING.xs : SPACING.xsPlus,
    minHeight: isMobile ? 24 : 28,
    padding: isMobile ? "4px 8px" : "5px 10px",
    borderRadius: isMobile ? 8 : 9,
    border: `1px solid ${visual.border}`,
    background: visual.surface,
    color: visual.accent,
    fontSize: isMobile ? 9 : 11,
    fontWeight: 700,
    fontFamily: FONT_FAMILIES.ui,
    lineHeight: 1,
    letterSpacing: isMobile ? 0.65 : 0.85,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    boxShadow: `0 4px 12px ${visual.surface}`,
  };
}

const ShipmentTypeBadge = ({
  type,
  isMobile,
}: {
  type: ShipmentType;
  isMobile: boolean;
}) => {
  const Icon = type === "batch" ? Package : Tag;

  return (
    <span style={getBadgeStyle(type, isMobile)}>
      <Icon
        size={isMobile ? 13 : 15}
        weight="regular"
        aria-hidden="true"
      />
      <span>{BADGE_LABELS[type]}</span>
    </span>
  );
};

export const ShipmentTypeBadges = ({
  shipment,
  isMobile,
}: ShipmentTypeBadgesProps) => {
  const { hasBatch, hasSample } = getShipmentTypeFlags(shipment);
  const labels = [
    hasBatch ? BADGE_LABELS.batch.toLowerCase() : null,
    hasSample ? BADGE_LABELS.sample.toLowerCase() : null,
  ].filter(Boolean);

  return (
    <span
      role="group"
      aria-label={`Тип поставки: ${labels.join(", ")}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isMobile ? SPACING.xs : SPACING.xsPlus,
        flexWrap: "nowrap",
        flexShrink: 0,
      }}
    >
      {hasBatch && <ShipmentTypeBadge type="batch" isMobile={isMobile} />}
      {hasSample && <ShipmentTypeBadge type="sample" isMobile={isMobile} />}
    </span>
  );
};
