"use client";

/**
 * Метка «Размеры на уточнении» для позиций, у которых размеры пока не разбиты.
 * Выполнена в том же ключе, что и SampleTag, но фиолетовым цветом.
 */

import { useState, useEffect } from "react";

export const SizesPendingTag = () => {
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
        background: "rgba(139,92,246,0.12)",
        color: "#A78BFA",
        border: "1px solid rgba(139,92,246,0.35)",
        boxShadow: "0 0 8px rgba(139,92,246,0.22), 0 0 16px rgba(139,92,246,0.10)",
        transition: "all 0.2s ease",
      }}
    >
      Размеры на уточнении
    </span>
  );
};
