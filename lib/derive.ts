/**
 * Бизнес-логика для работы с позициями и партиями.
 *
 * Группировка и сортировка по текстовым статусам (statusLabel).
 * Правило сортировки: оплаченные вниз, внутри категории — чем больше группа, тем выше.
 */

import type { Position, Batch } from '@/types/domain';
import { isPaidStatus } from '@/lib/statusText';

/**
 * Строка для отображения в таблице партии.
 */
export interface ViewRow {
  /** Текстовый статус для отображения (1 в 1 из Excel) */
  statusLabel: string;
  /** Позиции в группе */
  items: Position[];
}

/**
 * Группирует позиции по текстовому статусу (statusLabel).
 */
export function groupByStatusLabel(positions: Position[]): Map<string, Position[]> {
  const grouped = new Map<string, Position[]>();

  for (const position of positions) {
    const label = position.statusLabel || 'Неизвестный статус';
    if (!grouped.has(label)) {
      grouped.set(label, []);
    }
    grouped.get(label)!.push(position);
  }

  return grouped;
}

/**
 * Преобразует партию в список строк для отображения.
 * Сортировка: оплаченные вниз, внутри категории — чем больше группа, тем выше.
 */
export function toViewRows(batch: Batch): ViewRow[] {
  const grouped = groupByStatusLabel(batch.positions);
  const rows: ViewRow[] = [];

  for (const [statusLabel, items] of grouped.entries()) {
    rows.push({ statusLabel, items });
  }

  // Сортировка:
  // 1. Не оплаченные выше оплаченных
  // 2. Внутри категории — чем больше позиций, тем выше
  // 3. Тай-брейк по названию статуса для стабильности
  rows.sort((a, b) => {
    const aPaid = isPaidStatus(a.statusLabel);
    const bPaid = isPaidStatus(b.statusLabel);

    // Не оплаченные выше
    if (aPaid !== bPaid) {
      return aPaid ? 1 : -1;
    }

    // Больше позиций — выше
    const sizeDiff = b.items.length - a.items.length;
    if (sizeDiff !== 0) return sizeDiff;

    // Тай-брейк по алфавиту
    return a.statusLabel.localeCompare(b.statusLabel, 'ru');
  });

  return rows;
}

