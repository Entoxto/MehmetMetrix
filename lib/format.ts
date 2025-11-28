/**
 * Форматирование данных для отображения
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { PositionStatus } from '@/types/domain';
import { ShipmentStatus } from '@/types/shipment';

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
  [PositionStatus.waitingForMaterial]: '🧵',
  [PositionStatus.inProduction]: '🛠️',
  [PositionStatus.inTransit]: '🚚',
  [PositionStatus.receivedUnpaid]: '📦',
  [PositionStatus.done]: '🕒',
  [PositionStatus.paid]: '💵',
  [PositionStatus.paidEarlier]: '☑️',
  [PositionStatus.receivedPaid]: '✅',
  [PositionStatus.returned]: '♻️',
};

/**
 * Подписи для всех статусов
 */
export const statusLabel: Record<PositionStatus, string> = {
  [PositionStatus.waitingForMaterial]: 'Ожидаем материал',
  [PositionStatus.inProduction]: 'В производстве',
  [PositionStatus.inTransit]: 'В пути',
  [PositionStatus.receivedUnpaid]: 'Получено, не оплачено',
  [PositionStatus.done]: 'Готово, ожидает отправки',
  [PositionStatus.paid]: 'Оплачено',
  [PositionStatus.paidEarlier]: 'Оплачено ранее',
  [PositionStatus.receivedPaid]: 'Получено, оплачено',
  [PositionStatus.returned]: 'Вернулось после ремонта',
};

/**
 * Карта иконок для статусов партий
 */
export const shipmentStatusIcon: Record<ShipmentStatus, string> = {
  [ShipmentStatus.inProgress]: '🧵',
  [ShipmentStatus.done]: '🕒',
  [ShipmentStatus.inTransit]: '🚚',
  [ShipmentStatus.receivedUnpaid]: '📦',
  [ShipmentStatus.receivedPaid]: '✅',
};

/**
 * Подписи для статусов партий
 */
export const shipmentStatusLabel: Record<ShipmentStatus, string> = {
  [ShipmentStatus.inProgress]: 'В работе',
  [ShipmentStatus.done]: 'Готово, ожидает отправки',
  [ShipmentStatus.inTransit]: 'В пути',
  [ShipmentStatus.receivedUnpaid]: 'Получено, не оплачено',
  [ShipmentStatus.receivedPaid]: 'Получено, оплачено',
};
