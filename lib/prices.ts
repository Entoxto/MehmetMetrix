/**
 * Утилиты для работы с ценами
 * 
 * Цены хранятся в партиях (shipments.json) — это историческая правда.
 * Для каталога берётся последняя актуальная цена из партий.
 */

import type { ShipmentConfig } from "@/types/shipment";

/**
 * Получить актуальную цену продукта (из последней партии где он встречается)
 * 
 * @param productId - ID продукта
 * @param shipments - Массив партий (от новых к старым)
 * @returns Цена или null если не найдена
 */
export function getLatestPrice(
  productId: string,
  shipments: readonly ShipmentConfig[]
): number | null {
  // Партии идут от новых к старым, берём первую найденную цену
  for (const shipment of shipments) {
    for (const item of shipment.rawItems) {
      if (item.productId === productId && typeof item.price === 'number') {
        return item.price;
      }
    }
  }
  return null;
}

/**
 * Получить карту актуальных цен для всех продуктов
 * 
 * @param shipments - Массив партий (от новых к старым)
 * @returns Map<productId, price>
 */
export function getPriceMap(
  shipments: readonly ShipmentConfig[]
): Map<string, number> {
  const priceMap = new Map<string, number>();
  
  // Партии идут от новых к старым
  for (const shipment of shipments) {
    for (const item of shipment.rawItems) {
      // Записываем только если ещё не встречали этот продукт
      // (первая запись = самая свежая цена)
      if (
        item.productId && 
        typeof item.price === 'number' && 
        !priceMap.has(item.productId)
      ) {
        priceMap.set(item.productId, item.price);
      }
    }
  }
  
  return priceMap;
}




