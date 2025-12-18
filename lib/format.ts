/**
 * Форматирование данных для отображения.
 *
 * Статусы партий и позиций — произвольные строки из Excel (1 в 1).
 * Логика «оплачен / не оплачен» определяется через isPaidStatus().
 */

import { isPaidStatus } from '@/lib/statusText';

/**
 * Форматирует валюту с тонким пробелом (доллары)
 */
export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('ru-RU').replace(/\s/g, '\u2009')}`;
}

/**
 * Форматирует валюту в рублях с тонким пробелом (округляет до целых)
 */
export function formatCurrencyRUB(n: number): string {
  const rounded = Math.round(n);
  return `${rounded.toLocaleString('ru-RU').replace(/\s/g, '\u2009')} ₽`;
}

/**
 * Определяет иконку для текстового статуса.
 * Используется в StatusBadge для заметок позиций.
 */
export function getStatusIcon(statusText: string | null | undefined): string {
  const text = (statusText ?? '').toLowerCase();

  if (text.includes('в пути') || text.includes('intransit')) return '🚚';
  if (text.includes('готов') || text.includes('ожидает отправки') || text.includes('done') || text.includes('ready')) return '🕒';
  if (text.includes('не оплачен') || text.includes('receivedunpaid') || text.includes('received_unpaid')) return '📦';
  if (isPaidStatus(statusText)) return '✅';
  if (text.includes('в работе') || text.includes('в производстве') || text.includes('inprogress') || text.includes('in_progress')) return '🛠️';

  return '🧵';
}

/**
 * Возвращает текст статуса как есть (1 в 1 из Excel).
 * Для старых кодовых статусов — делает маппинг в читаемую форму с эмодзи.
 */
export function getStatusLabel(statusText: string | null | undefined): string {
  const text = (statusText ?? '').trim();
  if (!text) return 'Неизвестный статус';

  const lower = text.toLowerCase().replace(/[\s_]+/g, '');

  // Обратная совместимость: старые кодовые статусы → человекочитаемый вид с эмодзи
  const legacyMap: Record<string, string> = {
    inprogress: 'В работе 🧵',
    done: 'Готово, ожидает отправки 🕒',
    intransit: 'В пути 🚚',
    receivedunpaid: 'Получено, не оплачено 📦',
    receivedpaid: 'Получено, оплачено ✅',
    received: 'Получено, оплачено ✅',
    ready: 'Готово, ожидает отправки 🕒',
    in_progress: 'В производстве 🛠️',
    received_unpaid: 'Получено, не оплачено 📦',
  };

  if (legacyMap[lower]) {
    return legacyMap[lower];
  }

  // Текст из Excel — возвращаем как есть
  return text;
}
