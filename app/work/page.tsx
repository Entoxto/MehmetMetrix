"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";
import { buildShipments } from "@/lib/shipments";
import { useBreakpoint } from "@/constants/MonitorSize";
import { Work } from "@/app/home/Work";
import { Shell } from "@/components/Shell";

export default function WorkPage() {
  const { isMobile, breakpoint } = useBreakpoint();
  const isDesktop = breakpoint === "laptop" || breakpoint === "desktop";
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedParamsRef = useRef<string>("");

  // Восстанавливаем состояние из sessionStorage
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = sessionStorage.getItem("workExpandedCards");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        return new Set(parsed);
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    return new Set();
  });

  // По умолчанию 2025 год открыт
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set([2025]);
    try {
      const saved = sessionStorage.getItem("workExpandedYears");
      if (saved) {
        const parsed = JSON.parse(saved) as number[];
        return new Set(parsed);
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    return new Set([2025]);
  });

  // Сохраняем состояние в sessionStorage при изменении
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

  // Обрабатываем query параметры для открытия нужной карточки и прокрутки (только один раз для каждого набора параметров)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const batch = searchParams.get("batch");
    const pos = searchParams.get("pos");
    
    // Формируем ключ из параметров
    const paramsKey = `${batch || ""}-${pos || ""}`;
    
    // Если нет параметров, сбрасываем флаг и выходим
    if (!batch && !pos) {
      processedParamsRef.current = "";
      return;
    }
    
    // Если эти параметры уже обработаны, не обрабатываем снова
    if (processedParamsRef.current === paramsKey) return;
    
    // Открываем карточку, если указан batch
    if (batch && !expandedCards.has(batch)) {
      setExpandedCards((prev) => {
        const next = new Set(prev);
        next.add(batch);
        return next;
      });
    }
    
    // Восстанавливаем позицию скролла из sessionStorage (если есть)
    const savedScrollY = sessionStorage.getItem("workScrollY");
    if (savedScrollY) {
      const scrollY = parseInt(savedScrollY, 10);
      setTimeout(() => {
        window.scrollTo(0, scrollY);
        sessionStorage.removeItem("workScrollY");
      }, 100);
    }
    
    // Прокручиваем к позиции, если указан pos
    if (pos) {
      setTimeout(() => {
        const element = document.getElementById(`pos-${pos}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        // После прокрутки очищаем URL параметры
        processedParamsRef.current = paramsKey;
        router.replace("/work", { scroll: false });
      }, 300);
    } else {
      // Если нет pos, очищаем URL сразу после небольшой задержки
      processedParamsRef.current = paramsKey;
      setTimeout(() => {
        router.replace("/work", { scroll: false });
      }, 100);
    }
  }, [searchParams, expandedCards, router]);

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }, []);

  const products: Product[] = useMemo(() => {
    try {
      const productsDataTyped = productsData as ProductsData;
      return productsDataTyped.products || [];
    } catch {
      return [];
    }
  }, []);

  const shipments = useMemo(() => buildShipments(products), [products]);

  return (
    <Shell>
      <Work
        isMobile={isMobile}
        isDesktop={isDesktop}
        shipments={shipments}
        expandedCards={expandedCards}
        onToggleCard={toggleCard}
        expandedYears={expandedYears}
        onToggleYear={toggleYear}
      />
    </Shell>
  );
}


