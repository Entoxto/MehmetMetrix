"use client";

/**
 * Хук для определения текущего брейкпоинта экрана.
 * Возвращает текущий breakpoint и удобные флаги (isMobile, isTablet и т.д.)
 */

import { useContext } from "react";
import { BreakpointContext } from "@/contexts/BreakpointContext";
import type { BreakpointKey } from "@/lib/breakpoints";

export const useBreakpoint = () => {
  const breakpoint = useContext(BreakpointContext);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isLaptop: breakpoint === "laptop",
    isDesktop: breakpoint === "desktop",
  } as const;
};

export type { BreakpointKey };







