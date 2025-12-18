"use client";

/**
 * Таблица партии в разделе «Работа».
 * Группирует позиции по статусам и рендерит строки через PositionRow.
 * Поддерживает наведение для подсветки строк на десктопе.
 * Поддерживает горизонтальную прокрутку на мобильных устройствах.
 */

import { Fragment, useMemo } from "react";
import { COLORS, CARD_TEMPLATES, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
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
export interface ColumnConfig {
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
  cursor: "pointer",
  transition: "background 0.2s ease, border 0.2s ease",
  margin: 0,
});

/**
 * Обработчики событий для ячеек (предотвращают всплытие)
 */
const cellEventHandlers = {
  onClick: (event: React.MouseEvent) => event.stopPropagation(),
  onTouchStart: (event: React.TouchEvent) => event.stopPropagation(),
};

/**
 * Создает стили для заголовка числовой колонки
 */
const getNumericHeaderStyle = (isMobile: boolean, typography: React.CSSProperties): React.CSSProperties => ({
  ...CARD_TEMPLATES.tableValue(isMobile, "center"),
  ...typography,
  textTransform: "uppercase",
});

/**
 * Конфигурация всех колонок таблицы
 */
export const COLUMNS_CONFIG: ColumnConfig[] = [
  {
    id: "position",
    label: "Позиция",
    widthMobile: "1.8fr", // Уменьшена с 2.2fr, чтобы все 4 колонки поместились в 100% ширины
    widthDesktop: "2.2fr",
    visibleOnMobile: true,
    renderHeader: (isMobile, typography) => (
      <div
        style={{
          ...CARD_TEMPLATES.tableHeader(isMobile),
          ...typography,
        }}
      >
        Позиция
      </div>
    ),
    renderCell: () => null, // Колонка "position" рендерится отдельно в PositionRow
  },
  {
    id: "quantity",
    label: "Кол-во",
    widthMobile: "0.55fr", // Сохраняем пропорции
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
          {...cellEventHandlers}
        >
          {qtyLabel}
        </div>
      );
    },
  },
  {
    id: "price",
    label: "Цена",
    widthMobile: "0.55fr", // Сохраняем пропорции
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
            color: position.price != null ? COLORS.text.primary : COLORS.primary,
            fontWeight: position.price != null ? 600 : 500,
          }}
          {...cellEventHandlers}
        >
          {position.price != null ? formatCurrency(position.price) : "уточняется"}
        </div>
      );
    },
  },
  {
    id: "sum",
    label: "Сумма",
    widthMobile: "0.55fr", // Сохраняем пропорции
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
            color: position.sum != null ? COLORS.success : COLORS.primary,
            fontWeight: 700,
            textAlign: "right",
          }}
          {...cellEventHandlers}
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
          {...cellEventHandlers}
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

  // Вычисляем gridTemplateColumns на основе конфигурации
  // На мобильных: видимые колонки (1.8fr 0.55fr 0.55fr 0.55fr = 3.45fr) занимают 100% ширины
  // Скрытая колонка (120px) добавляется справа для прокрутки
  // На десктопе: все колонки видны сразу
  const gridTemplateColumns = useMemo(() => {
    if (isMobile) {
      // На мобильных: видимые колонки используют fr единицы, скрытая - фиксированная ширина
      const visibleColumns = COLUMNS_CONFIG.filter(col => col.visibleOnMobile);
      const hiddenColumns = COLUMNS_CONFIG.filter(col => !col.visibleOnMobile);
      const visibleWidths = visibleColumns.map(col => col.widthMobile).join(" ");
      const hiddenWidths = hiddenColumns.map(col => col.widthMobile).join(" ");
      return `${visibleWidths} ${hiddenWidths}`;
    } else {
      // На десктопе: все колонки
      return COLUMNS_CONFIG.map(col => col.widthDesktop).join(" ");
    }
  }, [isMobile]);

  // Контент таблицы
  const tableContent = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplateColumns,
        gap: 0,
        // На мобильных: видимые колонки (fr единицы) занимают 100% ширины экрана
        // Скрытая колонка (120px) добавляется справа для прокрутки
        // Используем calc для вычисления минимальной ширины: 100% + 120px
        minWidth: isMobile ? "calc(100% + 120px)" : "auto",
        fontSize: isMobile ? 11 : 12,
      }}
    >
      {/* Заголовки колонок */}
      {COLUMNS_CONFIG.map((column) => (
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
              gridColumn: `1 / ${COLUMNS_CONFIG.length + 1}`,
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
              columnsConfig={COLUMNS_CONFIG}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );

  // На мобильных оборачиваем в scrollable контейнер
  if (isMobile) {
    return (
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch", // Плавная прокрутка на iOS
          border: `1px solid ${COLORS.border.default}`,
          borderRadius: 12,
        }}
      >
        {tableContent}
      </div>
    );
  }

  // На десктопе просто оборачиваем в контейнер с border
  return (
    <div
      style={{
        border: `1px solid ${COLORS.border.default}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {tableContent}
    </div>
  );
};

