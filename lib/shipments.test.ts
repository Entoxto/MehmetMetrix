import { describe, expect, it } from "vitest";
import {
  buildShipments,
  getPendingShipmentSummaries,
  getShipmentYear,
  groupShipmentsByYear,
} from "./shipments";
import type { Product } from "@/types/product";
import type { ShipmentConfig } from "@/types/shipment";

const products: Product[] = [
  {
    id: "product-1",
    name: "Жакет из кожи — чёрный",
    category: "Кожа",
    excelRows: [2],
    sizes: [],
    inStock: true,
  },
];

function createShipment(overrides: Partial<ShipmentConfig>): ShipmentConfig {
  return {
    id: "shipment-2025-1",
    title: "Поставка №1",
    status: "В производстве 🛠️",
    rawItems: [],
    ...overrides,
  };
}

describe("buildShipments", () => {
  it("считает сумму и отмечает price gaps только у payable позиций", () => {
    const shipments = buildShipments(products, [
      createShipment({
        rawItems: [
          {
            productId: "product-1",
            quantityOverride: 2,
            price: 100,
          },
          {
            productId: "product-1",
            quantityOverride: 1,
          },
          {
            productId: "product-1",
            quantityOverride: 1,
            paidPreviously: true,
          },
        ],
      }),
    ]);

    expect(shipments[0].totalAmount).toBe(200);
    expect(shipments[0].hasPriceGaps).toBe(true);
  });
});

describe("getPendingShipmentSummaries", () => {
  it("возвращает суммы только по неоплаченным поставкам и позициям", () => {
    const shipments = buildShipments(products, [
      createShipment({
        id: "shipment-2025-1",
        title: "Поставка №1",
        status: "В производстве 🛠️",
        rawItems: [
          {
            productId: "product-1",
            quantityOverride: 2,
            price: 100,
            status: "В производстве 🛠️",
          },
          {
            productId: "product-1",
            quantityOverride: 1,
            price: 100,
            status: "Получено, оплачено ✅",
          },
        ],
      }),
      createShipment({
        id: "shipment-2025-2",
        title: "Поставка №2",
        status: "Получено, оплачено ✅",
        rawItems: [
          {
            productId: "product-1",
            quantityOverride: 3,
            price: 100,
            status: "В производстве 🛠️",
          },
        ],
      }),
    ]);

    expect(getPendingShipmentSummaries(shipments)).toEqual([
      {
        id: "shipment-2025-1",
        title: "Оплата за поставку №1",
        amount: 200,
        unpaidUnits: 2,
      },
    ]);
  });
});

describe("getShipmentYear", () => {
  it("берёт явный year раньше даты", () => {
    expect(
      getShipmentYear(
        createShipment({
          year: 2026,
          receivedDate: "01.02.2025",
        })
      )
    ).toBe(2026);
  });

  it("берёт год из receivedDate, если year не задан", () => {
    expect(
      getShipmentYear(
        createShipment({
          receivedDate: "01.02.2025",
        })
      )
    ).toBe(2025);
  });
});

describe("groupShipmentsByYear", () => {
  it("группирует поставки и сортирует годы от новых к старым", () => {
    const shipments = buildShipments(products, [
      createShipment({
        id: "shipment-2024-1",
        year: 2024,
      }),
      createShipment({
        id: "shipment-2026-1",
        year: 2026,
      }),
    ]);

    const grouped = groupShipmentsByYear(shipments);

    expect(Array.from(grouped.keys())).toEqual([2026, 2024]);
    expect(grouped.get(2026)?.[0].id).toBe("shipment-2026-1");
    expect(grouped.get(2024)?.[0].id).toBe("shipment-2024-1");
  });
});
