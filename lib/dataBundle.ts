import type { PublishedDataBundle } from "@/types/dataBundle";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDateString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function assertPublishedDataBundle(
  value: unknown
): asserts value is PublishedDataBundle {
  if (!isRecord(value)) {
    throw new Error("Пакет данных должен быть JSON-объектом");
  }

  if (value.schemaVersion !== 1) {
    throw new Error("Неподдерживаемая версия схемы пакета данных");
  }

  if (
    !isNonEmptyString(value.version) ||
    !/^\d{8}T\d{6}Z-[a-f0-9]{12}$/u.test(value.version)
  ) {
    throw new Error("В пакете данных отсутствует корректный version");
  }

  if (!isValidDateString(value.publishedAt)) {
    throw new Error("В пакете данных отсутствует корректный publishedAt");
  }

  if (
    !isNonEmptyString(value.sourceHash) ||
    !/^[a-f0-9]{64}$/u.test(value.sourceHash)
  ) {
    throw new Error("В пакете данных отсутствует корректный sourceHash");
  }

  if (!Array.isArray(value.shipments)) {
    throw new Error("В пакете данных отсутствует массив shipments");
  }

  if (!isRecord(value.products) || !Array.isArray(value.products.products)) {
    throw new Error("В пакете данных отсутствует products.products");
  }

  if (!isRecord(value.money)) {
    throw new Error("В пакете данных отсутствует money");
  }

  if (!isRecord(value.meta)) {
    throw new Error("В пакете данных отсутствует meta");
  }
}
