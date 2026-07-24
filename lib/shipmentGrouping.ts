import type { Shipment, ShipmentConfig } from "@/types/shipment";

/**
 * Определяет год поставки: явный year → receivedDate → текущий год.
 */
export function getShipmentYear(shipment: ShipmentConfig): number {
  if (shipment.year != null) {
    return shipment.year;
  }

  if (shipment.receivedDate) {
    const dateMatch = shipment.receivedDate.match(/(\d{4})$/);
    if (dateMatch) {
      return parseInt(dateMatch[1], 10);
    }
  }

  return new Date().getFullYear();
}

/**
 * Группирует поставки по годам; новые годы идут первыми.
 * Модуль не импортирует JSON и безопасен для client bundle.
 */
export function groupShipmentsByYear(
  shipments: readonly Shipment[]
): Map<number, Shipment[]> {
  const grouped = new Map<number, Shipment[]>();

  for (const shipment of shipments) {
    const year = getShipmentYear(shipment);
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(shipment);
  }

  return new Map(Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]));
}
