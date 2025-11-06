import type { MouseEvent } from "react";

/**
 * Утилиты для форматирования данных и обработки событий
 */

/**
 * Форматирует сумму денег с тонким пробелом в качестве разделителя тысяч
 * @param amount - Сумма в долларах
 * @returns Отформатированная строка, например: "$45 970"
 * @example
 * formatCurrency(45970) // "$45 970"
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("ru-RU").replace(/\s/g, "\u2009")}`;
};

/**
 * Создаёт обработчики hover-эффекта для карточек
 * @param hoverStyle - Стили при наведении (transform, boxShadow, border)
 * @param defaultStyle - Стили по умолчанию
 * @returns Объект с обработчиками onMouseEnter и onMouseLeave
 */
export const createCardHoverHandlers = (
  hoverStyle: { transform?: string; boxShadow?: string; border?: string },
  defaultStyle: { transform?: string; boxShadow?: string; border?: string }
) => {
  return {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      const target = e.currentTarget;
      if (hoverStyle.transform) target.style.transform = hoverStyle.transform;
      if (hoverStyle.boxShadow) target.style.boxShadow = hoverStyle.boxShadow;
      if (hoverStyle.border) target.style.border = hoverStyle.border;
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      const target = e.currentTarget;
      if (defaultStyle.transform !== undefined) target.style.transform = defaultStyle.transform;
      if (defaultStyle.boxShadow !== undefined) target.style.boxShadow = defaultStyle.boxShadow;
      if (defaultStyle.border !== undefined) target.style.border = defaultStyle.border;
    },
  };
};

