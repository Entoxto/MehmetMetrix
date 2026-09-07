import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { assertPublishedDataBundle, assertSnapshotData, createDataBundle, updateCatalogPrices } from "./dataBundle";
import sharedFixtures from "@/test-fixtures/runtime-data-validation.json";

const validBundle = createDataBundle({
  shipments: [],
  products: { products: [] },
  money: { pendingManual: [], deposits: [] },
  meta: { updatedAt: "2026-08-13T17:59:00.000Z", source: "excel" },
  productIdRegistry: { schemaVersion: 1, nextAutoNumber: 1, entries: [] },
}, "2026-08-13T18:00:00.000Z");

describe("assertPublishedDataBundle", () => {
  it("rejects a catalog name reassigned outside the registry", () => {
    const bundle = structuredClone(sharedFixtures.validBundle);
    const registeredName = bundle.products.products[0].name;
    const withRegistry = {
      ...bundle,
      productIdRegistry: {
        schemaVersion: 1,
        nextAutoNumber: 2,
        entries: [{ name: registeredName, normalizedName: registeredName.toLowerCase(), productId: "auto-001" }],
      },
    };
    withRegistry.products.products[0].name = "Другая модель из кожи";
    expect(() => assertPublishedDataBundle(withRegistry)).toThrow(/реестр/);
  });

  it("rejects catalog prices that disagree with shipment history", () => {
    const bundle = structuredClone(sharedFixtures.validBundle);
    bundle.products.products[0].price = 999;
    expect(() => assertPublishedDataBundle(bundle)).toThrow(/price/);
  });

  it("accepts the current data bundle schema", () => {
    expect(() => assertPublishedDataBundle(validBundle)).not.toThrow();
  });

  it("accepts a migrated bundle carrying the technical registry", () => {
    expect(() =>
      assertPublishedDataBundle(createDataBundle({
        ...validBundle,
        productIdRegistry: {
          schemaVersion: 1,
          nextAutoNumber: 2,
          entries: [
            {
              name: "Жакет",
              normalizedName: "жакет",
              productId: "auto-001",
            },
          ],
        },
      }))
    ).not.toThrow();
  });

  it("keeps legacy bundles without a registry readable", () => {
    const legacy = { ...validBundle };
    delete legacy.productIdRegistry;
    const { shipments, products, money, meta } = legacy;
    legacy.sourceHash = createHash("sha256").update(JSON.stringify({ shipments, products, money, meta })).digest("hex");
    legacy.version = `20260813T180000Z-${legacy.sourceHash.slice(0, 12)}`;
    expect(() => assertPublishedDataBundle(legacy)).not.toThrow();
    expect(() => createDataBundle(legacy)).toThrow("productIdRegistry");
  });

  it("rejects a malformed technical registry", () => {
    expect(() =>
      assertPublishedDataBundle({
        ...validBundle,
        productIdRegistry: {
          schemaVersion: 1,
          nextAutoNumber: 2,
          entries: [
            {
              name: "Жакет",
              normalizedName: "жакет",
              productId: "auto-001",
            },
            {
              name: "Пальто",
              normalizedName: "пальто",
              productId: "auto-001",
            },
          ],
        },
      })
    ).toThrow("повторяющийся ID");
  });

  it("accepts the shared nested fixture", () => {
    expect(() => assertSnapshotData(sharedFixtures.validBundle)).not.toThrow();
  });

  it("rejects unsupported schemas", () => {
    expect(() =>
      assertPublishedDataBundle({ ...validBundle, schemaVersion: 2 })
    ).toThrow("Неподдерживаемая версия схемы");
  });

  it("rejects an incomplete products payload", () => {
    expect(() =>
      assertPublishedDataBundle({ ...validBundle, products: {} })
    ).toThrow("products.products");
  });

  it("rejects a malformed content hash", () => {
    expect(() =>
      assertPublishedDataBundle({ ...validBundle, sourceHash: "not-a-hash" })
    ).toThrow("корректный sourceHash");
  });

  it.each(sharedFixtures.invalidCases)("rejects shared fixture: $name", ({ path, value }) => {
    const bundle = structuredClone(sharedFixtures.validBundle) as Record<string, unknown>;
    let target: unknown = bundle;
    for (const segment of path.slice(0, -1)) {
      target = (target as Record<string | number, unknown>)[segment];
    }
    (target as Record<string | number, unknown>)[path[path.length - 1]] = value;

    expect(() => assertSnapshotData(bundle)).toThrow();
  });
});


describe("content integrity and catalog derivation", () => {
  it("detects content tampering even when the envelope looks valid", () => {
    expect(() => assertPublishedDataBundle({ ...validBundle, money: { deposits: [{ title: "X", amount: 1 }] } })).toThrow("sourceHash");
  });

  it("derives price and cost independently from newest shipment, first known row", () => {
    const raw = (price?: number, cost?: number) => ({ productId: "auto-001", price, cost });
    const shipment = (id: string, year: number, rawItems: ReturnType<typeof raw>[]) => ({ id, year, title: "X", status: "X", rawItems });
    const products = structuredClone(sharedFixtures.validBundle.products);
    const shipments = [
      shipment("shipment-2025-99", 2025, [raw(10, 100)]),
      shipment("shipment-2026-1", 2026, [raw(20, 200)]),
      shipment("shipment-2026-2", 2026, [raw(undefined, 300), raw(30), raw(40, 400)]),
    ];
    updateCatalogPrices(products, shipments);
    expect(products.products[0]).toMatchObject({ price: 30, cost: 300 });
    expect(shipments[0].rawItems[0]).toEqual(raw(10, 100));
    const withoutPrices = [shipment("shipment-2026-3", 2026, [raw()])];
    updateCatalogPrices(products, withoutPrices);
    expect(JSON.parse(JSON.stringify(products.products[0]))).not.toHaveProperty("price");
  });
});
