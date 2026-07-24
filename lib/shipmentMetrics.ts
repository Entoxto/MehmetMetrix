import type { Shipment } from "@/types/shipment";

export interface YearShipmentMetrics {
  shipmentsCount: number;
  modelsCount: number;
  unitsCount: number;
  totalAmount: number;
}

export function getShipmentModelCount(shipment: Shipment): number {
  return shipment.positions.length;
}

export function getShipmentUnitCount(shipment: Shipment): number {
  return shipment.positions.reduce((sum, position) => sum + position.qty, 0);
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
