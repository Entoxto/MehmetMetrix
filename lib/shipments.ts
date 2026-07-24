import shipmentsData from "@/data/shipments.json";
import type { Product } from "@/types/product";
import { toShipmentPositions } from "./shipmentAdapter";
import type { ShipmentConfig, Shipment } from "@/types/shipment";
import { isPaidStatus } from "./statusText";

const SHIPMENTS_CONFIG: readonly ShipmentConfig[] =
  shipmentsData as readonly ShipmentConfig[];

export const buildShipments = (
  products: readonly Product[],
  configs: readonly ShipmentConfig[] = SHIPMENTS_CONFIG
): Shipment[] =>
  configs.map((config) => {
    const positions = toShipmentPositions(config, products as Product[]);
    
    // Считаем суммы на основе уже обработанных позиций
    const totalAmount = positions.reduce((sum, position) => sum + (position.sum ?? 0), 0);
    
    // Проверяем пропуски цен (есть кол-во, но нет цены, и это не оплачено ранее)
    const hasPriceGaps = positions.some(
      (p) => p.qty > 0 && p.price === null && p.isPayable
    );

    return {
      ...config,
      positions,
      totalAmount,
      hasPriceGaps,
    };
  });

interface PendingShipmentSummary {
  id: string;
  title: string;
  amount: number;
  unpaidUnits: number;
}

/**
 * Возвращает только те партии, где реально есть сумма к оплате по не оплаченным позициям.
 * Используется в сводках Money и Work, чтобы не дублировать финансовую логику.
 */
export function getPendingShipmentSummaries(
  shipments: readonly Shipment[]
): PendingShipmentSummary[] {
  return shipments
    .map((shipment) => {
      const unpaidPositions = shipment.positions.filter(
        (position) =>
          position.isPayable && position.sum !== null && !isPaidStatus(position.statusLabel)
      );

      const amount = unpaidPositions.reduce((sum, position) => sum + (position.sum ?? 0), 0);
      if (amount <= 0) {
        return null;
      }

      const normalizedTitle =
        shipment.title?.replace(/^Поставка/i, "поставку") ?? `поставку ${shipment.id}`;

      return {
        id: shipment.id,
        title: `Оплата за ${normalizedTitle}`,
        amount,
        unpaidUnits: unpaidPositions.reduce((sum, position) => sum + position.qty, 0),
      };
    })
    .filter((item): item is PendingShipmentSummary => Boolean(item));
}
