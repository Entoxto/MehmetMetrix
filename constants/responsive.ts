import * as React from "react";

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

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<BreakpointKey>(getInitialBreakpoint);

  React.useEffect(() => {
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

export const pickResponsiveValue = <T,>(
  breakpoint: BreakpointKey,
  values: { base: T } & Partial<Record<BreakpointKey, T>>,
): T => {
  return values[breakpoint] ?? values.base;
};


