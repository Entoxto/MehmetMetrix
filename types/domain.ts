/**
 * Доменные типы для проекта MehmetMetrix
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'OneSize';

export enum PositionStatus {
  waitingForMaterial = 'waitingForMaterial',
  inProduction = 'inProduction',
  inTransit = 'inTransit',
  receivedUnpaid = 'receivedUnpaid',
  done = 'done',
  paid = 'paid',
  paidEarlier = 'paidEarlier',
  receivedPaid = 'receivedPaid',
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
