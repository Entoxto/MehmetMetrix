"use client";

import { useState, useEffect } from "react";
import { COLORS, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import { formatCurrency } from "@/lib/utils";
import { StatusTag } from "@/components/StatusTag";
import type { MouseEvent } from "react";

/**
 * Интерфейс для позиции в партии
 */
interface PositionRowItem {
  id: string;
  productId: string;
  name: string;
  sizeLabels: string[];
  quantityLabel: string;
  price: number | null;
  total: number | null;
  hasPrice: boolean;
  note?: string;
  paidPreviously?: boolean;
  noPayment?: boolean;
  inTransit?: boolean;
  showStatusTag?: boolean; // Флаг для отображения подписи-статуса
}

interface PositionRowProps {
  item: PositionRowItem;
  onProductClick: (productId: string) => void;
  onRowHover?: (event: MouseEvent<HTMLDivElement>, isHover: boolean) => void;
  cellBaseBackground: string;
  cellBaseBorder: string;
  typography: {
    tableCell: React.CSSProperties;
  };
}

/**
 * Единый компонент для отображения позиции в партии
 * Используется всеми партиями для единообразного рендеринга
 */
export const PositionRow = ({
  item,
  onProductClick,
  onRowHover,
  cellBaseBackground,
  cellBaseBorder,
  typography,
}: PositionRowProps) => {
  const { isMobile } = useBreakpoint();
  
  // Определяем, является ли экран узким мобильным (≤430px)
  // Используем useState для отслеживания ширины экрана
  const [isNarrowMobile, setIsNarrowMobile] = useState(false);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkNarrow = () => {
      setIsNarrowMobile(window.innerWidth <= 430);
    };
    
    checkNarrow();
    window.addEventListener("resize", checkNarrow);
    
    return () => window.removeEventListener("resize", checkNarrow);
  }, []);

  // Определяем, нужно ли показывать бейджи статусов
  // Показываем только если showStatusTag = true и есть что показать (note или inTransit)
  // Правило: showStatusTag = true и есть status (note или inTransit)
  const shouldShowStatusTags = item.showStatusTag && (item.note || item.inTransit);

  return (
    <>
      {/* Ячейка с названием, размерами и бейджами */}
      <div
        style={{ display: "contents" }}
        role="button"
        tabIndex={0}
        onClick={() => onProductClick(item.productId)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onProductClick(item.productId);
          }
        }}
        onMouseEnter={onRowHover ? (event) => onRowHover(event, true) : undefined}
        onMouseLeave={onRowHover ? (event) => onRowHover(event, false) : undefined}
      >
        <div
          style={{
            padding: isMobile ? "12px 12px 10px 12px" : "18px 18px 14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 6 : 8,
            borderBottom: `1px solid ${cellBaseBorder}`,
            background: cellBaseBackground,
            cursor: "pointer",
            transition: "background 0.2s ease, border 0.2s ease",
            // Убираем ограничения width/maxWidth - grid сам управляет шириной колонки
            overflowWrap: "anywhere", // Для корректного переноса длинных слов
          }}
        >
          {/* Название изделия */}
          <div
            style={{
              ...typography.tableCell,
              color: COLORS.text.primary,
              fontWeight: 600,
              margin: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "normal",
              hyphens: "auto",
            }}
          >
            {item.name}
          </div>

          {/* Первая строка: размеры или "образец" */}
          {/* Если showStatusTag = true и есть "образец", он будет на первой строке, а "уже в пути" под ним */}
          {/* Где включён flex-wrap для размеров: display: flex с flexWrap: "wrap" для переноса размеров */}
          <div style={{ display: "flex", gap: isMobile ? 6 : 8, flexWrap: "wrap" }}>
            {item.sizeLabels.length > 0 ? (
              // Если есть размеры, показываем их
              item.sizeLabels.map((label, labelIndex) => (
                <span
                  key={labelIndex}
                  style={{
                    ...STYLES.sizeBadge,
                    fontSize: isMobile ? 10 : 12,
                    padding: isMobile ? "3px 8px" : "4px 10px",
                  }}
                >
                  {label}
                </span>
              ))
            ) : item.note === "образец" ? (
              // Если нет размеров, но есть "образец", показываем "образец" на первой строке
              // (даже если showStatusTag = true, "образец" на первой строке, а "уже в пути" под ним)
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // Подогнана высота и радиус кнопки "Образец" под пропорции чипов размеров
                  // Mobile (≤430px): padding: 3px 10px, border-radius: 10-12px
                  // Desktop: padding: 4px 12px, border-radius: 12-14px
                  // Высота равна чипам размеров (3px 8px / 4px 10px), но чуть шире по горизонтали
                  padding: isNarrowMobile ? "3px 10px" : isMobile ? "3px 10px" : "4px 12px",
                  borderRadius: isNarrowMobile ? 11 : isMobile ? 11 : 13,
                  // Mobile (≤430px): font-size: clamp(11px, 2.2vw, 12px)
                  // Desktop: font-size: clamp(12px, 1vw, 13px)
                  fontSize: isNarrowMobile
                    ? "clamp(11px, 2.2vw, 12px)"
                    : isMobile
                      ? "clamp(11px, 2.2vw, 12px)"
                      : "clamp(12px, 1vw, 13px)",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  lineHeight: 1,
                  background: "rgba(59,130,246,0.1)",
                  color: "#3B82F6",
                  border: "1px solid rgba(59,130,246,0.3)",
                  boxShadow: "0 0 8px rgba(59,130,246,0.3), 0 0 16px rgba(59,130,246,0.15)",
                  transition: "all 0.2s ease",
                }}
              >
                {item.note}
              </span>
            ) : null}
          </div>

          {/* Вторая строка: подпись-статус (капсула) - всегда слева, отступ 6-8px (только если showStatusTag = true) */}
          {/* Читаем флаг showStatusTag: если true и есть status (note или inTransit), показываем подпись-статус */}
          {shouldShowStatusTags && (
            <div
              style={{
                display: "flex",
                gap: isNarrowMobile ? 6 : isMobile ? 4 : 6,
                flexWrap: "wrap",
                marginTop: isMobile ? 6 : 8, // Отступ 6-8px между размерами и бейджами
              }}
            >
              {/* Бейдж для note (оплачено ранее, вернулись после ремонта и т.д.) */}
              {/* Если есть и "образец" и "уже в пути", "образец" на первой строке, а "уже в пути" здесь */}
              {/* Используем единый компонент StatusTag для всех статусов */}
              {item.note && item.note !== "образец" && (
                <StatusTag
                  text={item.note}
                  color={{
                    background:
                      item.paidPreviously || item.noPayment
                        ? "rgba(52,211,153,0.15)"
                        : "rgba(251,191,36,0.15)",
                    text: item.paidPreviously || item.noPayment ? COLORS.success : COLORS.primary,
                    border:
                      item.paidPreviously || item.noPayment
                        ? "rgba(52,211,153,0.3)"
                        : "rgba(251,191,36,0.3)",
                  }}
                />
              )}

              {/* Бейдж "уже в пути" для статуса inTransit - показывается ПОД "образец" */}
              {/* Используем единый компонент StatusTag для всех статусов */}
              {item.inTransit && (
                <StatusTag
                  text="уже в пути"
                  icon="🚚"
                  color={{
                    background: "rgba(52,211,153,0.15)",
                    text: COLORS.success,
                    border: "rgba(52,211,153,0.3)",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ячейка с количеством */}
      <div
        style={{
          padding: isMobile ? "12px 12px 10px 12px" : "18px 18px 14px 18px",
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
      >
        {item.quantityLabel}
      </div>

      {/* Ячейка с ценой */}
      <div
        style={{
          padding: isMobile ? "12px 12px 10px 12px" : "18px 18px 14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${cellBaseBorder}`,
          ...typography.tableCell,
          color: item.hasPrice ? COLORS.text.primary : COLORS.primary,
          fontWeight: item.hasPrice ? 600 : 500,
          background: cellBaseBackground,
          cursor: "pointer",
          transition: "background 0.2s ease, border 0.2s ease",
          margin: 0,
        }}
      >
        {item.hasPrice && item.price != null ? formatCurrency(item.price) : "уточняется"}
      </div>

      {/* Ячейка с суммой */}
      <div
        style={{
          padding: isMobile ? "12px 12px 10px 12px" : "18px 18px 14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${cellBaseBorder}`,
          ...typography.tableCell,
          color: item.total != null ? COLORS.success : COLORS.primary,
          fontWeight: 700,
          background: cellBaseBackground,
          cursor: "pointer",
          transition: "background 0.2s ease, border 0.2s ease",
          margin: 0,
          textAlign: "right",
        }}
      >
        {item.total != null ? formatCurrency(item.total) : "—"}
      </div>
    </>
  );
};

