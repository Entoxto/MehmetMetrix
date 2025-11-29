"use client";

/**
 * DownSector — нижняя панель каркаса.
 * Даёт общий подвал с дефолтным текстом и принимает children для кастомизации.
 */
import type { ReactNode } from "react";
import styles from "@/components/Shell.module.css";

interface FooterProps {
  children?: ReactNode;
}

export const DownSector = ({ children }: FooterProps) => (
  <footer className={styles.footer}>
    {children ?? <>Сделано с любовью и лёгким запахом кожи © {new Date().getFullYear()}</>}
  </footer>
);

