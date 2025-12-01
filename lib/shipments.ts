import shipmentsData from "@/data/shipments.json";
import type { Product } from "@/types/product";
import { toBatch } from "./adapters";
import type { ShipmentConfig, ShipmentWithItems } from "@/types/shipment";

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

/**
 * Определяет год поставки на основе приоритета:
 * 1. Явное поле year (если указано)
 * 2. Год из receivedDate (если есть)
 * 3. Текущий год (по умолчанию)
 */
export function getShipmentYear(shipment: ShipmentConfig): number {
  // Проверяем явное поле year
  if (shipment.year != null) {
    return shipment.year;
  }
  
  // Пытаемся извлечь год из receivedDate
  if (shipment.receivedDate) {
    const dateMatch = shipment.receivedDate.match(/(\d{4})$/);
    if (dateMatch) {
      return parseInt(dateMatch[1], 10);
    }
  }
  
  // По умолчанию - текущий год
  return new Date().getFullYear();
}

/**
 * Группирует поставки по годам и возвращает отсортированную Map.
 * Годы отсортированы по убыванию (новые сверху).
 */
export function groupShipmentsByYear(
  shipments: ShipmentWithItems[]
): Map<number, ShipmentWithItems[]> {
  const grouped = new Map<number, ShipmentWithItems[]>();
  
  for (const shipment of shipments) {
    const year = getShipmentYear(shipment);
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(shipment);
  }
  
  // Сортируем годы по убыванию (новые сверху)
  const sortedEntries = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]);
  return new Map(sortedEntries);
}
