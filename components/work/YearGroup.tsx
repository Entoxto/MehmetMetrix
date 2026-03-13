"use client";

/**
 * Компонент группы поставок по году.
 * Отображает год с выпадающим списком поставок внутри.
 * При раскрытии партии появляются на связанном визуальном "листе",
 * чтобы уровень вложенности считывался сразу.
 */

import { useMemo } from "react";
import type { MouseEvent } from "react";
import { COLORS, SPACING, CARD_TEMPLATES, CARD_HOVER_EFFECTS, TYPOGRAPHY, STYLES } from "@/constants/styles";
import { formatCurrency, formatModelCount, formatUnitCount } from "@/lib/format";
import { createCardHoverHandlers } from "@/lib/utils";
import { ShipmentCard } from "@/components/work/ShipmentCard";
import type { ShipmentWithItems } from "@/types/shipment";

interface YearGroupProps {
  year: number;
  shipments: ShipmentWithItems[];
  isExpanded: boolean;
  onToggle: () => void;
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  isMobile: boolean;
  isDesktop: boolean;
}

export const YearGroup = ({
  year,
  shipments,
  isExpanded,
  onToggle,
  expandedCards,
  onToggleCard,
  isMobile,
  isDesktop,
}: YearGroupProps) => {
  const responsiveTypography = useMemo(
    () => ({
      h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 20 : 30 },
      h3: { ...TYPOGRAPHY.h3, fontSize: isMobile ? 18 : 22 },
      body: { ...TYPOGRAPHY.body, fontSize: isMobile ? 11 : 13 },
      caption: { ...TYPOGRAPHY.caption, fontSize: isMobile ? 9 : 11 },
      amount: { ...TYPOGRAPHY.amount, fontSize: isMobile ? 18 : 30 },
      tableHeader: {
        ...TYPOGRAPHY.tableHeader,
        fontSize: isMobile ? 8 : 11,
      },
      tableCell: {
        ...TYPOGRAPHY.tableCell,
        fontSize: isMobile ? 10 : 12,
      },
    }),
    [isMobile]
  );

  const yearlyTurnover = useMemo(
    () => shipments.reduce((sum, shipment) => sum + shipment.totalAmount, 0),
    [shipments]
  );
  const totalModels = useMemo(
    () => shipments.reduce((sum, shipment) => sum + shipment.batch.positions.length, 0),
    [shipments]
  );
  const totalUnits = useMemo(
    () =>
      shipments.reduce(
        (sum, shipment) =>
          sum + shipment.batch.positions.reduce((positionSum, position) => positionSum + position.qty, 0),
        0
      ),
    [shipments]
  );

  const shipmentCellBaseBackground = isMobile ? "rgba(13,13,16,0.98)" : "rgba(18,18,22,0.78)";
  const shipmentCellHoverBackground = "rgba(34,34,39,0.96)";
  const shipmentCellBaseBorder = COLORS.border.default;
  const shipmentCellHoverBorder = COLORS.border.primaryHover;

  const handleShipmentRowHover = (event: MouseEvent<HTMLDivElement>, isHover: boolean) => {
    const row = event.currentTarget;
    const cells = Array.from(row.children) as HTMLElement[];
    cells.forEach((cell) => {
      cell.style.background = isHover ? shipmentCellHoverBackground : shipmentCellBaseBackground;
      cell.style.borderBottom = `1px solid ${
        isHover ? shipmentCellHoverBorder : shipmentCellBaseBorder
      }`;
    });
  };

  const cardStyle = useMemo(() => CARD_TEMPLATES.container(isMobile), [isMobile]);
  const shipmentCardStyle = useMemo(
    () => ({
      ...cardStyle,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(20,20,24,0.9) 100%)",
      border: `1px solid ${COLORS.border.hover}`,
      borderRadius: isMobile ? 16 : 20,
      boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
    }),
    [cardStyle, isMobile]
  );
  const hoverHandlers = useMemo(
    () => createCardHoverHandlers(CARD_HOVER_EFFECTS.work.hover, CARD_HOVER_EFFECTS.work.default),
    []
  );

  const yearHeaderStyle: React.CSSProperties = useMemo(
    () => ({
      ...cardStyle,
      padding: isMobile ? "8px" : cardStyle.padding,
      cursor: "pointer",
      outline: "none",
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
      boxShadow: isExpanded
        ? "0 22px 44px rgba(0, 0, 0, 0.3)"
        : cardStyle.boxShadow,
    }),
    [cardStyle, isExpanded, isMobile]
  );

  const sheetStyle: React.CSSProperties = useMemo(
    () => ({
      position: "relative",
      marginTop: isMobile ? -SPACING.sm : -SPACING.md,
      paddingTop: isMobile ? SPACING.md : SPACING.lg,
      paddingRight: isMobile ? SPACING.sm : SPACING.lg,
      paddingBottom: isMobile ? SPACING.smPlus : SPACING.lg,
      paddingLeft: isMobile ? SPACING.smPlus : SPACING.xl,
      border: `1px solid ${COLORS.border.primary}`,
      borderTop: "none",
      borderRadius: isMobile ? "0 0 18px 18px" : "0 0 28px 28px",
      background:
        "linear-gradient(180deg, rgba(244,195,77,0.08) 0%, rgba(33,33,38,0.96) 16%, rgba(16,16,19,0.94) 100%)",
      boxShadow: isMobile ? "0 18px 38px rgba(0, 0, 0, 0.28)" : "0 28px 60px rgba(0, 0, 0, 0.34)",
      overflow: "hidden",
      animation: "fadeIn 260ms ease-out",
    }),
    [isMobile]
  );

  const mobileTurnoverStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "baseline",
      justifyContent: "flex-end",
      gap: 6,
      minWidth: 0,
      whiteSpace: "nowrap",
    }),
    []
  );

  const mobileMetaRowStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: SPACING.xsPlus,
      fontSize: 10,
      lineHeight: 1.2,
      color: COLORS.text.secondary,
      minWidth: 0,
    }),
    []
  );

  const mobileMetaItemStyle = useMemo<React.CSSProperties>(
    () => ({
      whiteSpace: "nowrap",
      fontWeight: 600,
    }),
    []
  );

  const mobileMetaSeparatorStyle = useMemo<React.CSSProperties>(
    () => ({
      color: COLORS.text.tertiary,
      lineHeight: 1,
    }),
    []
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        style={yearHeaderStyle}
        {...(isMobile || isExpanded ? {} : hoverHandlers)}
        onFocus={(e) => {
          e.currentTarget.style.outline = STYLES.focusRing.outline;
          e.currentTarget.style.outlineOffset = STYLES.focusRing.outlineOffset;
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        aria-expanded={isExpanded}
        aria-label={`Год ${year}, поставок: ${shipments.length}`}
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
              <span
                style={{
                  fontSize: 15,
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
              <h2
                style={{
                  ...responsiveTypography.h2,
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
                  ...responsiveTypography.amount,
                  fontSize: 16,
                  margin: 0,
                  lineHeight: 1,
                  color: COLORS.text.primary,
                  whiteSpace: "nowrap",
                }}
              >
                {formatCurrency(yearlyTurnover)}
              </span>
            </div>
            <div
              style={{
                ...mobileMetaRowStyle,
                gridArea: "meta",
              }}
            >
              <span style={{ ...mobileMetaItemStyle, color: COLORS.primary }}>
                {shipments.length} поставок
              </span>
              <span aria-hidden="true" style={mobileMetaSeparatorStyle}>
                •
              </span>
              <span style={mobileMetaItemStyle}>{formatModelCount(totalModels)}</span>
              <span aria-hidden="true" style={mobileMetaSeparatorStyle}>
                •
              </span>
              <span style={mobileMetaItemStyle}>{formatUnitCount(totalUnits)}</span>
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
            <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
                <span
                  style={{
                    fontSize: 20,
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
                <h2
                  style={{
                    ...responsiveTypography.h2,
                    color: COLORS.text.primary,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {year}
                </h2>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: SPACING.sm }}>
                <span style={STYLES.categoryBadge}>{shipments.length} поставок</span>
                <span style={STYLES.sizeBadge}>{formatModelCount(totalModels)}</span>
                <span style={STYLES.sizeBadge}>{formatUnitCount(totalUnits)}</span>
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
                  ...responsiveTypography.amount,
                  fontSize: 22,
                  margin: 0,
                  lineHeight: 1.2,
                  color: COLORS.text.primary,
                  whiteSpace: "nowrap",
                }}
              >
                {formatCurrency(yearlyTurnover)}
              </span>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div style={sheetStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: SPACING.md,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {shipments.length === 0 ? (
              <div
                style={{
                  ...shipmentCardStyle,
                  padding: SPACING.lg,
                  textAlign: "center",
                  color: COLORS.text.secondary,
                }}
              >
                Нет поставок в этом году
              </div>
            ) : (
              shipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  isExpanded={expandedCards.has(shipment.id)}
                  onToggle={() => onToggleCard(shipment.id)}
                  isMobile={isMobile}
                  isDesktop={isDesktop}
                  cardStyle={shipmentCardStyle}
                  hoverHandlers={hoverHandlers}
                  onRowHover={handleShipmentRowHover}
                  cellBaseBackground={shipmentCellBaseBackground}
                  cellBaseBorder={shipmentCellBaseBorder}
                  typography={responsiveTypography}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};



