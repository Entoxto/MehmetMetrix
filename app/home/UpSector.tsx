"use client";

/**
 * UpSector — верхняя панель каркаса.
 * Задаёт фон, рамку и отступы для шапки главной страницы и других экранов.
 * Принимает children и позволяет страницам задавать содержимое шапки.
 */
import type { ReactNode } from "react";
import styles from "@/components/Shell.module.css";

interface HeaderProps {
  children?: ReactNode;
}

export const UpSector = ({ children }: HeaderProps) => {
  return <header className={styles.topBar}>{children}</header>;
};
