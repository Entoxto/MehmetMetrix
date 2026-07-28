import {
  COLORS,
  FONT_FAMILIES,
  SHIPMENT_TYPE_VISUALS,
  SPACING,
  STYLES,
} from "@/constants/styles";
import { formatUnitCount } from "@/lib/format";
import { getShipmentContentsItems } from "@/lib/shipmentMetrics";
import type { Shipment } from "@/types/shipment";

interface ShipmentContentsListProps {
  shipment: Shipment;
  isMobile: boolean;
}

export const ShipmentContentsList = ({
  shipment,
  isMobile,
}: ShipmentContentsListProps) => {
  const items = getShipmentContentsItems(shipment);

  return (
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          ...STYLES.metricLabel,
          margin: 0,
          marginBottom: isMobile ? SPACING.xs : SPACING.xsPlus,
          color: COLORS.text.tertiary,
          fontSize: isMobile ? 8 : 10,
          letterSpacing: isMobile ? 0.9 : 1.2,
        }}
      >
        Состав
      </p>

      {items.length > 0 ? (
        <ul
          aria-label="Модели в поставке"
          style={{
            display: "grid",
            gap: 0,
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              aria-label={`${item.sourceTitle}, ${formatUnitCount(item.quantity)}`}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "minmax(0, 1fr)"
                  : "minmax(0, 1fr) minmax(128px, 0.34fr) auto",
                gap: isMobile ? SPACING.xs : SPACING.md,
                alignItems: "baseline",
                minWidth: 0,
                paddingTop: index === 0 ? 0 : isMobile ? SPACING.sm : SPACING.xsPlus,
                paddingBottom:
                  index === items.length - 1 ? 0 : isMobile ? SPACING.sm : SPACING.xsPlus,
                borderTop:
                  index === 0 ? "none" : `1px solid ${COLORS.border.default}`,
              }}
            >
              <span
                title={item.model}
                style={{
                  display: "block",
                  minWidth: 0,
                  color: COLORS.text.secondary,
                  fontSize: isMobile ? 11 : 13,
                  lineHeight: isMobile ? 1.32 : 1.35,
                  overflowWrap: "break-word",
                }}
              >
                {item.model}
              </span>

              {isMobile ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: SPACING.sm,
                    minWidth: 0,
                    fontFamily: FONT_FAMILIES.ui,
                  }}
                >
                  <span
                    style={{
                      minWidth: 0,
                      color: item.color
                        ? SHIPMENT_TYPE_VISUALS.batch.accent
                        : COLORS.text.tertiary,
                      fontSize: 9,
                      lineHeight: 1.35,
                      overflowWrap: "break-word",
                    }}
                  >
                    {item.color ? `Цвет · ${item.color}` : "Цвет не указан"}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      color: COLORS.text.primary,
                      fontSize: 10,
                      lineHeight: 1.2,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatUnitCount(item.quantity)}
                  </span>
                </span>
              ) : (
                <>
                  <span
                    style={{
                      minWidth: 0,
                      color: item.color
                        ? SHIPMENT_TYPE_VISUALS.batch.accent
                        : COLORS.text.tertiary,
                      fontFamily: FONT_FAMILIES.ui,
                      fontSize: 10,
                      lineHeight: 1.35,
                      overflowWrap: "break-word",
                    }}
                  >
                    {item.color ? `Цвет · ${item.color}` : "Цвет не указан"}
                  </span>
                  <span
                    style={{
                      color: COLORS.text.primary,
                      fontFamily: FONT_FAMILIES.ui,
                      fontSize: 11,
                      lineHeight: 1.2,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatUnitCount(item.quantity)}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p
          style={{
            margin: 0,
            color: COLORS.text.muted,
            fontSize: isMobile ? 11 : 13,
          }}
        >
          Состав пока не указан
        </p>
      )}
    </div>
  );
};
