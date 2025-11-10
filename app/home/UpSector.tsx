"use client";

/**
 * UpSector — верхняя панель каркаса.
 * Задаёт фон, рамку и отступы для шапки главной страницы и других экранов.
 * Принимает children и позволяет страницам задавать содержимое шапки.
 */
import type { ReactNode } from "react";
import { COLORS, SPACING } from "@/constants/styles";

interface HeaderProps {
  children?: ReactNode;
}

export const UpSector = ({ children }: HeaderProps) => (
  <header
    style={{
      display: "grid",
      gridTemplateColumns: "1fr",
      alignItems: "center",
      padding: "8px 16px",
      borderBottom: `1px solid rgba(102,102,102,0.2)`,
      background: COLORS.background.header,
      backdropFilter: "blur(10px)",
      gap: SPACING.sm,
    }}
  >
    {children}
  </header>
);

