import { describe, expect, it } from "vitest";
import {
  registryHistoryConflict,
  registryPublicationConflict,
} from "./publicationRegistry";

const activeRegistry = {
  schemaVersion: 1 as const,
  nextAutoNumber: 3,
  entries: [
    { name: "Жакет", normalizedName: "жакет", productId: "auto-001" },
    { name: "Пальто", normalizedName: "пальто", productId: "auto-002" },
  ],
};

describe("productId registry publication lock", () => {
  it("allows the first registry migration from a legacy current bundle", () => {
    expect(
      registryPublicationConflict({
        currentVersion: "20260903T120000Z-aaaaaaaaaaaa",
        incomingBaseVersion: "20260903T120000Z-aaaaaaaaaaaa",
        incomingHasRegistry: true,
      })
    ).toBeNull();
  });

  it("allows seeding the registry when no current bundle exists yet", () => {
    expect(
      registryPublicationConflict({
        currentVersion: null,
        incomingBaseVersion: null,
        incomingHasRegistry: true,
      })
    ).toBeNull();
  });

  it("rejects a stale publisher after another machine has advanced the registry", () => {
    const stalePublisher = {
      currentVersion: "20260903T120000Z-aaaaaaaaaaaa",
      incomingBaseVersion: "20260903T120000Z-aaaaaaaaaaaa",
      incomingHasRegistry: true,
    };

    expect(
      registryPublicationConflict({
        ...stalePublisher,
        currentVersion: "20260903T130000Z-bbbbbbbbbbbb",
      })
    ).toContain("Устаревший productIdRegistry");
    expect(
      registryPublicationConflict({
        ...stalePublisher,
        currentVersion: "20260903T120000Z-aaaaaaaaaaaa",
      })
    ).toBeNull();
  });

  it("never permits dropping an already published registry", () => {
    expect(
      registryPublicationConflict({
        currentVersion: "20260903T130000Z-bbbbbbbbbbbb",
        incomingBaseVersion: undefined,
        incomingHasRegistry: false,
      })
    ).toContain("обязана содержать productIdRegistry");
  });

  it("rejects a registry-free POST even while current is legacy", () => {
    expect(
      registryPublicationConflict({
        currentVersion: "20260903T120000Z-aaaaaaaaaaaa",
        incomingBaseVersion: "20260903T120000Z-aaaaaaaaaaaa",
        incomingHasRegistry: false,
      })
    ).toContain("обязана содержать productIdRegistry");
  });

  it("accepts a normal update based on the active registry version", () => {
    expect(
      registryPublicationConflict({
        currentVersion: "20260903T130000Z-bbbbbbbbbbbb",
        incomingBaseVersion: "20260903T130000Z-bbbbbbbbbbbb",
        incomingHasRegistry: true,
      })
    ).toBeNull();
  });

  it("preserves retired IDs and allows only append-only registry updates", () => {
    expect(
      registryHistoryConflict(activeRegistry, {
        ...activeRegistry,
        nextAutoNumber: 4,
        entries: [
          ...activeRegistry.entries,
          { name: "Новый товар", normalizedName: "новый товар", productId: "auto-003" },
        ],
      })
    ).toBeNull();
    expect(
      registryHistoryConflict(activeRegistry, {
        ...activeRegistry,
        entries: [activeRegistry.entries[0]],
      })
    ).toContain("удаляет сохранённую модель");
    expect(
      registryHistoryConflict(activeRegistry, {
        ...activeRegistry,
        entries: [
          activeRegistry.entries[0],
          { name: "Пальто", normalizedName: "пальто", productId: "auto-009" },
        ],
      })
    ).toContain("переназначает");
  });
});
