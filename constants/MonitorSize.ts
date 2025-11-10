/**
 * Здесь лежат пороги ширины экрана для адаптации под размер экрана.
 * Функция вычисляет, мобильный сейчас экран или десктоп,
 * чтобы компоненты могли подобрать подходящие стили.
 */
"use client";

import { useState, useEffect } from "react";

// Определяет границы для мобильного, планшета, ноутбука и настольного компьютера
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Определяем, в какой диапазон попадает ширина экрана устройства
const resolveBreakpoint = (width: number): BreakpointKey => {
  if (width < BREAKPOINTS.tablet) {
    return "mobile";
  }

  if (width < BREAKPOINTS.laptop) {
    return "tablet";
  }

  if (width < BREAKPOINTS.desktop) {
    return "laptop";
  }

  return "desktop";
};

// Нужно для сервера, так как у него нет экрана
const getInitialBreakpoint = (): BreakpointKey => {
  if (typeof window === "undefined") {
    return "desktop";
  }

  return resolveBreakpoint(window.innerWidth);
};

/**
 * Следит за шириной окна и сообщает компонентам подходящий тип экрана
 * Внутри вызывает resolveBreakpoint и возвращает флаги для мобильных устройств
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>(getInitialBreakpoint);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setBreakpoint(resolveBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isLaptop: breakpoint === "laptop",
    isDesktop: breakpoint === "desktop",
  } as const;
};

