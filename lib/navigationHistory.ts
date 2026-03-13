"use client";

const APP_NAVIGATION_HISTORY_KEY = "appNavigationHistory";

const isBrowser = () => typeof window !== "undefined";

export const getCurrentRoute = () => {
  if (!isBrowser()) return "/";

  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}` || "/";
};

export const readNavigationHistory = () => {
  if (!isBrowser()) return [] as string[];

  try {
    const raw = sessionStorage.getItem(APP_NAVIGATION_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

export const writeNavigationHistory = (history: string[]) => {
  if (!isBrowser()) return;

  sessionStorage.setItem(APP_NAVIGATION_HISTORY_KEY, JSON.stringify(history));
};

export const syncNavigationHistory = (route: string) => {
  if (!isBrowser()) return;

  if (route === "/") {
    writeNavigationHistory(["/"]);
    return;
  }

  const history = readNavigationHistory();

  if (history.length === 0) {
    writeNavigationHistory([route]);
    return;
  }

  const lastRoute = history[history.length - 1];
  if (lastRoute === route) return;

  const previousRoute = history[history.length - 2];
  if (previousRoute === route) {
    writeNavigationHistory(history.slice(0, -1));
    return;
  }

  writeNavigationHistory([...history, route]);
};

export const getBackTarget = (currentRoute: string) => {
  const history = readNavigationHistory();

  if (history.length > 1 && history[history.length - 1] === currentRoute) {
    return history[history.length - 2];
  }

  return null;
};

export const popNavigationHistory = (currentRoute: string) => {
  const history = readNavigationHistory();

  if (history.length > 1 && history[history.length - 1] === currentRoute) {
    writeNavigationHistory(history.slice(0, -1));
  }
};

export const replaceCurrentWithBackTarget = (currentRoute: string, targetRoute: string) => {
  const history = readNavigationHistory();
  const baseHistory =
    history.length > 0 && history[history.length - 1] === currentRoute ? history.slice(0, -1) : history;

  if (baseHistory[baseHistory.length - 1] === targetRoute) {
    writeNavigationHistory(baseHistory);
    return;
  }

  writeNavigationHistory([...baseHistory, targetRoute]);
};
