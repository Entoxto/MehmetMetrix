/**
 * Сырые и вычисленные типы поставок.
 * Общие интерфейсы для shipmentAdapter.ts и shipments.ts.
 *
 * Статусы партий и позиций — это произвольные строки из Excel.
 * Логика «оплачен / не оплачен» определяется через lib/statusText.ts (isPaidStatus).
 */

export type SizeConfig = Record<string, number>;

export interface ShipmentRawItem {
  productId: string;
  overrideName?: string;
  sizes?: SizeConfig;
  quantityOverride?: number;
  price?: number;  // Цена на момент партии (историческая) - из колонки H (Цена за единицу, $) - доллары
  cost?: number;  // Себестоимость - из колонки N (Себестоимость с учётом карго) - рубли
  /** Размеры пока не разбиты; количество задано в суффиксе C вида `(10 шт.)`. */
  sizesUnknown?: boolean;
  /** Выпуск позиции пока не подтверждён; маркер `под вопросом` в колонке C. */
  underQuestion?: boolean;
  /** Статус позиции — текст из Excel (ровно то, что выбрал менеджер в выпадающем списке). */
  status?: string;
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
  /** Статус партии — текст из Excel (ровно то, что выбрал менеджер в выпадающем списке). */
  status: string;
  eta?: string;
  receivedDate?: string;
  year?: number;  // Год партии (если не указан, определяется из receivedDate или текущий год)
  groupByPayment?: boolean;
  rawItems: readonly ShipmentRawItem[];
}

/**
 * Расширенный интерфейс поставки с вычисленными данными
 */
export interface Shipment extends ShipmentConfig {
  positions: import("@/types/domain").Position[];
  totalAmount: number;
  hasPriceGaps: boolean;
}

