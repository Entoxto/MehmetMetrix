"use client";

import { useState, useEffect } from "react";

/**
 * Интерфейс для компонента капсулы статуса
 */
interface StatusTagProps {
  text: string; // Текст статуса
  icon?: string; // Иконка (опционально)
  color: {
    background: string;
    text: string;
    border: string;
  };
}

/**
 * Единый компонент капсулы статуса для всех партий и статусов
 * Адаптивно уменьшает шрифт, чтобы текст всегда помещался в одну строку
 */
export const StatusTag = ({ text, icon, color }: StatusTagProps) => {
  const [isNarrowMobile, setIsNarrowMobile] = useState(false);

  // Определяем, является ли экран узким мобильным (≤430px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkNarrow = () => {
      setIsNarrowMobile(window.innerWidth <= 430);
    };
    
    checkNarrow();
    window.addEventListener("resize", checkNarrow);
    
    return () => window.removeEventListener("resize", checkNarrow);
  }, []);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center", // Текст выровнен строго по центру по вертикали
        gap: isNarrowMobile ? 4 : 6,
        // Размеры и паддинги капсулы StatusTag уменьшены под новый компактный стиль
        // Border-radius пропорционально уменьшенной высоте (меньше, чем у чипов размеров)
        borderRadius: isNarrowMobile ? 12 : 14,
        // Mobile (≤430px): padding: 3px 8px; Desktop: padding: 4px 10px
        // Высота чуть ниже, чем у чипа "XS × 3" (примерно на 15-20%)
        padding: isNarrowMobile ? "3px 8px" : "4px 10px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "clip",
        background: color.background,
        color: color.text,
        border: `1px solid ${color.border}`,
        transition: "all 0.2s ease",
      }}
    >
      {icon && (
        <span
          style={{
            // Mobile (≤430px): icon-size: 12px; Desktop: icon-size: 14px
            fontSize: isNarrowMobile ? 12 : 14,
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          // Где зашиты clamp-значения для шрифта капсулы: font-size с clamp для адаптивности
          // Mobile (≤430px): clamp(10px, 2vw, 11px); Desktop: clamp(11px, 0.9vw, 12px)
          fontSize: isNarrowMobile ? "clamp(10px, 2vw, 11px)" : "clamp(11px, 0.9vw, 12px)",
          fontWeight: 600,
          letterSpacing: 0.5,
          lineHeight: 1, // Межстрочный интервал не увеличивать — текст должен быть "плотнее" в пузыре
        }}
      >
        {text}
      </span>
    </span>
  );
};

