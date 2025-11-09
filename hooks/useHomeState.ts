"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export type HomeView = "menu" | "catalog" | "money" | "work";

const HOME_VIEWS: HomeView[] = ["menu", "catalog", "money", "work"];

const normalizeView = (view: string | null): HomeView => {
  if (view && HOME_VIEWS.includes(view as HomeView)) {
    return view as HomeView;
  }
  return "menu";
};

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlView = searchParams.get("view");
  const initialView = useMemo(() => normalizeView(urlView), [urlView]);

  const [view, setViewState] = useState<HomeView>(initialView);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    setViewState(normalizeView(urlView));
  }, [urlView]);

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

