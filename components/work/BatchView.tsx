"use client";

/**
 * Таблица партии в разделе «Работа».
 * Группирует позиции по статусам и рендерит строки через PositionRow.
 * Поддерживает наведение для подсветки строк на десктопе.
 * Поддерживает горизонтальную прокрутку на мобильных устройствах.
 */

import { Fragment, useMemo } from "react";
import { COLORS, CARD_TEMPLATES, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatCurrency, formatCurrencyRUB } from "@/lib/format";
import { toViewRows } from "@/lib/derive";
import { PositionRow } from "./PositionRow";
import type { Batch, Position } from "@/types/domain";
import type { MouseEvent } from "react";
import type { PositionRowProps } from "./PositionRow";

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

/**
 * Конфигурация колонки таблицы
 */
interface ColumnConfig {
  id: string;
  label: string;
  widthMobile: string;
  widthDesktop: string;
  visibleOnMobile: boolean;
  renderHeader: (isMobile: boolean, typography: React.CSSProperties) => React.ReactNode;
  renderCell: (position: Position, isMobile: boolean, props: PositionRowProps) => React.ReactNode;
}

/**
 * Базовые стили для ячеек таблицы
 */
const getBaseCellStyle = (
  isMobile: boolean,
  cellBaseBackground: string,
  cellBaseBorder: string,
  typography: { tableCell: React.CSSProperties }
): React.CSSProperties => ({
  padding: isMobile ? "8px 8px" : "12px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderBottom: `1px solid ${cellBaseBorder}`,
  ...typography.tableCell,
  background: cellBaseBackground,
  transition: "background 0.2s ease, border 0.2s ease",
  margin: 0,
});

/**
 * Создает стили для заголовка числовой колонки
 */
const getNumericHeaderStyle = (isMobile: boolean, typography: React.CSSProperties): React.CSSProperties => ({
  ...CARD_TEMPLATES.tableValue(isMobile, "center"),
  ...typography,
  textTransform: "uppercase",
});

const getLeadingHeaderStyle = (isMobile: boolean, typography: React.CSSProperties): React.CSSProperties => ({
  ...CARD_TEMPLATES.tableValue(isMobile, "left"),
  ...typography,
  textTransform: "uppercase",
  justifyContent: "flex-start",
  color: COLORS.text.muted,
});

/**
 * Конфигурация всех колонок таблицы
 */
const COLUMNS_CONFIG: ColumnConfig[] = [
  {
    id: "position",
    label: "Позиция",
    widthMobile: "1.7fr",
    widthDesktop: "2.2fr",
    visibleOnMobile: true,
    renderHeader: (isMobile, typography) => (
      <div style={getLeadingHeaderStyle(isMobile, typography)}>
        Позиция
      </div>
    ),
    renderCell: () => null, // Колонка "position" рендерится отдельно в PositionRow
  },
  {
    id: "quantity",
    label: "Кол-во",
    widthMobile: "0.72fr",
    widthDesktop: "0.75fr",
    visibleOnMobile: true,
    renderHeader: (isMobile, typography) => (
      <div style={getNumericHeaderStyle(isMobile, typography)}>
        Кол-во
      </div>
    ),
    renderCell: (position, isMobile, props) => {
      const { cellBaseBackground, cellBaseBorder, typography } = props;
      const qtyLabel = position.sample 
        ? position.qty > 0 ? `${position.qty} шт.` : ""
        : `${position.qty} шт.`;
      
      return (
        <div
          style={{
            ...getBaseCellStyle(isMobile, cellBaseBackground, cellBaseBorder, typography),
            fontWeight: 600,
            color: COLORS.text.primary,
          }}
        >
          {qtyLabel}
        </div>
      );
    },
  },
  {
    id: "price",
    label: "Цена",
    widthMobile: "0.82fr",
    widthDesktop: "0.75fr",
    visibleOnMobile: true,
    renderHeader: (isMobile, typography) => (
      <div style={getNumericHeaderStyle(isMobile, typography)}>
        Цена
      </div>
    ),
    renderCell: (position, isMobile, props) => {
      const { cellBaseBackground, cellBaseBorder, typography } = props;
      
      return (
        <div
          style={{
            ...getBaseCellStyle(isMobile, cellBaseBackground, cellBaseBorder, typography),
            color: position.price != null ? COLORS.text.primary : COLORS.text.muted,
            fontWeight: position.price != null ? 600 : 500,
          }}
        >
          {position.price != null ? formatCurrency(position.price) : "уточняется"}
        </div>
      );
    },
  },
  {
    id: "sum",
    label: "Сумма",
    widthMobile: "0.9fr",
    widthDesktop: "0.75fr",
    visibleOnMobile: true,
    renderHeader: (isMobile, typography) => (
      <div style={getNumericHeaderStyle(isMobile, typography)}>
        Сумма
      </div>
    ),
    renderCell: (position, isMobile, props) => {
      const { cellBaseBackground, cellBaseBorder, typography } = props;
      
      return (
        <div
          style={{
            ...getBaseCellStyle(isMobile, cellBaseBackground, cellBaseBorder, typography),
            color: position.sum != null ? COLORS.success : COLORS.text.muted,
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          {position.sum != null ? formatCurrency(position.sum) : "—"}
        </div>
      );
    },
  },
  {
    id: "cost",
    label: "Себестоимость",
    widthMobile: "120px", // Фиксированная ширина на мобильных, добавляется справа для прокрутки
    widthDesktop: "0.75fr",
    visibleOnMobile: false,
    renderHeader: (isMobile, typography) => (
      <div style={getNumericHeaderStyle(isMobile, typography)}>
        Себестоимость
      </div>
    ),
    renderCell: (position, isMobile, props) => {
      const { cellBaseBackground, cellBaseBorder, typography } = props;
      
      return (
        <div
          style={{
            ...getBaseCellStyle(isMobile, cellBaseBackground, cellBaseBorder, typography),
            color: position.cost != null ? COLORS.text.primary : COLORS.text.secondary,
            fontWeight: position.cost != null ? 600 : 400,
            textAlign: "right",
          }}
        >
          {position.cost != null ? formatCurrencyRUB(position.cost) : "—"}
        </div>
      );
    },
  },
];

export const BatchView = ({
  batch,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: BatchViewProps) => {
  const { isMobile } = useBreakpoint();
  const viewRows = toViewRows(batch);
  const mobileVisibleColumns = useMemo(
    () => COLUMNS_CONFIG.filter((column) => column.visibleOnMobile),
    []
  );
  const mobileHiddenColumns = useMemo(
    () => COLUMNS_CONFIG.filter((column) => !column.visibleOnMobile),
    []
  );
  const activeColumns = useMemo(
    () => (isMobile ? [...mobileVisibleColumns, ...mobileHiddenColumns] : COLUMNS_CONFIG),
    [isMobile, mobileHiddenColumns, mobileVisibleColumns]
  );
  const mobileHiddenWidth = useMemo(
    () => mobileHiddenColumns.map((column) => column.widthMobile).join(" + "),
    [mobileHiddenColumns]
  );

  const gridTemplateColumns = useMemo(() => {
    return activeColumns
      .map((column) => (isMobile ? column.widthMobile : column.widthDesktop))
      .join(" ");
  }, [activeColumns, isMobile]);

  // Контент таблицы
  const tableContent = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplateColumns,
        gap: 0,
        minWidth: isMobile && mobileHiddenWidth ? `calc(100% + ${mobileHiddenWidth})` : "100%",
        fontSize: isMobile ? 11 : 12,
      }}
    >
      {/* Заголовки колонок */}
      {activeColumns.map((column) => (
        <Fragment key={column.id}>
          {column.renderHeader(isMobile, typography.tableHeader)}
        </Fragment>
      ))}

      {/* Группы по статусам */}
      {viewRows.map((row) => (
        <Fragment key={row.statusLabel}>
          {/* Заголовок группы */}
          <div
            style={{
              gridColumn: `1 / ${activeColumns.length + 1}`,
              ...CARD_TEMPLATES.dataGroupHeader(isMobile),
              ...typography.tableCell,
              display: "flex",
              alignItems: "center",
              gap: SPACING.sm,
            }}
          >
            <span>{row.statusLabel}</span>
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
              columnsConfig={activeColumns}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          border: `1px solid ${COLORS.border.default}`,
          borderRadius: 14,
          background: "rgba(13,13,16,0.98)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
        >
          {tableContent}
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 22,
            pointerEvents: "none",
            background: "linear-gradient(90deg, rgba(13,13,16,0) 0%, rgba(13,13,16,0.88) 100%)",
          }}
        />
      </div>
    );
  }

  // На десктопе просто оборачиваем в контейнер с border
  return (
    <div
      style={{
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: 16,
        overflow: "hidden",
        background: COLORS.background.card,
      }}
    >
      {tableContent}
    </div>
  );
};
