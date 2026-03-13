"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UpSector } from "@/app/home/UpSector";
import { DownSector } from "@/app/home/DownSector";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { HOME_STYLES } from "@/app/home/styles";
import {
  getBackTarget,
  getCurrentRoute,
  popNavigationHistory,
  replaceCurrentWithBackTarget,
  syncNavigationHistory,
} from "@/lib/navigationHistory";

interface ShellProps {
  children: ReactNode;
  backHref?: string;
  backMode?: "auto" | "explicit";
  updatedAt?: string;
}

export const Shell = ({ children, backHref, backMode = "auto", updatedAt }: ShellProps) => {
  const { isMobile } = useBreakpoint();
  const pathname = usePathname();
  const router = useRouter();
  const lastSyncedRouteRef = useRef<string>("");
  const isHome = pathname === "/";
  const showBackButton = !isHome || backHref;

  useEffect(() => {
    const currentRoute = getCurrentRoute();
    if (lastSyncedRouteRef.current === currentRoute) return;

    lastSyncedRouteRef.current = currentRoute;
    syncNavigationHistory(currentRoute);
  });

  const handleBackClick = useCallback(() => {
    const currentRoute = getCurrentRoute();

    if (backMode === "explicit" && backHref) {
      replaceCurrentWithBackTarget(currentRoute, backHref);
      router.push(backHref);
      return;
    }

    const backTarget = getBackTarget(currentRoute);
    if (backTarget && backTarget !== currentRoute) {
      popNavigationHistory(currentRoute);
      router.push(backTarget);
      return;
    }

    const fallbackHref = backHref || "/";
    replaceCurrentWithBackTarget(currentRoute, fallbackHref);
    router.push(fallbackHref);
  }, [backHref, backMode, router]);

  const BackButton = showBackButton ? (
    <button
      type="button"
      aria-label="Вернуться назад"
      style={HOME_STYLES.headerBackButton(isMobile)}
      onClick={handleBackClick}
    >
      <span aria-hidden="true" style={HOME_STYLES.headerBackIcon(isMobile)}>
        ←
      </span>
      Назад
    </button>
  ) : null;

  return (
    <div style={HOME_STYLES.container}>
      <UpSector>
        <div style={HOME_STYLES.headerContainer(isMobile)}>
          <div style={HOME_STYLES.headerTopRow(isMobile)}>
            <Link href="/" aria-label="Перейти на главную" style={HOME_STYLES.headerBrandLink}>
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
            </Link>
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
