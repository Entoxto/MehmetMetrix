"use client";

/**
 * Компонент для отображения партии с группировкой по статусам
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { Fragment } from "react";
import { COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import { formatCurrency, statusLabel, statusIcon } from "@/lib/format";
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
          padding: isMobile ? "10px 12px" : "14px 18px",
          background: COLORS.background.card,
          ...typography.tableHeader,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: COLORS.text.secondary,
          borderBottom: `1px solid ${COLORS.border.default}`,
          margin: 0,
        }}
      >
        Позиция
      </div>
      <div
        style={{
          padding: isMobile ? "8px 8px" : "12px 12px",
          background: COLORS.background.card,
          ...typography.tableHeader,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: COLORS.text.secondary,
          borderBottom: `1px solid ${COLORS.border.default}`,
          textAlign: "center",
          margin: 0,
        }}
      >
        Кол-во
      </div>
      <div
        style={{
          padding: isMobile ? "8px 8px" : "12px 12px",
          background: COLORS.background.card,
          ...typography.tableHeader,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: COLORS.text.secondary,
          borderBottom: `1px solid ${COLORS.border.default}`,
          textAlign: "center",
          margin: 0,
        }}
      >
        Цена
      </div>
      <div
        style={{
          padding: isMobile ? "8px 8px" : "12px 12px",
          background: COLORS.background.card,
          ...typography.tableHeader,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: COLORS.text.secondary,
          borderBottom: `1px solid ${COLORS.border.default}`,
          textAlign: "center",
          margin: 0,
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
              gap: 8,
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

