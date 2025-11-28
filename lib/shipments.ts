import shipmentsData from "@/data/shipments.json";
import type { Product } from "@/types/product";
import { toBatch } from "./adapters";
import type { Batch } from "@/types/domain";
import type { ShipmentConfig } from "@/types/shipment";

// Реэкспорт типов для обратной совместимости
export type { ShipmentStatusKey, ShipmentRawItem, ShipmentConfig } from "@/types/shipment";
export { ShipmentStatus } from "@/types/shipment";

export interface ShipmentWithItems extends ShipmentConfig {
  totalAmount: number;
  hasPriceGaps: boolean;
  batch: Batch;
}

export const SHIPMENTS_CONFIG: readonly ShipmentConfig[] =
  shipmentsData as readonly ShipmentConfig[];

export const buildShipments = (
  products: readonly Product[],
  configs: readonly ShipmentConfig[] = SHIPMENTS_CONFIG
): ShipmentWithItems[] =>
  configs.map((config) => {
    // Создаем единую доменную модель (Batch/Position)
    const batch = toBatch(config, products as Product[]);
    
    // Считаем суммы на основе уже обработанных позиций
    const totalAmount = batch.positions.reduce((sum, position) => sum + (position.sum ?? 0), 0);
    
    // Проверяем пропуски цен (есть кол-во, но нет цены, и это не оплачено ранее)
    const hasPriceGaps = batch.positions.some(p => p.qty > 0 && p.price === null);

    return {
      ...config,
      totalAmount,
      hasPriceGaps,
      batch,
    };
  });
