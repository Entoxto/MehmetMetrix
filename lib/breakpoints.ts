export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export const resolveBreakpoint = (width: number): BreakpointKey => {
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

export const detectBreakpointFromUserAgent = (userAgent?: string | null): BreakpointKey => {
  if (!userAgent) {
    return "desktop";
  }

  const ua = userAgent.toLowerCase();

  if (/\b(ipad|tablet)\b/.test(ua)) {
    return "tablet";
  }

  if (/\b(mobile|iphone|ipod|android)\b/.test(ua)) {
    return "mobile";
  }

  return "desktop";
};


