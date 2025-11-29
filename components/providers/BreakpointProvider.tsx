"use client";

import { useState, useEffect, type ReactNode } from "react";
import { BreakpointContext } from "@/contexts/BreakpointContext";
import { resolveBreakpoint, type BreakpointKey } from "@/lib/breakpoints";

interface BreakpointProviderProps {
  initialBreakpoint: BreakpointKey;
  children: ReactNode;
}

export const BreakpointProvider = ({ initialBreakpoint, children }: BreakpointProviderProps) => {
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>(initialBreakpoint);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueries = [
      window.matchMedia(`(min-width: 1280px)`),
      window.matchMedia(`(min-width: 1024px)`),
      window.matchMedia(`(min-width: 768px)`),
    ];

    const update = () => {
      const next = resolveBreakpoint(window.innerWidth);
      setBreakpoint((current) => (current === next ? current : next));
    };

    const handleChange = () => requestAnimationFrame(update);

    update();
    mediaQueries.forEach((query) => query.addEventListener("change", handleChange));

    return () => {
      mediaQueries.forEach((query) =>
        query.removeEventListener("change", handleChange)
      );
    };
  }, []);

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
};


