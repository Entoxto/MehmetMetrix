/**
 * Адаптеры для преобразования данных из старого формата в новый
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import type { Position, Batch, Size } from '@/types/domain';
import { PositionStatus } from '@/types/domain';
import type { Product } from '@/types/product';
import type { ShipmentRawItem, ShipmentConfig } from '@/types/shipment';

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

/**
 * Преобразует статус из старого формата в новый
 */
function toPositionStatus(
  status: string | undefined,
  inTransit?: boolean,
  paidPreviously?: boolean,
  noPayment?: boolean
): PositionStatus {
  if (inTransit) return PositionStatus.inTransit;
  if (status === 'received_unpaid') return PositionStatus.receivedUnpaid;
  if (status === 'received' && paidPreviously) return PositionStatus.paidEarlier;
  if (status === 'received' && noPayment) return PositionStatus.returned;
  if (status === 'received') return PositionStatus.paid;
  if (status === 'ready') return PositionStatus.done;
  return PositionStatus.inProduction;
}

/**
 * Очищает название товара от размеров в скобках
 * Пример: "Жакет приталенный из кожи питона — бежевый глянцевый (XS-5, S-5)" → "Жакет приталенный из кожи питона — бежевый глянцевый"
 */
function cleanProductName(name: string): string {
  if (!name) return '';
  
  // Находим последнюю открывающую скобку
  const lastBracket = name.lastIndexOf('(');
  if (lastBracket === -1) {
    return name.trim();
  }
  
  // Обрезаем до скобки и удаляем пробелы
  const cleaned = name.substring(0, lastBracket).trim();
  
  // Нормализуем множественные пробелы
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
  // Цена берётся из партии (историческая правда)
  const price = typeof item.price === 'number' ? item.price : null;

  // Преобразуем размеры
  const sizes: Record<Size, number> = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    OneSize: 0,
  };

  if (item.sizes) {
    for (const [size, count] of Object.entries(item.sizes)) {
      const sizeKey = toSize(size);
      sizes[sizeKey] = count;
    }
  }

  // Вычисляем количество
  const sizeEntries = item.sizes ? Object.entries(item.sizes) : [];
  const computedQuantity = sizeEntries.reduce((acc, [, count]) => acc + count, 0);
  const qty = item.quantityOverride ?? (computedQuantity || (item.sample ? 1 : 0));

  // Статус
  const status = toPositionStatus(item.status, item.inTransit, item.paidPreviously, item.noPayment);

  // Сумма
  const sum = price != null && qty != null && !item.paidPreviously && !item.noPayment
    ? price * qty
    : null;

  // Примечание
  // Теперь включаем noteEnabled, если есть текст заметки (и это не слово "образец", которое мы обрабатываем отдельно)
  const hasNoteText = item.note && item.note.toLowerCase() !== 'образец';
  const noteEnabled = item.showStatusTag || hasNoteText;
  const noteText = item.note || null;

  // Очищаем overrideName от размеров, если он есть
  const cleanOverrideName = item.overrideName 
    ? cleanProductName(item.overrideName)
    : null;

  return {
    id: `${item.productId}-${qty}-${JSON.stringify(item.sizes)}`,
    productId: item.productId,
    title: cleanOverrideName || product?.name || 'Неизвестное изделие',
    sizes,
    qty,
    price,
    sum,
    sample: item.sample ?? false,
    status,
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
