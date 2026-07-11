import { describe, expect, it } from "vitest";
import { toBatch } from "./adapters";
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

function createShipmentConfig(rawItems: ShipmentConfig["rawItems"]): ShipmentConfig {
  return {
    id: "shipment-2025-1",
    title: "Поставка №1",
    status: "В производстве 🛠️",
    rawItems,
  };
}

describe("toBatch", () => {
  it("преобразует raw item в позицию с размерами, суммой, себестоимостью и стабильным id", () => {
    const batch = toBatch(
      createShipmentConfig([
        {
          productId: "product-1",
          overrideName: "Жакет тестовый (XS-2, S-3)",
          sizes: { xs: 2, s: 3 },
          price: 100,
          cost: 7000,
          status: "В производстве 🛠️",
          note: "срочно",
        },
      ]),
      products
    );

    expect(batch.positions[0]).toMatchObject({
      id: "shipment-2025-1-pos-1",
      productId: "product-1",
      title: "Жакет тестовый",
      qty: 5,
      price: 100,
      cost: 7000,
      sum: 500,
      sample: false,
      statusLabel: "В производстве 🛠️",
      isPayable: true,
      noteEnabled: true,
      noteText: "срочно",
    });
    expect(batch.positions[0].sizes).toMatchObject({
      XS: 2,
      S: 3,
      M: 0,
      L: 0,
      XL: 0,
      OneSize: 0,
    });
  });

  it("не превращает sample в одну штуку, если размеры уже задают количество", () => {
    const batch = toBatch(
      createShipmentConfig([
        {
          productId: "product-1",
          sizes: { s: 2 },
          sample: true,
          price: 90,
        },
      ]),
      products
    );

    expect(batch.positions[0].qty).toBe(2);
    expect(batch.positions[0].sum).toBe(180);
  });

  it("quantityOverride имеет приоритет над суммой размеров", () => {
    const batch = toBatch(
      createShipmentConfig([
        {
          productId: "product-1",
          sizes: { s: 2 },
          quantityOverride: 5,
          price: 90,
        },
      ]),
      products
    );

    expect(batch.positions[0].qty).toBe(5);
    expect(batch.positions[0].sum).toBe(450);
  });

  it("не включает paidPreviously/noPayment позиции в сумму", () => {
    const batch = toBatch(
      createShipmentConfig([
        {
          productId: "product-1",
          quantityOverride: 2,
          price: 100,
          paidPreviously: true,
        },
        {
          productId: "product-1",
          quantityOverride: 2,
          price: 100,
          noPayment: true,
        },
      ]),
      products
    );

    expect(batch.positions.map((position) => position.isPayable)).toEqual([false, false]);
    expect(batch.positions.map((position) => position.sum)).toEqual([null, null]);
  });

  it.each([undefined, "", "   "])(
    "наследует статус поставки, если статус позиции пуст: %j",
    (status) => {
      const batch = toBatch(
        {
          ...createShipmentConfig([
            {
              productId: "product-1",
              quantityOverride: 1,
              price: 100,
              status,
            },
          ]),
          status: "Получено, оплачено ✅",
        },
        products
      );

      expect(batch.positions[0].statusLabel).toBe("Получено, оплачено ✅");
    }
  );

  it("сохраняет непустой статус позиции вместо статуса поставки", () => {
    const batch = toBatch(
      {
        ...createShipmentConfig([
          {
            productId: "product-1",
            quantityOverride: 1,
            price: 100,
            status: "В производстве 🛠️",
          },
        ]),
        status: "Получено, оплачено ✅",
      },
      products
    );

    expect(batch.positions[0].statusLabel).toBe("В производстве 🛠️");
  });

  it("падает на неизвестном ключе размера", () => {
    expect(() =>
      toBatch(
        createShipmentConfig([
          {
            productId: "product-1",
            sizes: { xxl: 1 },
          },
        ]),
        products
      )
    ).toThrow("Unknown size key");
  });
});
