import type { ProductsData } from "@/types/product";
import type { ShipmentConfig } from "@/types/shipment";

export interface DataMeta {
  updatedAt?: string;
  source?: string;
}

export interface MoneyConfig {
  pendingManual?: unknown;
  deposits?: unknown;
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
