"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getShipmentYear, groupShipmentsByYear } from "@/lib/shipments";
import type { ShipmentWithItems } from "@/types/shipment";

function readStringSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const saved = sessionStorage.getItem(key);
    if (!saved) return new Set();
    const parsed = JSON.parse(saved) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function readNumberSet(key: string): Set<number> {
  if (typeof window === "undefined") return new Set();

  try {
    const saved = sessionStorage.getItem(key);
    if (!saved) return new Set();
    const parsed = JSON.parse(saved) as number[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function addToSet<T>(current: Set<T>, value: T): Set<T> {
  if (current.has(value)) return current;
  const next = new Set(current);
  next.add(value);
  return next;
}

function toggleSetValue<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function useWorkNavigationState(shipments: readonly ShipmentWithItems[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedParamsRef = useRef("");

  const [expandedCards, setExpandedCards] = useState<Set<string>>(() =>
    readStringSet("workExpandedCards")
  );
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() =>
    readNumberSet("workExpandedYears")
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("workExpandedCards", JSON.stringify(Array.from(expandedCards)));
    }
  }, [expandedCards]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("workExpandedYears", JSON.stringify(Array.from(expandedYears)));
    }
  }, [expandedYears]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const batch = searchParams.get("batch");
    const pos = searchParams.get("pos");
    const paramsKey = `${batch || ""}-${pos || ""}`;

    if (!batch && !pos) {
      processedParamsRef.current = "";
      return;
    }

    if (processedParamsRef.current === paramsKey) return;

    if (batch) {
      const shipment = shipments.find((item) => item.id === batch);
      if (shipment) {
        setExpandedYears((current) => addToSet(current, getShipmentYear(shipment)));
      }
      setExpandedCards((current) => addToSet(current, batch));
    }

    const timeoutIds: number[] = [];
    const savedScrollY = sessionStorage.getItem("workScrollY");
    if (savedScrollY) {
      const scrollY = parseInt(savedScrollY, 10);
      timeoutIds.push(
        window.setTimeout(() => {
          window.scrollTo(0, scrollY);
          sessionStorage.removeItem("workScrollY");
        }, 100)
      );
    }

    const scrollTarget = pos ? `pos-${pos}` : batch ? `batch-${batch}` : null;
    if (scrollTarget) {
      timeoutIds.push(
        window.setTimeout(() => {
          const element = document.getElementById(scrollTarget);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          processedParamsRef.current = paramsKey;
          router.replace("/work", { scroll: false });
        }, 250)
      );
    } else {
      processedParamsRef.current = paramsKey;
      timeoutIds.push(window.setTimeout(() => router.replace("/work", { scroll: false }), 100));
    }

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [router, searchParams, shipments]);

  const yearsOrdered = useMemo(
    () => Array.from(groupShipmentsByYear([...shipments]).keys()),
    [shipments]
  );

  useEffect(() => {
    if (yearsOrdered.length === 0) return;
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem("workExpandedYearsInitialized")) return;

    if (expandedYears.size > 0) {
      sessionStorage.setItem("workExpandedYearsInitialized", "true");
      return;
    }

    sessionStorage.setItem("workExpandedYearsInitialized", "true");
    setExpandedYears(new Set([yearsOrdered[0]]));
  }, [yearsOrdered, expandedYears.size]);

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCards((current) => toggleSetValue(current, cardId));
  }, []);

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((current) => toggleSetValue(current, year));
  }, []);

  return {
    expandedCards,
    expandedYears,
    toggleCard,
    toggleYear,
  };
}
