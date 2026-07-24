"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { APP_SHELL_STYLES } from "@/components/layout/appShellStyles";
import {
  getBackTarget,
  getCurrentRoute,
  popNavigationHistory,
  replaceCurrentWithBackTarget,
  syncNavigationHistory,
} from "@/lib/navigationHistory";

interface AppShellProps {
  children: ReactNode;
  backHref?: string;
  backMode?: "auto" | "explicit";
  updatedAt?: string;
}

export const AppShell = ({
  children,
  backHref,
  backMode = "auto",
  updatedAt,
}: AppShellProps) => {
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
      style={APP_SHELL_STYLES.headerBackButton(isMobile)}
      onClick={handleBackClick}
    >
      <span aria-hidden="true" style={APP_SHELL_STYLES.headerBackIcon(isMobile)}>
        ←
      </span>
      Назад
    </button>
  ) : null;

  return (
    <div style={APP_SHELL_STYLES.container}>
      <AppHeader>
        <div style={APP_SHELL_STYLES.headerContainer(isMobile)}>
          <div style={APP_SHELL_STYLES.headerTopRow(isMobile)}>
            <Link href="/" aria-label="Перейти на главную" style={APP_SHELL_STYLES.headerBrandLink}>
              <div style={APP_SHELL_STYLES.headerLogoGroup(isMobile)}>
                <div aria-hidden="true" style={APP_SHELL_STYLES.brandMark(isMobile)}>
                  <div style={APP_SHELL_STYLES.brandMarkInset(isMobile)}>
                    <span style={APP_SHELL_STYLES.brandMarkText(isMobile)}>MM</span>
                  </div>
                </div>
                <div style={APP_SHELL_STYLES.headerTitleGroup}>
                  <h1 style={APP_SHELL_STYLES.headerTitle(isMobile)}>Mehmet Metrics</h1>
                </div>
              </div>
            </Link>
            {showBackButton && (
              <div style={APP_SHELL_STYLES.headerBackSlot(isMobile)}>
                {BackButton}
              </div>
            )}
          </div>
        </div>
      </AppHeader>

      {children}

      <AppFooter updatedAt={updatedAt} />
    </div>
  );
};
