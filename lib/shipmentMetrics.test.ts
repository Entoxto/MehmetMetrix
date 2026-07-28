import { describe, expect, it } from "vitest";
import {
  getShipmentContentsItems,
  getShipmentTypeFlags,
} from "./shipmentMetrics";
import type { Position } from "@/types/domain";
import type { Shipment } from "@/types/shipment";

function createPosition(id: string, sample: boolean, qty = 1): Position {
  return {
    id,
    productId: id,
    title: `Модель ${id}`,
    sizes: {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      OneSize: qty,
    },
    qty,
    price: 100,
    sum: 100 * qty,
    isPayable: true,
    sample,
    statusLabel: "В работе",
    noteEnabled: false,
    noteText: null,
  };
}

function createShipment(positions: Position[]): Shipment {
  return {
    id: "shipment-test",
    title: "Поставка №1",
    status: "В работе",
    rawItems: [],
    positions,
    totalAmount: 0,
    hasPriceGaps: false,
  };
}

describe("shipment type flags", () => {
  it("показывает только партию, когда образцов нет", () => {
    const shipment = createShipment([createPosition("regular", false)]);

    expect(getShipmentTypeFlags(shipment)).toEqual({
      hasBatch: true,
      hasSample: false,
    });
  });

  it("показывает только образец, когда вся поставка состоит из образцов", () => {
    const shipment = createShipment([
      createPosition("sample-1", true),
      createPosition("sample-2", true),
    ]);

    expect(getShipmentTypeFlags(shipment)).toEqual({
      hasBatch: false,
      hasSample: true,
    });
  });

  it("комбинирует обе метки для смешанной поставки", () => {
    const shipment = createShipment([
      createPosition("regular", false),
      createPosition("sample", true),
    ]);

    expect(getShipmentTypeFlags(shipment)).toEqual({
      hasBatch: true,
      hasSample: true,
    });
  });

  it("считает пустую поставку обычной партией", () => {
    expect(getShipmentTypeFlags(createShipment([]))).toEqual({
      hasBatch: true,
      hasSample: false,
    });
  });
});

describe("shipment contents", () => {
  it("возвращает весь состав и готовит модель с цветом для UI", () => {
    const shipment = createShipment([
      createPosition("one", false, 2),
      createPosition("two", true, 1),
      createPosition("three", false, 4),
    ]);
    shipment.positions[0].title = "Куртка — коричневый матовый";

    expect(getShipmentContentsItems(shipment)).toEqual([
      {
        id: "one",
        model: "Куртка",
        color: "коричневый матовый",
        quantity: 2,
        sourceTitle: "Куртка — коричневый матовый",
      },
      {
        id: "two",
        model: "Модель two",
        color: null,
        quantity: 1,
        sourceTitle: "Модель two",
      },
      {
        id: "three",
        model: "Модель three",
        color: null,
        quantity: 4,
        sourceTitle: "Модель three",
      },
    ]);
  });
});
