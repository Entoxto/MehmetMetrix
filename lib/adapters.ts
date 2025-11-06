/**
 * Адаптеры для преобразования данных из старого формата в новый
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import type { Position, Batch, Size } from '@/types/domain';
import { PositionStatus } from '@/types/domain';
import type { Product } from '@/types/product';
import { calcSum } from './derive';

// Старый формат данных из app/page.tsx
interface ShipmentRawItem {
  productId: string;
  overrideName?: string;
  sizes?: Record<string, number>;
  quantityOverride?: number;
  status?: string;
  sample?: boolean;
  note?: string;
  paidPreviously?: boolean;
  noPayment?: boolean;
  inTransit?: boolean;
  showStatusTag?: boolean;
}

interface ShipmentConfig {
  id: string;
  title: string;
  status: { label: string; icon: string };
  eta?: string;
  receivedDate?: string;
  groupByPayment?: boolean;
  rawItems: readonly ShipmentRawItem[];
}

/**
 * Преобразует размер из строки в тип Size
 */
function toSize(size: string): Size {
  const upper = size.toUpperCase();
  if (upper === 'XS' || upper === 'S' || upper === 'M' || upper === 'L' || upper === 'XL') {
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
  if (status === 'received' && paidPreviously) return PositionStatus.paidEarlier;
  if (status === 'received' && noPayment) return PositionStatus.returned;
  if (status === 'received') return PositionStatus.paid;
  if (status === 'ready') return PositionStatus.done;
  return PositionStatus.inProduction;
}

/**
 * Преобразует сырой элемент в Position
 */
export function toPosition(
  item: ShipmentRawItem,
  products: Product[]
): Position {
  const product = products.find((p) => p.id === item.productId);
  const price = typeof product?.price === 'number' ? product.price : null;

  // Преобразуем размеры
  const sizes: Record<Size, number> = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
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
  const noteEnabled = item.showStatusTag ?? false;
  const noteText = item.note && item.note !== 'образец' ? item.note : null;

  return {
    id: `${item.productId}-${qty}-${JSON.stringify(item.sizes)}`,
    productId: item.productId,
    title: item.overrideName || product?.name || 'Неизвестное изделие',
    sizes,
    qty,
    price,
    sum,
    sample: item.sample ?? false,
    status,
    noteEnabled,
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

