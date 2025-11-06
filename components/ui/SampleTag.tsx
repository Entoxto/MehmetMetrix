"use client";

/**
 * Компонент овала "образец"
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { useState, useEffect } from "react";

export const SampleTag = () => {
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

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isNarrowMobile ? "3px 10px" : "4px 12px",
        borderRadius: isNarrowMobile ? 11 : 13,
        fontSize: isNarrowMobile
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
      образец
    </span>
  );
};

