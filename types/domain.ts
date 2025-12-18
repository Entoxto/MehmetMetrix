/**
 * Доменные типы для проекта MehmetMetrix.
 *
 * Статусы позиций — произвольные строки из Excel (1 в 1).
 * Логика «оплачен / не оплачен» определяется через isPaidStatus().
 */

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'OneSize';

export interface Position {
  id: string;
  productId: string;
  title: string;
  sizes: Record<Size, number>;
  qty: number;
  price: number | null;
  sum: number | null;
  cost?: number | null;
  sample: boolean;
  /** Текстовый статус позиции — ровно то, что выбрал менеджер в Excel. */
  statusLabel: string;
  noteEnabled: boolean;
  noteText: string | null;
}

export interface Batch {
  id: string;
  receivedAt?: string;
  positions: Position[];
}
