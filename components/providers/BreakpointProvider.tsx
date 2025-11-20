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

    const update = () => {
      setBreakpoint(resolveBreakpoint(window.innerWidth));
    };

    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
};


