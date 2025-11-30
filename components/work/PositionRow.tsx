"use client";

/**
 * Строка позиции внутри партии.
 * Показывает ссылку на товар, размеры, количество, цены и статус.
 * Сохраняет SPA-переход и предотвращает сворачивание партии при клике.
 */

import Link from "next/link";
import { Fragment } from "react";
import { COLORS } from "@/constants/styles";
import { useBreakpoint } from "@/constants/MonitorSize";
import { statusIcon } from "@/lib/format";
import type { Position } from "@/types/domain";
import { SizeChips } from "@/components/ui/SizeChips";
import { SampleTag } from "@/components/ui/SampleTag";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { MouseEvent } from "react";
import type { ColumnConfig } from "./BatchView";

export interface PositionRowProps {
  position: Position;
  batchId?: string;
  onRowHover?: (event: MouseEvent<HTMLDivElement>, isHover: boolean) => void;
  cellBaseBackground: string;
  cellBaseBorder: string;
  typography: {
    tableCell: React.CSSProperties;
  };
  columnsConfig: ColumnConfig[];
}

/**
 * Базовые стили для колонки "position"
 */
const getPositionCellStyle = (
  isMobile: boolean,
  cellBaseBackground: string,
  cellBaseBorder: string
): React.CSSProperties => ({
  padding: isMobile ? "12px 12px 10px 12px" : "18px 18px 14px 18px",
  display: "flex",
  flexDirection: "column",
  gap: isMobile ? 6 : 8,
  borderBottom: `1px solid ${cellBaseBorder}`,
  background: cellBaseBackground,
  transition: "background 0.2s ease, border 0.2s ease",
  overflowWrap: "anywhere",
  minWidth: 0,
  width: "100%",
  boxSizing: "border-box",
});

/**
 * Стили для ссылки на товар
 */
const getProductLinkStyle = (typography: { tableCell: React.CSSProperties }): React.CSSProperties => ({
  ...typography.tableCell,
  color: COLORS.text.primary,
  fontWeight: 600,
  margin: 0,
  padding: 0,
  overflowWrap: "break-word",
  wordBreak: "break-word",
  whiteSpace: "normal",
  hyphens: "auto",
  textDecoration: "none",
  cursor: "pointer",
  lineHeight: typography.tableCell.lineHeight || 1.5,
  display: "block",
  width: "100%",
});

/**
 * Обработчики событий для предотвращения всплытия
 */
const positionEventHandlers = {
  onClick: (event: React.MouseEvent) => event.stopPropagation(),
  onTouchStart: (event: React.TouchEvent) => event.stopPropagation(),
};

export const PositionRow = ({
  position,
  batchId,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
  columnsConfig,
}: PositionRowProps) => {
  const { isMobile } = useBreakpoint();

  const hasSizes = Object.values(position.sizes).some(count => count > 0);

  // клик по названию ведёт на карточку
  const handleLinkClick = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("workScrollY", String(window.scrollY));
    }
  };

  // Рендерим все колонки через конфигурацию
  return (
    <>
      {columnsConfig.map((column) => {
        // Специальная обработка колонки "position"
        if (column.id === "position") {
          return (
            <div
              key={column.id}
              id={`pos-${position.id}`}
              style={{ display: "contents" }}
              onMouseEnter={onRowHover ? (event) => onRowHover(event, true) : undefined}
              onMouseLeave={onRowHover ? (event) => onRowHover(event, false) : undefined}
              {...positionEventHandlers}
            >
              <div style={getPositionCellStyle(isMobile, cellBaseBackground, cellBaseBorder)}>
                {/* Ссылка из 'work' с query from/batch/pos */}
                <Link
                  href={`/product/${position.productId}${batchId ? `?from=work&batch=${batchId}&pos=${position.id}` : "?from=work"}`}
                  prefetch={false}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleLinkClick();
                  }}
                  onTouchStart={(event) => event.stopPropagation()}
                  style={getProductLinkStyle(typography)}
                >
                  {position.title}
                </Link>

                {/* Строка 1: Размеры (если есть) */}
                {hasSizes && (
                  <div style={{ display: "flex", gap: isMobile ? 6 : 8, flexWrap: "wrap" }}>
                    <SizeChips sizes={position.sizes} />
                  </div>
                )}

                {/* Строка 2: Бейджи статусов и образца (под размерами) */}
                {(position.sample || (position.noteEnabled && position.noteText)) && (
                  <div
                    style={{
                      display: "flex",
                      gap: isMobile ? 4 : 6,
                      flexWrap: "wrap",
                      marginTop: hasSizes ? (isMobile ? 2 : 4) : 0, // Отступ только если были размеры
                    }}
                  >
                    {position.sample && <SampleTag />}
                    
                    {position.noteEnabled && position.noteText && (
                      <StatusBadge 
                        kind="info" 
                        icon={statusIcon[position.status]}
                      >
                        {position.noteText}
                      </StatusBadge>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Для остальных колонок используем renderCell из конфигурации
        return (
          <Fragment key={column.id}>
            {column.renderCell(position, isMobile, {
              position,
              batchId,
              onRowHover,
              cellBaseBackground,
              cellBaseBorder,
              typography,
              columnsConfig,
            })}
          </Fragment>
        );
      })}
    </>
  );
};
