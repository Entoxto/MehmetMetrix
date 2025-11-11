/**
 * Форматирование данных для отображения
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { PositionStatus } from '@/types/domain';

/**
 * Форматирует валюту с тонким пробелом
 */
export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('ru-RU').replace(/\s/g, '\u2009')}`;
}

/**
 * Карта иконок для всех статусов
 * Карта иконок хранится здесь: lib/format.ts
 */
export const statusIcon: Record<PositionStatus, string> = {
  [PositionStatus.inProduction]: '🛠️',
  [PositionStatus.inTransit]: '🚚',
  [PositionStatus.receivedUnpaid]: '📦',
  [PositionStatus.done]: '✅',
  [PositionStatus.paid]: '💵',
  [PositionStatus.paidEarlier]: '☑️',
  [PositionStatus.returned]: '♻️',
};

/**
 * Подписи для всех статусов
 */
export const statusLabel: Record<PositionStatus, string> = {
  [PositionStatus.inProduction]: 'в производстве',
  [PositionStatus.inTransit]: 'уже в пути',
  [PositionStatus.receivedUnpaid]: 'получено, без оплаты',
  [PositionStatus.done]: 'готов',
  [PositionStatus.paid]: 'оплачено',
  [PositionStatus.paidEarlier]: 'оплачено ранее',
  [PositionStatus.returned]: 'вернулись после ремонта',
};

