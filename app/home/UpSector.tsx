"use client";

/**
 * UpSector — верхняя панель каркаса.
 * Задаёт фон, рамку и отступы для шапки главной страницы и других экранов.
 * Принимает children и позволяет страницам задавать содержимое шапки.
 */
import type { ReactNode } from "react";
import { HOME_STYLES } from "./styles";

interface HeaderProps {
  children?: ReactNode;
}

export const UpSector = ({ children }: HeaderProps) => (
  <header style={HOME_STYLES.upSector}>
    {children}
  </header>
);
