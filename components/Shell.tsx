"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpSector } from "@/app/home/UpSector";
import { DownSector } from "@/app/home/DownSector";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { STYLES, SPACING } from "@/constants/styles";
import { HOME_STYLES } from "@/app/home/styles";

interface ShellProps {
  children: ReactNode;
  title?: string | null;
  subtitle?: string | null;
  backHref?: string;
}

export const Shell = ({ children, title, subtitle, backHref }: ShellProps) => {
  const { isMobile } = useBreakpoint();
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  // If we are at home, we don't show back button unless forced? No, usually not.
  // But if backHref is provided, we show it. 
  // If not provided, and not home, default to "/".
  
  const showBackButton = !isHome || backHref;
  const targetHref = backHref || "/";

  const BackButton = showBackButton ? (
    <Link
      href={targetHref}
      style={{
        textDecoration: "none",
        ...STYLES.button,
        padding: isMobile ? "6px 12px" : STYLES.button.padding,
        fontSize: isMobile ? 11 : STYLES.button.fontSize,
        display: "inline-flex",
        alignItems: "center",
        gap: SPACING.xsPlus,
      }}
    >
      Назад
    </Link>
  ) : null;

  return (
    <div style={HOME_STYLES.container}>
      <UpSector>
        <div style={HOME_STYLES.headerContainer(isMobile)}>
          <div style={HOME_STYLES.headerTopRow(isMobile)}>
            <div style={HOME_STYLES.headerLogoGroup(isMobile)}>
              <span style={HOME_STYLES.headerIcon(isMobile)}>⚡</span>
              <h1 style={HOME_STYLES.headerTitle(isMobile)}>Mehmet Metrics</h1>
            </div>
            {showBackButton && (
              <div style={HOME_STYLES.headerBackSlot(isMobile)}>
                {BackButton}
              </div>
            )}
          </div>
        </div>
      </UpSector>

      {title && (
        <div style={HOME_STYLES.pageHero(isMobile)}>
          <div style={HOME_STYLES.heroContent(isMobile)}>
            <h2 style={HOME_STYLES.heroTitle(isMobile)}>{title}</h2>
            {subtitle && <p style={HOME_STYLES.heroSubtitle(isMobile)}>{subtitle}</p>}
          </div>
        </div>
      )}

      {children}

      <DownSector />
    </div>
  );
};
