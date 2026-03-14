"use client";

/**
 * Экран «Работа».
 * Показывает поставки, сгруппированные по годам, группирует позиции по статусам и помогает следить за пошивом.
 * Использует YearGroup для группировки по годам, BatchView и PositionRow, раскрывающиеся карточки и hover-эффекты.
 * Адаптируется под мобильный и десктоп.
 */
import { useMemo } from "react";
import { COLORS, SPACING, TYPOGRAPHY, STYLES, CARD_TEMPLATES, MOTION } from "@/constants/styles";
import { groupShipmentsByYear } from "@/lib/shipments";
import { YearGroup } from "@/components/work/YearGroup";
import type { ShipmentWithItems } from "@/types/shipment";

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
      h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 20 : 28 },
    }),
    [isMobile]
  );
  const introCopyStyle = useMemo(() => STYLES.pageIntroCopy(isMobile), [isMobile]);

  // Группируем поставки по годам
  const shipmentsByYear = useMemo(() => groupShipmentsByYear(shipments), [shipments]);

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.smPlus : SPACING.xl,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.smPlus : SPACING.lg,
      }}
    >
      <div style={{ ...CARD_TEMPLATES.pageIntro(isMobile), animation: MOTION.softEnter }}>
        <h2
          style={{
            ...responsiveTypography.h2,
            color: COLORS.text.primary,
            margin: 0,
          }}
        >
          Все партии и их статусы
        </h2>
        <p
          style={introCopyStyle}
        >
          История поставок по годам: текущие партии, завершенные отгрузки и состояние оплаты в одном месте.
        </p>
      </div>

      {Array.from(shipmentsByYear.entries()).map(([year, yearShipments], index) => (
        <YearGroup
          key={year}
          year={year}
          shipments={yearShipments}
          animationIndex={index}
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


