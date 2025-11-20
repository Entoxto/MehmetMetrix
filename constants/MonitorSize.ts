/**
 * Здесь лежат пороги ширины экрана для адаптации под размер экрана.
 * Функция вычисляет, мобильный сейчас экран или десктоп,
 * чтобы компоненты могли подобрать подходящие стили.
 */
"use client";

import { useContext } from "react";
import { BreakpointContext } from "@/contexts/BreakpointContext";
import type { BreakpointKey } from "@/lib/breakpoints";
export { BREAKPOINTS, resolveBreakpoint, detectBreakpointFromUserAgent } from "@/lib/breakpoints";

/**
 * Возвращает текущий breakpoint из контекста и полезные флаги.
 * Само отслеживание размеров находится в BreakpointProvider.
 */
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


