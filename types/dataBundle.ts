import type { ProductsData } from "@/types/product";
import type { ShipmentConfig } from "@/types/shipment";

export interface DataMeta {
  updatedAt: string;
  source: "excel";
}

export interface MoneyPendingManualConfig {
  id?: string;
  title: string;
  amount: number;
}

export interface MoneyDepositConfig {
  id?: string;
  title?: string;
  lines?: string[];
  amount: number;
}

export interface MoneyConfig {
  pendingManual?: MoneyPendingManualConfig[];
  deposits?: MoneyDepositConfig[];
}

export interface PublishedDataBundle {
  schemaVersion: 1;
  version: string;
  publishedAt: string;
  sourceHash: string;
  shipments: ShipmentConfig[];
  products: ProductsData;
  money: MoneyConfig;
  meta: DataMeta;
}
