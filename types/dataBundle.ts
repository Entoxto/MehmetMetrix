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

export interface ProductIdRegistryEntry {
  name: string;
  normalizedName: string;
  productId: string;
}

/**
 * Technical publication state. Runtime screens do not read this field; it is
 * carried in the versioned bundle so the next publisher can continue from the
 * same authoritative ID history on any machine.
 */
export interface ProductIdRegistryData {
  schemaVersion: 1;
  nextAutoNumber: number;
  entries: ProductIdRegistryEntry[];
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
  /** Optional for backwards compatibility with bundles created before migration. */
  productIdRegistry?: ProductIdRegistryData;
  /** Version read immediately before parsing; used as an optimistic lock. */
  registryBaseVersion?: string | null;
}
