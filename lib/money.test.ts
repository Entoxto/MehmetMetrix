import { describe, expect, it } from "vitest";
import { buildMoneyOverview } from "./money";
import type { Position } from "@/types/domain";
import type { Shipment } from "@/types/shipment";

function createPosition(overrides: Partial<Position>): Position {
  return {
    id: "pos-1",
    productId: "product-1",
    title: "Тестовая позиция",
    sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, OneSize: 0 },
    qty: 1,
    price: 100,
    sum: 100,
    isPayable: true,
    sample: false,
    statusLabel: "В производстве 🛠️",
    noteEnabled: false,
    noteText: null,
    ...overrides,
  };
}

function createShipment({
  id = "shipment-2025-7",
  title = "Поставка №7",
  status = "В производстве 🛠️",
  positions = [],
}: {
  id?: string;
  title?: string;
  status?: string;
  positions?: Position[];
}): Shipment {
  return {
    id,
    title,
    status,
    rawItems: [],
    positions,
    totalAmount: positions.reduce((sum, position) => sum + (position.sum ?? 0), 0),
    hasPriceGaps: false,
  } as Shipment;
}

describe("buildMoneyOverview", () => {
  it("объединяет неоплаченные поставки, ручные строки и депозиты", () => {
    const shipments = [
      createShipment({
        positions: [
          createPosition({ id: "pos-1", qty: 2, sum: 200 }),
          createPosition({
            id: "pos-2",
            qty: 1,
            sum: 100,
            statusLabel: "Получено, оплачено ✅",
          }),
        ],
      }),
    ];

    const result = buildMoneyOverview(shipments, {
      pendingManual: [{ id: "manual-1", title: "Ручная доплата", amount: 50 }],
      deposits: [{ id: "deposit-1", lines: ["Депозит 1", "Депозит 2"], amount: 125 }],
    });

    expect(result.pending.total).toBe(250);
    expect(result.pending.items).toEqual([
      {
        id: "shipment-2025-7",
        title: "Оплата за поставку №7",
        amount: 200,
        href: "/work?batch=shipment-2025-7",
      },
      {
        id: "manual-1",
        title: "Ручная доплата",
        amount: 50,
      },
    ]);
    expect(result.deposits.total).toBe(125);
    expect(result.deposits.items).toEqual([
      {
        id: "deposit-1",
        lines: ["Депозит 1", "Депозит 2"],
        amount: 125,
      },
    ]);
  });

  it("использует title как строку депозита, если lines не заданы", () => {
    const result = buildMoneyOverview([], {
      deposits: [{ title: "Предоплата за кожу", amount: 300 }],
    });

    expect(result.deposits.items).toEqual([
      {
        id: "deposit-0",
        lines: ["Предоплата за кожу"],
        amount: 300,
      },
    ]);
  });

  it("падает на невалидной ручной сумме", () => {
    expect(() =>
      buildMoneyOverview([], {
        pendingManual: [{ title: "Некорректная строка", amount: 0 }],
      })
    ).toThrow("money.pendingManual[0].amount");
  });
});
