import { useState, useEffect } from "react";

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

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

const getInitialBreakpoint = (): BreakpointKey => {
  if (typeof window === "undefined") {
    return "desktop";
  }

  return resolveBreakpoint(window.innerWidth);
};

/**
 * Хук для определения текущего брейкпоинта экрана
 * @returns Объект с текущим брейкпоинтом и флагами для мобильных устройств
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

