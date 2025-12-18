/**
 * Вспомогательные функции для работы с текстовыми статусами.
 *
 * Основная идея:
 * - Мы больше не полагаемся на жёсткие enum'ы для определения "оплачен / не оплачен".
 * - Решаем это по человеку‑читаемому тексту статуса (как в Excel), ориентируясь только
 *   на наличие/отсутствие слова «оплачен» и его сочетаний.
 *
 * Базовые правила:
 * - Статусы, содержащие «не оплачен», «оплачен частично» или «частично оплачен» → НЕ оплачено.
 * - Статусы, содержащие «оплачен» (и не попавшие под предыдущие правила) → оплачено.
 * - Все остальные (без слова «оплачен») → НЕ оплачено.
 *
 * Для обратной совместимости дополнительно поддерживаем старые кодовые статусы JSON
 * вроде "receivedPaid", "received", "received_unpaid" и т.п.
 */

/**
 * Нормализует строку статуса: приводит к строке, обрезает пробелы.
 */
export function normalizeStatusText(raw: string | null | undefined): string {
  if (raw == null) return "";
  return String(raw).trim();
}

/**
 * Определяет, считается ли статус "оплаченным" с точки зрения денег.
 *
 * @param raw Текст статуса (как в Excel/JSON) или кодовый статус из старой модели.
 */
export function isPaidStatus(raw: string | null | undefined): boolean {
  const text = normalizeStatusText(raw);
  if (!text) return false;

  const lower = text.toLowerCase();

  // Явно не оплачено
  if (lower.includes("не оплачен")) return false;
  
  // Частичная оплата (есть и "оплач" и "част" в любом порядке) → не оплачено
  if (lower.includes("оплач") && lower.includes("част")) return false;

  // Любое другое упоминание "оплачен" → считаем оплаченным
  if (lower.includes("оплачен")) return true;

  // Обратная совместимость: старые кодовые статусы из JSON/парсера
  // Нормализуем: убираем подчёркивания и пробелы.
  const code = lower.replace(/[\s_]+/g, "");

  // Позиции / партии, полученные и оплаченные
  if (code === "receivedpaid") return true;
  if (code === "received") return true; // "Получено, оплачено ✅" для позиций

  // Явно не оплачено
  if (code === "receivedunpaid") return false;
  if (code === "inprogress" || code === "intransit" || code === "ready" || code === "done") {
    return false;
  }

  // По умолчанию считаем, что статус не даёт нам сигнала "оплачен" → не оплачен.
  return false;
}

