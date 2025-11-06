/**
 * Доменные типы для проекта MehmetMetrix
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export enum PositionStatus {
  inProduction = 'inProduction',
  inTransit = 'inTransit',
  done = 'done',
  paid = 'paid',
  paidEarlier = 'paidEarlier',
  returned = 'returned',
}

export interface Position {
  id: string;
  productId: string;
  title: string;
  sizes: Record<Size, number>;
  qty: number;
  price: number | null;
  sum: number | null;
  sample: boolean;
  status: PositionStatus;
  noteEnabled: boolean;
  noteText: string | null;
}

export interface Batch {
  id: string;
  receivedAt?: string;
  positions: Position[];
}








