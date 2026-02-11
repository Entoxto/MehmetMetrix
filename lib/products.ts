/**
 * Загрузка каталога товаров из JSON.
 * Единая точка доступа — не дублируй эту логику в страницах.
 */

import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";

/**
 * Возвращает массив товаров из products.json.
 * Безопасно обрабатывает некорректные данные.
 */
export function getProducts(): Product[] {
  try {
    const data = productsData as ProductsData;
    return data.products || [];
  } catch {
    return [];
  }
}
