/**
 * Преобразование сырых позиций поставки из JSON в доменную модель.
 *
 * Статусы позиций — произвольные строки из Excel (1 в 1).
 * Логика «оплачен / не оплачен» определяется через isPaidStatus().
 */

import type { Position, Size } from '@/types/domain';
import type { Product } from '@/types/product';
import type { ShipmentRawItem, ShipmentConfig } from '@/types/shipment';
import { getStatusLabel } from '@/lib/format';

/**
 * Преобразует размер из строки в тип Size
 */
function toSize(size: string): Size {
  const normalized = size.trim().toLowerCase().replace(/\s+/g, '');
  const sizeMap: Record<string, Size> = {
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
    onesize: 'OneSize',
  };
  const mappedSize = sizeMap[normalized];

  if (!mappedSize) {
    throw new Error(`Unknown size key in shipment data: ${size}`);
  }

  return mappedSize;
}

/**
 * Генерирует стабильный ID позиции внутри поставки.
 * Использует shipmentId + индекс, чтобы ID не "плавали" между рендерами.
 */
function buildPositionId(
  shipmentId: string | undefined,
  productId: string,
  index: number
): string {
  const base = shipmentId && shipmentId.trim().length > 0 ? shipmentId : productId;
  return `${base}-pos-${index + 1}`;
}

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

function createEmptySizes(): Record<Size, number> {
  return {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    OneSize: 0,
  };
}

function mapPositionSizes(item: ShipmentRawItem): Record<Size, number> {
  const sizes = createEmptySizes();

  if (!item.sizes) {
    return sizes;
  }

  for (const [size, count] of Object.entries(item.sizes)) {
    sizes[toSize(size)] = count;
  }

  return sizes;
}

function getPositionQuantity(item: ShipmentRawItem): number {
  const sizeEntries = item.sizes ? Object.entries(item.sizes) : [];
  const computedQuantity = sizeEntries.reduce((acc, [, count]) => acc + count, 0);

  return item.quantityOverride ?? (computedQuantity || (item.sample ? 1 : 0));
}

function getNullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function getPositionSum(price: number | null, qty: number, isPayable: boolean): number | null {
  return price != null && isPayable ? price * qty : null;
}

function getPositionNote(item: ShipmentRawItem): {
  noteEnabled: boolean;
  noteText: string | null;
} {
  const hasNoteText = item.note && item.note.toLowerCase() !== 'образец';
  const noteEnabled = item.showStatusTag || hasNoteText;

  return {
    noteEnabled: !!noteEnabled,
    noteText: item.note || null,
  };
}

function getPositionTitle(item: ShipmentRawItem, product?: Product): string {
  const cleanOverrideName = item.overrideName
    ? cleanProductName(item.overrideName)
    : null;

  return cleanOverrideName || product?.name || 'Неизвестное изделие';
}

function getPositionStatus(itemStatus: string | undefined, shipmentStatus: string | undefined): string {
  const effectiveStatus = itemStatus?.trim() ? itemStatus : shipmentStatus;
  return getStatusLabel(effectiveStatus);
}

/**
 * Преобразует сырой элемент в Position
 */
function toPosition(
  item: ShipmentRawItem,
  products: Product[],
  options?: { shipmentId?: string; index?: number; fallbackStatus?: string }
): Position {
  const product = products.find((p) => p.id === item.productId);
  const index = options?.index ?? 0;
  const price = getNullableNumber(item.price);
  const cost = getNullableNumber(item.cost);
  const sizes = mapPositionSizes(item);
  const qty = getPositionQuantity(item);
  // Позиция наследует статус поставки, только если её собственный статус пуст.
  // Так пустая ячейка не превращает оплаченную позицию в «Неизвестный статус».
  const statusLabel = getPositionStatus(item.status, options?.fallbackStatus);
  const isPayable = !item.paidPreviously && !item.noPayment;
  const sum = getPositionSum(price, qty, isPayable);
  const { noteEnabled, noteText } = getPositionNote(item);

  return {
    id: buildPositionId(options?.shipmentId, item.productId, index),
    productId: item.productId,
    title: getPositionTitle(item, product),
    sizes,
    qty,
    price,
    sum,
    cost,
    sample: item.sample ?? false,
    sizesUnknown: item.sizesUnknown ?? false,
    statusLabel,
    isPayable,
    noteEnabled,
    noteText,
  };
}

/**
 * Преобразует сырые позиции поставки в доменные позиции.
 */
export function toShipmentPositions(
  config: ShipmentConfig,
  products: Product[]
): Position[] {
  return config.rawItems.map((item, index) =>
    toPosition(item, products, {
      shipmentId: config.id,
      index,
      fallbackStatus: config.status,
    })
  );
}
