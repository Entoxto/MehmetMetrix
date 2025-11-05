/**
 * Утилиты для форматирования
 */

/**
 * Форматирование денег с тонким пробелом: $45 970
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("ru-RU").replace(/\s/g, "\u2009")}`;
};

