import { describe, expect, it } from "vitest";
import { assertPublishedDataBundle } from "./dataBundle";

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
});
