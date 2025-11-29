"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpSector } from "@/app/home/UpSector";
import { DownSector } from "@/app/home/DownSector";
import styles from "./Shell.module.css";

interface ShellProps {
  children: ReactNode;
  title?: string | null;
  subtitle?: string | null;
  backHref?: string;
}

export const Shell = ({ children, title, subtitle, backHref }: ShellProps) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const showBackButton = !isHome || Boolean(backHref);
  const targetHref = backHref || "/";
  return (
    <div className={styles.container}>
      <ShellHeader showBackButton={showBackButton} backHref={targetHref} />

      <div className={styles.content}>
        <PageHero title={title} subtitle={subtitle} />

        {children}
      </div>

      <DownSector />
    </div>
  );
};

interface ShellHeaderProps {
  showBackButton: boolean;
  backHref: string;
}

const ShellHeader = ({ showBackButton, backHref }: ShellHeaderProps) => (
  <UpSector>
    <div className={styles.headerContainer}>
      <div className={styles.headerTopRow}>
        <div className={styles.logoGroup}>
          <span className={styles.headerIcon}>⚡</span>
          <h1 className={styles.headerTitle}>Mehmet Metrics</h1>
        </div>
        {showBackButton && (
          <div className={styles.headerBackSlot}>
            <Link href={backHref} className={styles.backButton}>
              Назад
            </Link>
          </div>
        )}
      </div>
    </div>
  </UpSector>
);

const PageHero = ({
  title,
  subtitle,
}: Pick<ShellProps, "title" | "subtitle">) => {
  if (!title) return null;

  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <h2 className={styles.heroTitle}>{title}</h2>
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};
