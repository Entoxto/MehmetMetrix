"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpSector } from "@/app/home/UpSector";
import { DownSector } from "@/app/home/DownSector";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { STYLES, SPACING, COLORS } from "@/constants/styles";
import { HOME_STYLES } from "@/app/home/styles";

interface ShellProps {
  children: ReactNode;
  backHref?: string;
}

export const Shell = ({ children, backHref }: ShellProps) => {
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
        padding: isMobile ? "8px 12px" : STYLES.button.padding,
        fontSize: isMobile ? 11 : STYLES.button.fontSize,
        display: "inline-flex",
        alignItems: "center",
        gap: SPACING.xsPlus,
        color: COLORS.text.primary,
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

      {children}

      <DownSector />
    </div>
  );
};
