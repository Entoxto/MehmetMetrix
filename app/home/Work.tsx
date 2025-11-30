"use client";

/**
 * Экран «Работа».
 * Показывает поставки, сгруппированные по годам, группирует позиции по статусам и помогает следить за пошивом.
 * Использует YearGroup для группировки по годам, BatchView и PositionRow, раскрывающиеся карточки и hover-эффекты.
 * Адаптируется под мобильный и десктоп.
 */
import { useMemo } from "react";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/styles";
import { groupShipmentsByYear } from "@/lib/shipments";
import { YearGroup } from "@/components/work/YearGroup";
import type { ShipmentWithItems } from "@/lib/shipments";

interface WorkProps {
  isMobile: boolean;
  isDesktop: boolean;
  shipments: ShipmentWithItems[];
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  expandedYears: Set<number>;
  onToggleYear: (year: number) => void;
}

export const Work = ({
  isMobile,
  isDesktop,
  shipments,
  expandedCards,
  onToggleCard,
  expandedYears,
  onToggleYear,
}: WorkProps) => {
  const responsiveTypography = useMemo(
    () => ({
    h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 22 : 30 },
    }),
    [isMobile]
  );

  // Группируем поставки по годам
  const shipmentsByYear = useMemo(() => groupShipmentsByYear(shipments), [shipments]);

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.md : SPACING.xl,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.md : SPACING.lg,
      }}
    >
      <div>
        <h2
          style={{
            ...responsiveTypography.h2,
            color: COLORS.primary,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Что сейчас в работе <span style={{ fontSize: isMobile ? 20 : 28 }}>🧵</span>
        </h2>
        <p
          style={{
            color: COLORS.text.secondary,
            fontSize: isMobile ? 12 : 13,
            fontStyle: "italic",
          }}
        >
          Актуальные поставки, статусы и суммы по поставкам.
        </p>
      </div>

      {Array.from(shipmentsByYear.entries()).map(([year, yearShipments]) => (
        <YearGroup
          key={year}
          year={year}
          shipments={yearShipments}
          isExpanded={expandedYears.has(year)}
          onToggle={() => onToggleYear(year)}
          expandedCards={expandedCards}
          onToggleCard={onToggleCard}
          isMobile={isMobile}
          isDesktop={isDesktop}
        />
      ))}
    </div>
  );
};

