"use client";

/**
 * AppHeader — верхняя панель каркаса.
 * Задаёт фон, рамку и отступы для шапки главной страницы и других экранов.
 * Принимает children и позволяет страницам задавать содержимое шапки.
 */
import type { ReactNode } from "react";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";

interface AppHeaderProps {
  children?: ReactNode;
}

export const AppHeader = ({ children }: AppHeaderProps) => {
  return (
    <header style={APP_SHELL_STYLES.header}>
      {children}
    </header>
  );
};
