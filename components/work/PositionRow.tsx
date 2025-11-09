"use client";

/**
 * Компонент для отображения одной позиции
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import Link from "next/link";
import { COLORS, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import { formatCurrency, statusIcon, statusLabel } from "@/lib/format";
import { PositionStatus } from "@/types/domain";
import { SizeChips } from "@/components/ui/SizeChips";
import { SampleTag } from "@/components/ui/SampleTag";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Position } from "@/types/domain";
import type { MouseEvent } from "react";

interface PositionRowProps {
  position: Position;
  batchId?: string;
  onRowHover?: (event: MouseEvent<HTMLDivElement>, isHover: boolean) => void;
  cellBaseBackground: string;
  cellBaseBorder: string;
  typography: {
    tableCell: React.CSSProperties;
  };
}

export const PositionRow = ({
  position,
  batchId,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: PositionRowProps) => {
  const { isMobile } = useBreakpoint();

  const hasSizes = Object.values(position.sizes).some(count => count > 0);
  const qtyLabel = position.sample ? `${position.qty} шт.` : `${position.qty} шт.`;

  // клик по названию ведёт на карточку
  const handleLinkClick = () => {
    // Сохраняем позицию скролла перед переходом
    if (typeof window !== "undefined") {
      sessionStorage.setItem("workScrollY", String(window.scrollY));
    }
    // Не блокируем переход
  };

  return (
    <>
      {/* Ячейка с названием, размерами и бейджами */}
      <div
        id={`pos-${position.id}`}
        style={{ display: "contents" }}
        onMouseEnter={onRowHover ? (event) => onRowHover(event, true) : undefined}
        onMouseLeave={onRowHover ? (event) => onRowHover(event, false) : undefined}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <div
          style={{
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
          }}
        >
          {/* Ссылка из 'work' с query from/batch/pos */}
          <Link
            href={`/catalog/${position.productId}${batchId ? `?from=work&batch=${batchId}&pos=${position.id}` : "?from=work"}`}
            prefetch={false}
            onClick={(event) => {
              event.stopPropagation();
              handleLinkClick();
            }}
            onTouchStart={(event) => event.stopPropagation()}
            style={{
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
            }}
          >
            {position.title}
          </Link>

          {/* Первая строка: размеры или "образец" */}
          <div style={{ display: "flex", gap: isMobile ? 6 : 8, flexWrap: "wrap" }}>
            {hasSizes ? (
              <SizeChips sizes={position.sizes} />
            ) : position.sample ? (
              <SampleTag />
            ) : null}
          </div>

          {/* Вторая строка: подпись-статус (капсула) - только если noteEnabled */}
          {position.noteEnabled && position.noteText && (
            <div
              style={{
                display: "flex",
                gap: isMobile ? 4 : 6,
                flexWrap: "wrap",
                marginTop: isMobile ? 6 : 8,
              }}
            >
              <StatusBadge 
                kind="info" 
                icon={statusIcon[position.status]}
              >
                {position.noteText}
              </StatusBadge>
            </div>
          )}
        </div>
      </div>

      {/* Ячейка с количеством */}
      <div
        style={{
          padding: isMobile ? "8px 8px" : "12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${cellBaseBorder}`,
          ...typography.tableCell,
          fontWeight: 600,
          color: COLORS.text.primary,
          background: cellBaseBackground,
          cursor: "pointer",
          transition: "background 0.2s ease, border 0.2s ease",
          margin: 0,
        }}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {qtyLabel}
      </div>

      {/* Ячейка с ценой */}
      <div
        style={{
          padding: isMobile ? "8px 8px" : "12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${cellBaseBorder}`,
          ...typography.tableCell,
          color: position.price != null ? COLORS.text.primary : COLORS.primary,
          fontWeight: position.price != null ? 600 : 500,
          background: cellBaseBackground,
          cursor: "pointer",
          transition: "background 0.2s ease, border 0.2s ease",
          margin: 0,
        }}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {position.price != null ? formatCurrency(position.price) : "уточняется"}
      </div>

      {/* Ячейка с суммой */}
      <div
        style={{
          padding: isMobile ? "8px 8px" : "12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${cellBaseBorder}`,
          ...typography.tableCell,
          color: position.sum != null ? COLORS.success : COLORS.primary,
          fontWeight: 700,
          background: cellBaseBackground,
          cursor: "pointer",
          transition: "background 0.2s ease, border 0.2s ease",
          margin: 0,
          textAlign: "right",
        }}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {position.sum != null ? formatCurrency(position.sum) : "—"}
      </div>
    </>
  );
};

