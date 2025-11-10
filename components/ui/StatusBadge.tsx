"use client";

/**
 * Универсальный бейдж статуса.
 * Показывает капсулу с цветом, иконкой и адаптирует размеры под мобильный.
 */

import { useState, useEffect } from "react";

export type StatusBadgeKind = "default" | "info" | "success" | "warning" | "error";

interface StatusBadgeProps {
  children: React.ReactNode;
  kind?: StatusBadgeKind;
  icon?: string;
}

export const StatusBadge = ({ children, kind = "default", icon }: StatusBadgeProps) => {
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

  const colorMap: Record<StatusBadgeKind, { background: string; text: string; border: string }> = {
    default: {
      background: "rgba(251,191,36,0.15)",
      text: "#fbbf24",
      border: "rgba(251,191,36,0.3)",
    },
    info: {
      background: "rgba(59,130,246,0.15)",
      text: "#3B82F6",
      border: "rgba(59,130,246,0.3)",
    },
    success: {
      background: "rgba(52,211,153,0.15)",
      text: "#34d399",
      border: "rgba(52,211,153,0.3)",
    },
    warning: {
      background: "rgba(251,191,36,0.15)",
      text: "#fbbf24",
      border: "rgba(251,191,36,0.3)",
    },
    error: {
      background: "rgba(248,113,113,0.15)",
      text: "#f87171",
      border: "rgba(248,113,113,0.3)",
    },
  };

  const colors = colorMap[kind];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isNarrowMobile ? 4 : 6,
        borderRadius: isNarrowMobile ? 12 : 14,
        padding: isNarrowMobile ? "3px 8px" : "4px 10px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "clip",
        background: colors.background,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        transition: "all 0.2s ease",
      }}
    >
      {icon && (
        <span
          style={{
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
          fontSize: isNarrowMobile ? "clamp(10px, 2vw, 11px)" : "clamp(11px, 0.9vw, 12px)",
          fontWeight: 600,
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        {children}
      </span>
    </span>
  );
};

