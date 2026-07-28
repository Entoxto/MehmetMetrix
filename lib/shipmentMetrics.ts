import type { Shipment } from "@/types/shipment";
import { splitProductLabel } from "@/lib/productLabel";

export interface YearShipmentMetrics {
  shipmentsCount: number;
  modelsCount: number;
  unitsCount: number;
  totalAmount: number;
}

export interface ShipmentTypeFlags {
  hasBatch: boolean;
  hasSample: boolean;
}

export interface ShipmentContentItem {
  id: string;
  model: string;
  color: string | null;
  quantity: number;
  sourceTitle: string;
}

export function getShipmentModelCount(shipment: Shipment): number {
  return shipment.positions.length;
}

export function getShipmentUnitCount(shipment: Shipment): number {
  return shipment.positions.reduce((sum, position) => sum + position.qty, 0);
}

/**
 * Плашки типа собираются композиционно:
 * обычная позиция даёт «Партию», образец — «Образец».
 * Смешанная поставка поэтому показывает обе независимые метки.
 */
export function getShipmentTypeFlags(
  shipment: Pick<Shipment, "positions">
): ShipmentTypeFlags {
  const hasSample = shipment.positions.some((position) => position.sample);
  const hasBatch =
    shipment.positions.length === 0 ||
    shipment.positions.some((position) => !position.sample);

  return { hasBatch, hasSample };
}

export function getShipmentContentsItems(
  shipment: Pick<Shipment, "positions">
): ShipmentContentItem[] {
  return shipment.positions.map((position) => {
    const { model, color } = splitProductLabel(position.title);

    return {
      id: position.id,
      model,
      color,
      quantity: position.qty,
      sourceTitle: position.title,
    };
  });
}

export function getYearShipmentMetrics(
  shipments: readonly Shipment[]
): YearShipmentMetrics {
  return shipments.reduce(
    (metrics, shipment) => ({
      shipmentsCount: metrics.shipmentsCount + 1,
      modelsCount: metrics.modelsCount + getShipmentModelCount(shipment),
      unitsCount: metrics.unitsCount + getShipmentUnitCount(shipment),
      totalAmount: metrics.totalAmount + shipment.totalAmount,
    }),
    {
      shipmentsCount: 0,
      modelsCount: 0,
      unitsCount: 0,
      totalAmount: 0,
    }
  );
}
