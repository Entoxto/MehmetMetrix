/**
 * Бизнес-логика для работы с позициями и партиями
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import type { Position, Batch } from '@/types/domain';
import { PositionStatus } from '@/types/domain';

/**
 * Вычисляет сумму позиции (цена × количество)
 * 
 * @remarks
 * Используется в тестах и может применяться для перерасчёта.
 * Не учитывает бизнес-логику (paidPreviously, noPayment) — 
 * это делается в adapters.ts при создании Position.
 */
export function calcSum(position: Position): number | null {
  if (position.price == null || position.qty == null) {
    return null;
  }
  return position.price * position.qty;
}

/**
 * Группирует позиции по статусу
 */
export function groupByStatus(positions: Position[]): Record<PositionStatus, Position[]> {
  const grouped: Record<PositionStatus, Position[]> = {
    [PositionStatus.inProduction]: [],
    [PositionStatus.inTransit]: [],
    [PositionStatus.receivedUnpaid]: [],
    [PositionStatus.done]: [],
    [PositionStatus.paid]: [],
    [PositionStatus.paidEarlier]: [],
    [PositionStatus.returned]: [],
  };

  for (const position of positions) {
    grouped[position.status].push(position);
  }

  return grouped;
}

/**
 * Фиксированный порядок вывода статусов
 */
export const orderStatuses: PositionStatus[] = [
  PositionStatus.inProduction,
  PositionStatus.done,
  PositionStatus.paid,
  PositionStatus.paidEarlier,
  PositionStatus.returned,
  PositionStatus.receivedUnpaid,
  PositionStatus.inTransit,
];

/**
 * Преобразует партию в список строк для отображения
 */
export interface ViewRow {
  status: PositionStatus;
  items: Position[];
}

export function toViewRows(batch: Batch): ViewRow[] {
  const grouped = groupByStatus(batch.positions);
  const rows: ViewRow[] = [];

  for (const status of orderStatuses) {
    const items = grouped[status];
    if (items.length > 0) {
      rows.push({ status, items });
    }
  }

  return rows;
}

