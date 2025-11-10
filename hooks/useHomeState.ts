"use client";

/**
 * Управляет переключением между страницами, кроме страницы товара
 * Синхронизирует состояние с адресной строкой и помогает вернуться назад
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Возможные экраны домашней страницы
export type HomeView = "menu" | "catalog" | "money" | "work";

// Набор допустимых значений, чтобы не ошибиться в строке
const HOME_VIEWS: HomeView[] = ["menu", "catalog", "money", "work"];

// Если в адресной строке передан неизвестный view, откроем меню
const normalizeView = (view: string | null): HomeView => {
  if (view && HOME_VIEWS.includes(view as HomeView)) {
    return view as HomeView;
  }
  return "menu";
};

// Текущее состояние страницы и действия для управления им
export interface HomeState {
  view: HomeView;
  setView: (view: HomeView) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  expandedCards: Set<string>;
  toggleCard: (cardId: string) => void;
  handleBack: () => void;
}

export const useHomeState = (): HomeState => {
  // Навигация Next.js и чтение параметров строки
  const router = useRouter();
  const searchParams = useSearchParams();

  // Считываем view из URL, чтобы при загрузке открывать нужный экран
  const urlView = searchParams.get("view");
  const initialView = useMemo(() => normalizeView(urlView), [urlView]);

  // Текущее состояние экрана, выбранная категория и раскрытые карточки
  const [view, setViewState] = useState<HomeView>(initialView);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Когда URL меняется, синхронизируем view
  useEffect(() => {
    setViewState(normalizeView(urlView));
  }, [urlView]);

  // Переключение между экранами + обновление адресной строки
  const setView = useCallback(
    (nextView: HomeView) => {
      setViewState(nextView);
      if (typeof window === "undefined") return;

      const search = new URLSearchParams(window.location.search);
      if (nextView === "menu") {
        search.delete("view");
        search.delete("batch");
        search.delete("pos");
      } else {
        search.set("view", nextView);
      }
      const queryString = search.toString();
      router.push(queryString ? `/?${queryString}` : "/", { scroll: false });
    },
    [router]
  );

  // Реагируем на кнопки «назад»/«вперёд» браузера
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      const search = new URLSearchParams(window.location.search);
      const nextView = normalizeView(search.get("view"));
      setViewState(nextView);
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Раскрываем/сворачиваем карточки (например, деньги или партии)
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

  // Восстанавливаем раскрытие и скролл при возвращении из карточки товара
  useEffect(() => {
    if (view !== "work" || typeof window === "undefined") return;

    const batchId = searchParams.get("batch");
    const hash = window.location.hash;

    if (batchId) {
      setExpandedCards((prev) => {
        const next = new Set(prev);
        next.add(batchId);
        return next;
      });
    }

    const restoreScroll = () => {
      const savedScrollY = sessionStorage.getItem("workScrollY");
      if (savedScrollY) {
        const y = Number(savedScrollY);
        if (!Number.isNaN(y) && y > 0) {
          window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
        }
        sessionStorage.removeItem("workScrollY");
      }

      if (hash && hash.startsWith("#pos-")) {
        const elementId = hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
          }
        }, 100);
      }
    };

    const timer = setTimeout(restoreScroll, 50);
    return () => clearTimeout(timer);
  }, [searchParams, view]);

  // Логика кнопки «Назад» на главном экране
  const handleBack = useCallback(() => {
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }

    if (view !== "menu") {
      setView("menu");
    }
  }, [selectedCategory, setView, view]);

  return {
    view,
    setView,
    selectedCategory,
    setSelectedCategory,
    expandedCards,
    toggleCard,
    handleBack,
  };
};

