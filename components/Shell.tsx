"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpSector } from "@/app/home/UpSector";
import { DownSector } from "@/app/home/DownSector";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { HOME_STYLES } from "@/app/home/styles";

interface ShellProps {
  children: ReactNode;
  backHref?: string;
  updatedAt?: string;
}

export const Shell = ({ children, backHref, updatedAt }: ShellProps) => {
  const { isMobile } = useBreakpoint();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const showBackButton = !isHome || backHref;
  const targetHref = backHref || "/";

  const BackButton = showBackButton ? (
    <Link
      href={targetHref}
      aria-label="Вернуться назад"
      style={HOME_STYLES.headerBackButton(isMobile)}
    >
      <span aria-hidden="true" style={HOME_STYLES.headerBackIcon(isMobile)}>
        ←
      </span>
      Назад
    </Link>
  ) : null;

  return (
    <div style={HOME_STYLES.container}>
      <UpSector>
        <div style={HOME_STYLES.headerContainer(isMobile)}>
          <div style={HOME_STYLES.headerTopRow(isMobile)}>
            <div style={HOME_STYLES.headerLogoGroup(isMobile)}>
              <div aria-hidden="true" style={HOME_STYLES.brandMark(isMobile)}>
                <div style={HOME_STYLES.brandMarkInset(isMobile)}>
                  <span style={HOME_STYLES.brandMarkText(isMobile)}>MM</span>
                </div>
              </div>
              <div style={HOME_STYLES.headerTitleGroup}>
                <h1 style={HOME_STYLES.headerTitle(isMobile)}>Mehmet Metrics</h1>
              </div>
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

      <DownSector updatedAt={updatedAt} />
    </div>
  );
};
