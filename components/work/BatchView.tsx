"use client";

/**
 * Таблица партии в разделе «Работа».
 * Группирует позиции по статусам и рендерит строки через PositionRow.
 * Поддерживает наведение для подсветки строк на десктопе.
 */

import { Fragment } from "react";
import { COLORS, CARD_TEMPLATES, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import { statusLabel, statusIcon } from "@/lib/format";
import { toViewRows } from "@/lib/derive";
import { PositionRow } from "./PositionRow";
import type { Batch } from "@/types/domain";
import type { MouseEvent } from "react";

interface BatchViewProps {
  batch: Batch;
  onRowHover?: (event: MouseEvent<HTMLDivElement>, isHover: boolean) => void;
  cellBaseBackground: string;
  cellBaseBorder: string;
  typography: {
    tableCell: React.CSSProperties;
    tableHeader: React.CSSProperties;
  };
}

export const BatchView = ({
  batch,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: BatchViewProps) => {
  const { isMobile } = useBreakpoint();
  const viewRows = toViewRows(batch);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "2.2fr 0.55fr 0.55fr 0.55fr" : "2.2fr 0.75fr 0.75fr 0.75fr",
        gap: 0,
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: 12,
        overflow: "hidden",
        fontSize: isMobile ? 11 : 12,
      }}
    >
      {/* Заголовки колонок */}
      <div
        style={{
          ...CARD_TEMPLATES.tableHeader(isMobile),
          ...typography.tableHeader,
        }}
      >
        Позиция
      </div>
      <div
        style={{
          ...CARD_TEMPLATES.tableValue(isMobile, "center"),
          ...typography.tableHeader,
          textTransform: "uppercase",
        }}
      >
        Кол-во
      </div>
      <div
        style={{
          ...CARD_TEMPLATES.tableValue(isMobile, "center"),
          ...typography.tableHeader,
          textTransform: "uppercase",
        }}
      >
        Цена
      </div>
      <div
        style={{
          ...CARD_TEMPLATES.tableValue(isMobile, "center"),
          ...typography.tableHeader,
          textTransform: "uppercase",
        }}
      >
        Сумма
      </div>

      {/* Группы по статусам */}
      {viewRows.map((row) => (
        <Fragment key={row.status}>
          {/* Заголовок группы */}
          <div
            style={{
              gridColumn: "1 / -1",
              background: COLORS.background.cardExpanded,
              borderBottom: `1px solid ${COLORS.border.default}`,
              padding: isMobile ? "10px 12px" : "12px 18px",
              ...typography.tableCell,
              fontWeight: 600,
              color: COLORS.primary,
              display: "flex",
              alignItems: "center",
              gap: SPACING.sm,
              margin: 0,
            }}
          >
            <span style={{ fontSize: isMobile ? 12 : 14, lineHeight: 1 }}>{statusIcon[row.status]}</span>
            <span>{statusLabel[row.status]}</span>
          </div>

          {/* Позиции в группе */}
          {row.items.map((position) => (
            <PositionRow
              key={position.id}
              position={position}
              batchId={batch.id}
              onRowHover={onRowHover}
              cellBaseBackground={cellBaseBackground}
              cellBaseBorder={cellBaseBorder}
              typography={typography}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
};

