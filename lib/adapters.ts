/**
 * Адаптеры для преобразования данных из JSON в доменные типы.
 *
 * Статусы позиций — произвольные строки из Excel (1 в 1).
 * Логика «оплачен / не оплачен» определяется через isPaidStatus().
 */

import type { Position, Batch, Size } from '@/types/domain';
import type { Product } from '@/types/product';
import type { ShipmentRawItem, ShipmentConfig } from '@/types/shipment';
import { getStatusLabel } from '@/lib/format';

/**
 * Преобразует размер из строки в тип Size
 */
function toSize(size: string): Size {
  const upper = size === 'OneSize' ? 'OneSize' : size.toUpperCase();
  
  if (['XS', 'S', 'M', 'L', 'XL', 'OneSize'].includes(upper)) {
    return upper as Size;
  }
  return 'S'; // fallback
}

/** Счётчик для генерации уникальных ID позиций внутри одной сессии */
let positionCounter = 0;

/**
 * Очищает название товара от размеров в скобках
 */
function cleanProductName(name: string): string {
  if (!name) return '';
  
  const lastBracket = name.lastIndexOf('(');
  if (lastBracket === -1) {
    return name.trim();
  }
  
  const cleaned = name.substring(0, lastBracket).trim();
  return cleaned.split(/\s+/).join(' ');
}

/**
 * Преобразует сырой элемент в Position
 */
export function toPosition(
  item: ShipmentRawItem,
  products: Product[]
): Position {
  const product = products.find((p) => p.id === item.productId);
  const price = typeof item.price === 'number' ? item.price : null;

  // Преобразуем размеры
  const sizes: Record<Size, number> = {
    XS: 0, S: 0, M: 0, L: 0, XL: 0, OneSize: 0,
  };

  if (item.sizes) {
    for (const [size, count] of Object.entries(item.sizes)) {
      sizes[toSize(size)] = count;
    }
  }

  // Вычисляем количество
  const sizeEntries = item.sizes ? Object.entries(item.sizes) : [];
  const computedQuantity = sizeEntries.reduce((acc, [, count]) => acc + count, 0);
  const qty = item.quantityOverride ?? (computedQuantity || (item.sample ? 1 : 0));

  // Текстовый статус — 1 в 1 из Excel
  const statusLabel = getStatusLabel(item.status);

  // Сумма — отображается у всех позиций, кроме paidPreviously и noPayment
  const sum = price != null && qty != null && !item.paidPreviously && !item.noPayment
    ? price * qty
    : null;

  // Примечание
  const hasNoteText = item.note && item.note.toLowerCase() !== 'образец';
  const noteEnabled = item.showStatusTag || hasNoteText;
  const noteText = item.note || null;

  const cleanOverrideName = item.overrideName 
    ? cleanProductName(item.overrideName)
    : null;

  return {
    id: `${item.productId}-${++positionCounter}`,
    productId: item.productId,
    title: cleanOverrideName || product?.name || 'Неизвестное изделие',
    sizes,
    qty,
    price,
    sum,
    cost: typeof item.cost === 'number' ? item.cost : null,
    sample: item.sample ?? false,
    statusLabel,
    noteEnabled: !!noteEnabled,
    noteText,
  };
}

/**
 * Преобразует конфигурацию партии в Batch
 */
export function toBatch(config: ShipmentConfig, products: Product[]): Batch {
  const positions: Position[] = config.rawItems.map((item) => toPosition(item, products));

  return {
    id: config.id,
    receivedAt: config.receivedDate,
    positions,
  };
}
