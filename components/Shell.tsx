"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpSector } from "@/app/home/UpSector";
import { DownSector } from "@/app/home/DownSector";
import { useBreakpoint } from "@/constants/MonitorSize";
import { STYLES } from "@/constants/styles";
import { HOME_STYLES } from "@/app/home/styles";

interface ShellProps {
  children: ReactNode;
  title?: string | null;
  backHref?: string;
}

export const Shell = ({ children, title, backHref }: ShellProps) => {
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
        gap: 6,
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
            {isMobile && BackButton}
          </div>

          {!isMobile && (
            <>
              {title ? (
                <div style={HOME_STYLES.categoryTitleContainer}>
                  <h2 style={HOME_STYLES.categoryTitle}>{title}</h2>
                </div>
              ) : (
                <div />
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                {BackButton}
              </div>
            </>
          )}
        </div>
        {isMobile && title && (
          <div style={HOME_STYLES.mobileCategoryHeader}>
            <h2 style={HOME_STYLES.mobileCategoryTitle}>{title}</h2>
          </div>
        )}
      </UpSector>

      {children}

      <DownSector />
    </div>
  );
};
