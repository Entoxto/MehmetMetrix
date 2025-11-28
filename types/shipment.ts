/**
 * Типы для работы с партиями (shipments)
 * Общие интерфейсы для adapters.ts и shipments.ts
 */

export type ShipmentStatusKey = "in_progress" | "ready" | "received" | "received_unpaid" | "inTransit";

/**
 * Статусы партий
 */
export enum ShipmentStatus {
  inProgress = 'inProgress',
  done = 'done',
  inTransit = 'inTransit',
  receivedUnpaid = 'receivedUnpaid',
  receivedPaid = 'receivedPaid',
}

export type SizeConfig = Record<string, number>;

export interface ShipmentRawItem {
  productId: string;
  overrideName?: string;
  sizes?: SizeConfig;
  quantityOverride?: number;
  price?: number;  // Цена на момент партии (историческая)
  status?: ShipmentStatusKey;
  sample?: boolean;
  note?: string;
  paidPreviously?: boolean;
  noPayment?: boolean;
  inTransit?: boolean;
  showStatusTag?: boolean;
}

export interface ShipmentConfig {
  id: string;
  title: string;
  status: ShipmentStatus;
  eta?: string;
  receivedDate?: string;
  year?: number;  // Год партии (если не указан, определяется из receivedDate или текущий год)
  groupByPayment?: boolean;
  rawItems: readonly ShipmentRawItem[];
}

