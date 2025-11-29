"use client";

import { useState, useEffect, type ReactNode } from "react";
import { BreakpointContext } from "@/contexts/BreakpointContext";
import { resolveBreakpoint, type BreakpointKey } from "@/lib/breakpoints";

interface BreakpointProviderProps {
  initialBreakpoint: BreakpointKey;
  children: ReactNode;
}

/**
 * Throttle функция - ограничивает частоту вызовов
 */
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - timeSinceLastCall);
    }
  };
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

    // Первоначальное обновление
    update();

    // Throttled версия для resize событий (обновление максимум раз в 100ms)
    const throttledUpdate = throttle(update, 100);

    window.addEventListener("resize", throttledUpdate);

    return () => {
      window.removeEventListener("resize", throttledUpdate);
    };
  }, []);

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
};


