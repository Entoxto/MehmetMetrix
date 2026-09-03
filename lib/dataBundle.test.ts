import { describe, expect, it } from "vitest";
import { assertPublishedDataBundle } from "./dataBundle";
import sharedFixtures from "@/test-fixtures/runtime-data-validation.json";

const validBundle = {
  schemaVersion: 1,
  version: "20260813T180000Z-111111111111",
  publishedAt: "2026-08-13T18:00:00.000Z",
  sourceHash: "1".repeat(64),
  shipments: [],
  products: { products: [] },
  money: { pendingManual: [], deposits: [] },
  meta: { updatedAt: "2026-08-13T17:59:00.000Z", source: "excel" },
};

describe("assertPublishedDataBundle", () => {
  it("accepts the current data bundle schema", () => {
    expect(() => assertPublishedDataBundle(validBundle)).not.toThrow();
  });

  it("accepts a migrated bundle carrying the technical registry", () => {
    expect(() =>
      assertPublishedDataBundle({
        ...validBundle,
        registryBaseVersion: "20260813T170000Z-222222222222",
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
      })
    ).not.toThrow();
  });

  it("keeps legacy bundles without a registry readable", () => {
    expect(() => assertPublishedDataBundle(validBundle)).not.toThrow();
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
    expect(() => assertPublishedDataBundle(sharedFixtures.validBundle)).not.toThrow();
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

    expect(() => assertPublishedDataBundle(bundle)).toThrow();
  });
});
