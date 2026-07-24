/**
 * Доменные типы для проекта Mehmet Metrics.
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
  /** Учитывается ли позиция в оплате (false для paidPreviously/noPayment). */
  isPayable: boolean;
  cost?: number | null;
  sample: boolean;
  /** Размеры позиции пока не заданы (маркер "на уточнении" из Excel). */
  sizesUnknown?: boolean;
  /** Текстовый статус позиции — ровно то, что выбрал менеджер в Excel. */
  statusLabel: string;
  noteEnabled: boolean;
  noteText: string | null;
}
