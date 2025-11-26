/**
 * Константы и утилиты для работы с брейкпоинтами экрана.
 * Хук useBreakpoint теперь живёт в hooks/useBreakpoint.ts,
 * но реэкспортируется здесь для обратной совместимости.
 */
"use client";

// Реэкспорт констант и утилит из lib/breakpoints
export { BREAKPOINTS, resolveBreakpoint, detectBreakpointFromUserAgent } from "@/lib/breakpoints";

// Реэкспорт хука для обратной совместимости
// Новый код должен импортировать из @/hooks/useBreakpoint
export { useBreakpoint } from "@/hooks/useBreakpoint";


