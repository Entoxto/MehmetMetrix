"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { BreakpointContext } from "@/components/providers/BreakpointContext";
import { resolveBreakpoint, type BreakpointKey } from "@/lib/breakpoints";

interface BreakpointProviderProps {
  initialBreakpoint: BreakpointKey;
  children: ReactNode;
}

/**
 * Throttle функция - ограничивает частоту вызовов
 */
type ThrottledCallback = (() => void) & { cancel: () => void };

function throttle(
  func: () => void,
  delay: number
): ThrottledCallback {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled: ThrottledCallback = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func();
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func();
      }, delay - timeSinceLastCall);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return throttled;
}

function resolveClientBreakpoint(): BreakpointKey {
  const measuredWidth = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
  return resolveBreakpoint(measuredWidth);
}

function subscribeToBreakpoint(onBreakpointChange: () => void): () => void {
  const throttledUpdate = throttle(onBreakpointChange, 100);
  window.addEventListener("resize", throttledUpdate);

  return () => {
    window.removeEventListener("resize", throttledUpdate);
    throttledUpdate.cancel();
  };
}

export const BreakpointProvider = ({ initialBreakpoint, children }: BreakpointProviderProps) => {
  const breakpoint = useSyncExternalStore(
    subscribeToBreakpoint,
    resolveClientBreakpoint,
    () => initialBreakpoint
  );

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
};
