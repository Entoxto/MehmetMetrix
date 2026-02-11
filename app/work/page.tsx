"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts } from "@/lib/products";
import { buildShipments, groupShipmentsByYear, getShipmentYear } from "@/lib/shipments";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Work } from "@/app/home/Work";
import { Shell } from "@/components/Shell";

export default function WorkPage() {
  const { isMobile, isWide: isDesktop } = useBreakpoint();
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedParamsRef = useRef<string>("");
  const shipmentsRef = useRef<ReturnType<typeof buildShipments>>([]);

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

  // По умолчанию открыт самый актуальный год (первый в списке по данным)
  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = sessionStorage.getItem("workExpandedYears");
      if (saved) {
        const parsed = JSON.parse(saved) as number[];
        return new Set(parsed);
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    return new Set();
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
    
    // Открываем карточку и год, если указан batch
    if (batch) {
      const shipment = shipmentsRef.current.find((s) => s.id === batch);
      if (shipment) {
        const year = getShipmentYear(shipment);
        setExpandedYears((prev) => {
          if (prev.has(year)) return prev;
          const next = new Set(prev);
          next.add(year);
          return next;
        });
      }
      if (!expandedCards.has(batch)) {
        setExpandedCards((prev) => {
          const next = new Set(prev);
          next.add(batch);
          return next;
        });
      }
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
    
    // Прокручиваем к карточке поставки или позиции после раскрытия (ждём рендер)
    const scrollDelay = 250;
    const scrollTarget = pos ? `pos-${pos}` : batch ? `batch-${batch}` : null;

    if (scrollTarget) {
      setTimeout(() => {
        const element = document.getElementById(scrollTarget);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        processedParamsRef.current = paramsKey;
        router.replace("/work", { scroll: false });
      }, scrollDelay);
    } else {
      processedParamsRef.current = paramsKey;
      setTimeout(() => router.replace("/work", { scroll: false }), 100);
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

  const products = useMemo(() => getProducts(), []);

  const shipments = useMemo(() => buildShipments(products), [products]);

  shipmentsRef.current = shipments;

  // Порядок годов (новые сверху) — для подстановки дефолта при первом заходе
  const yearsOrdered = useMemo(
    () => Array.from(groupShipmentsByYear(shipments).keys()),
    [shipments]
  );

  // При первом заходе (нет сохранённого состояния) раскрываем самый актуальный год.
  // Флаг workExpandedYearsInitialized отличает «первый визит» от «пользователь закрыл все годы»,
  // чтобы при закрытии последнего года и при возврате на страницу не переоткрывать год.
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


