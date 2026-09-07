import type { Product } from "@/types/product";
import { toShipmentPositions } from "./shipmentAdapter";
import type { ShipmentConfig, Shipment } from "@/types/shipment";
import { isPaidStatus } from "./statusText";

export const buildShipments = (
  products: readonly Product[],
  configs: readonly ShipmentConfig[]
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
      id: config.id,
      title: config.title,
      status: config.status,
      year: config.year,
      number: config.number,
      eta: config.eta,
      receivedDate: config.receivedDate,
      positions,
      totalAmount,
      hasPriceGaps,
    };
  });

interface PendingShipmentSummary {
  id: string;
  title: string;
  amount: number | null;
  unpaidUnits: number;
  unknownPricePositions: number;
  unknownPriceUnits: number;
}

/**
 * Возвращает партии, где есть хотя бы одна неоплаченная payable-позиция.
 * Известную сумму и физический объём позиций без цены считаем отдельно, чтобы
 * Money не выдавал частичную сумму за полный долг и не скрывал неизвестный долг.
 * Используется в сводках Money и Work, чтобы не дублировать финансовую логику.
 */
export function getPendingShipmentSummaries(
  shipments: readonly Shipment[]
): PendingShipmentSummary[] {
  return shipments
    .map((shipment) => {
      const unpaidPositions = shipment.positions.filter(
        (position) => position.isPayable && !isPaidStatus(position.statusLabel)
      );

      if (unpaidPositions.length === 0) {
        return null;
      }

      const knownAmount = unpaidPositions.reduce(
        (sum, position) => sum + (position.sum ?? 0),
        0
      );
      const unknownPricePositions = unpaidPositions.filter(
        (position) => position.qty > 0 && position.price === null
      );

      const normalizedTitle =
        shipment.title?.replace(/^Поставка/i, "поставку") ?? `поставку ${shipment.id}`;

      return {
        id: shipment.id,
        title: `Оплата за ${normalizedTitle}`,
        amount: knownAmount > 0 ? knownAmount : null,
        unpaidUnits: unpaidPositions.reduce((sum, position) => sum + position.qty, 0),
        unknownPricePositions: unknownPricePositions.length,
        unknownPriceUnits: unknownPricePositions.reduce(
          (sum, position) => sum + position.qty,
          0
        ),
      };
    })
    .filter((item): item is PendingShipmentSummary => Boolean(item));
}
