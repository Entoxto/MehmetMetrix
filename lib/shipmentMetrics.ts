import type { ShipmentWithItems } from "@/types/shipment";

export interface YearShipmentMetrics {
  shipmentsCount: number;
  modelsCount: number;
  unitsCount: number;
  totalAmount: number;
}

export function getShipmentModelCount(shipment: ShipmentWithItems): number {
  return shipment.batch.positions.length;
}

export function getShipmentUnitCount(shipment: ShipmentWithItems): number {
  return shipment.batch.positions.reduce((sum, position) => sum + position.qty, 0);
}

export function getYearShipmentMetrics(
  shipments: readonly ShipmentWithItems[]
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
