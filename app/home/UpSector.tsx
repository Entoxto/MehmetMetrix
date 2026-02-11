"use client";

/**
 * UpSector — верхняя панель каркаса.
 * Задаёт фон, рамку и отступы для шапки главной страницы и других экранов.
 * Принимает children и позволяет страницам задавать содержимое шапки.
 */
import type { ReactNode } from "react";
import { HOME_STYLES } from "./styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface HeaderProps {
  children?: ReactNode;
}

export const UpSector = ({ children }: HeaderProps) => {
  const { isMobile } = useBreakpoint();
  const padding = isMobile ? "8px 8px 8px 0" : "8px 24px";

  return (
    <header style={{ ...HOME_STYLES.upSector, padding }}>
      {children}
    </header>
  );
};
