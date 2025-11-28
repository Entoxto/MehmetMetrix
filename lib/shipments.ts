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

/**
 * Определяет год поставки из конфигурации
 * Приоритет: явно указанный year > год из receivedDate > текущий год
 */
export function getShipmentYear(shipment: ShipmentConfig): number {
  // Если год явно указан, используем его
  if (shipment.year != null) {
    return shipment.year;
  }

  // Пытаемся извлечь год из receivedDate (формат: "DD.MM.YYYY")
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
 * Группирует поставки по годам
 * Возвращает Map, где ключ - год, значение - массив поставок этого года
 * Годы отсортированы по убыванию (новые сверху)
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

  // Сортируем годы по убыванию и создаем отсортированный Map
  const sortedYears = Array.from(grouped.keys()).sort((a, b) => b - a);
  return new Map(sortedYears.map(year => [year, grouped.get(year)!]));
}

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
