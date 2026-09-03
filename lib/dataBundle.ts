import type {
  ProductIdRegistryData,
  PublishedDataBundle,
} from "@/types/dataBundle";

const PRODUCT_CATEGORIES = new Set(["Мех", "Замша", "Кожа", "Экзотика"]);
const SHIPMENT_SIZE_KEYS = new Set(["xs", "s", "m", "l", "xl", "OneSize"]);
const PRODUCT_SIZE_KEYS = new Set(["xs", "s", "m", "l", "xl", "OneSize"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(path: string, expectation: string): never {
  throw new Error(`${path}: ${expectation}`);
}

function assertRecord(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) fail(path, "ожидался JSON-объект");
}

function assertNonEmptyString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(path, "ожидалась непустая строка");
  }
}

function assertOptionalText(value: unknown, path: string): void {
  if (value !== undefined) assertNonEmptyString(value, path);
}

function assertOptionalBoolean(value: unknown, path: string): void {
  if (value !== undefined && typeof value !== "boolean") fail(path, "ожидался boolean");
}

function assertPositiveNumber(value: unknown, path: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    fail(path, "ожидалось конечное число больше нуля");
  }
}

function assertOptionalPositiveNumber(value: unknown, path: string): void {
  if (value !== undefined) assertPositiveNumber(value, path);
}

function assertProductIdRegistry(
  value: unknown,
  path = "productIdRegistry"
): asserts value is ProductIdRegistryData {
  assertRecord(value, path);
  if (value.schemaVersion !== 1) {
    fail(`${path}.schemaVersion`, "ожидалось значение 1");
  }
  if (
    !Number.isInteger(value.nextAutoNumber) ||
    (value.nextAutoNumber as number) <= 0
  ) {
    fail(`${path}.nextAutoNumber`, "ожидалось целое число больше нуля");
  }
  if (!Array.isArray(value.entries)) fail(`${path}.entries`, "ожидался массив");

  const names = new Set<string>();
  const ids = new Set<string>();
  let maxAutoNumber = 0;
  value.entries.forEach((entry, index) => {
    const entryPath = `${path}.entries[${index}]`;
    assertRecord(entry, entryPath);
    assertNonEmptyString(entry.name, `${entryPath}.name`);
    assertNonEmptyString(entry.normalizedName, `${entryPath}.normalizedName`);
    assertNonEmptyString(entry.productId, `${entryPath}.productId`);
    const normalized = entry.name
      .normalize("NFKC")
      .trim()
      .replace(/\s+/gu, " ")
      .toLowerCase();
    if (entry.normalizedName !== normalized) {
      fail(`${entryPath}.normalizedName`, "не соответствует name");
    }
    if (names.has(entry.normalizedName)) {
      fail(`${entryPath}.normalizedName`, "повторяющееся имя");
    }
    names.add(entry.normalizedName);
    const match = /^auto-(\d+)$/iu.exec(entry.productId);
    if (!match) fail(`${entryPath}.productId`, "ожидался ID вида auto-NNN");
    if (ids.has(entry.productId.toLowerCase())) {
      fail(`${entryPath}.productId`, "повторяющийся ID");
    }
    ids.add(entry.productId.toLowerCase());
    maxAutoNumber = Math.max(maxAutoNumber, Number(match[1]));
  });

  if ((value.nextAutoNumber as number) <= maxAutoNumber) {
    fail(
      `${path}.nextAutoNumber`,
      "должно быть больше всех выданных auto-ID"
    );
  }
}

function assertRawItem(value: unknown, path: string): void {
  assertRecord(value, path);
  assertNonEmptyString(value.productId, `${path}.productId`);
  assertOptionalText(value.overrideName, `${path}.overrideName`);
  assertOptionalText(value.status, `${path}.status`);
  assertOptionalText(value.note, `${path}.note`);
  assertOptionalBoolean(value.sizesUnknown, `${path}.sizesUnknown`);
  assertOptionalBoolean(value.underQuestion, `${path}.underQuestion`);
  assertOptionalBoolean(value.sample, `${path}.sample`);
  assertOptionalBoolean(value.paidPreviously, `${path}.paidPreviously`);
  assertOptionalBoolean(value.noPayment, `${path}.noPayment`);
  assertOptionalPositiveNumber(value.price, `${path}.price`);
  assertOptionalPositiveNumber(value.cost, `${path}.cost`);

  if (
    value.quantityOverride !== undefined &&
    (!Number.isInteger(value.quantityOverride) || (value.quantityOverride as number) <= 0)
  ) {
    fail(`${path}.quantityOverride`, "ожидалось целое число больше нуля");
  }

  if (value.sizes !== undefined) {
    assertRecord(value.sizes, `${path}.sizes`);
    if (value.sizesUnknown === true) {
      fail(path, "sizes и sizesUnknown не могут быть заданы одновременно");
    }
    if (value.quantityOverride !== undefined) {
      fail(path, "sizes и quantityOverride не могут быть заданы одновременно");
    }
    for (const [size, count] of Object.entries(value.sizes)) {
      if (!SHIPMENT_SIZE_KEYS.has(size)) fail(`${path}.sizes.${size}`, "неизвестный размер");
      if (!Number.isInteger(count) || (count as number) < 0) {
        fail(`${path}.sizes.${size}`, "ожидалось целое количество не меньше нуля");
      }
    }
  }

  if (value.sizesUnknown === true && value.quantityOverride === undefined) {
    fail(path, "sizesUnknown требует quantityOverride");
  }
  if (value.quantityOverride !== undefined && value.sizesUnknown !== true) {
    fail(path, "quantityOverride допустим только вместе с sizesUnknown");
  }
}

function assertShipments(value: unknown): void {
  if (!Array.isArray(value)) fail("shipments", "ожидался массив");
  const ids = new Set<string>();
  value.forEach((shipment, index) => {
    const path = `shipments[${index}]`;
    assertRecord(shipment, path);
    assertNonEmptyString(shipment.id, `${path}.id`);
    if (ids.has(shipment.id)) fail(`${path}.id`, "повторяющийся ID");
    ids.add(shipment.id);
    assertNonEmptyString(shipment.title, `${path}.title`);
    assertNonEmptyString(shipment.status, `${path}.status`);
    assertOptionalText(shipment.eta, `${path}.eta`);
    assertOptionalText(shipment.receivedDate, `${path}.receivedDate`);
    if (shipment.year !== undefined && !Number.isInteger(shipment.year)) {
      fail(`${path}.year`, "ожидалось целое число");
    }
    if (!Array.isArray(shipment.rawItems) || shipment.rawItems.length === 0) {
      fail(`${path}.rawItems`, "ожидался непустой массив");
    }
    shipment.rawItems.forEach((item, itemIndex) =>
      assertRawItem(item, `${path}.rawItems[${itemIndex}]`)
    );
  });
}

function assertMaterials(value: unknown, path: string): void {
  if (value === undefined) return;
  assertRecord(value, path);
  assertOptionalText(value.outer, `${path}.outer`);
  assertOptionalText(value.lining, `${path}.lining`);
  assertOptionalText(value.comments, `${path}.comments`);
}

function assertProducts(value: unknown): void {
  assertRecord(value, "products");
  if (!Array.isArray(value.products)) fail("products.products", "ожидался массив");
  const ids = new Set<string>();
  value.products.forEach((product, index) => {
    const path = `products.products[${index}]`;
    assertRecord(product, path);
    assertNonEmptyString(product.id, `${path}.id`);
    if (ids.has(product.id)) fail(`${path}.id`, "повторяющийся ID");
    ids.add(product.id);
    assertNonEmptyString(product.name, `${path}.name`);
    if (!PRODUCT_CATEGORIES.has(product.category as string)) {
      fail(`${path}.category`, "неизвестная категория");
    }
    assertOptionalText(product.photo, `${path}.photo`);
    assertOptionalPositiveNumber(product.price, `${path}.price`);
    assertOptionalPositiveNumber(product.cost, `${path}.cost`);
    assertMaterials(product.materials, `${path}.materials`);

    if (!Array.isArray(product.excelRows) || product.excelRows.length === 0) {
      fail(`${path}.excelRows`, "ожидался непустой массив");
    }
    const rows = new Set<number>();
    product.excelRows.forEach((row, rowIndex) => {
      if (!Number.isInteger(row) || row <= 0) {
        fail(`${path}.excelRows[${rowIndex}]`, "ожидалось целое число больше нуля");
      }
      if (rows.has(row)) fail(`${path}.excelRows[${rowIndex}]`, "повторяющаяся строка");
      rows.add(row);
    });

    if (!Array.isArray(product.sizes)) fail(`${path}.sizes`, "ожидался массив");
    const sizes = new Set<string>();
    product.sizes.forEach((size, sizeIndex) => {
      if (typeof size !== "string" || !PRODUCT_SIZE_KEYS.has(size)) {
        fail(`${path}.sizes[${sizeIndex}]`, "неизвестный размер");
      }
      if (sizes.has(size)) fail(`${path}.sizes[${sizeIndex}]`, "повторяющийся размер");
      sizes.add(size);
    });
  });
}

function assertMoney(value: unknown): void {
  assertRecord(value, "money");
  if (value.pendingManual !== undefined && !Array.isArray(value.pendingManual)) {
    fail("money.pendingManual", "ожидался массив");
  }
  if (value.deposits !== undefined && !Array.isArray(value.deposits)) {
    fail("money.deposits", "ожидался массив");
  }
  const pending = value.pendingManual ?? [];
  const deposits = value.deposits ?? [];
  if (!Array.isArray(pending)) fail("money.pendingManual", "ожидался массив");
  if (!Array.isArray(deposits)) fail("money.deposits", "ожидался массив");

  pending.forEach((item, index) => {
    const path = `money.pendingManual[${index}]`;
    assertRecord(item, path);
    assertOptionalText(item.id, `${path}.id`);
    assertNonEmptyString(item.title, `${path}.title`);
    assertPositiveNumber(item.amount, `${path}.amount`);
  });

  deposits.forEach((item, index) => {
    const path = `money.deposits[${index}]`;
    assertRecord(item, path);
    assertOptionalText(item.id, `${path}.id`);
    assertOptionalText(item.title, `${path}.title`);
    assertPositiveNumber(item.amount, `${path}.amount`);
    if (item.lines !== undefined) {
      if (!Array.isArray(item.lines) || item.lines.length === 0) {
        fail(`${path}.lines`, "ожидался непустой массив строк");
      }
      item.lines.forEach((line, lineIndex) =>
        assertNonEmptyString(line, `${path}.lines[${lineIndex}]`)
      );
    } else if (item.title === undefined) {
      fail(path, "требуется title или lines");
    }
  });
}

function assertMeta(value: unknown): void {
  assertRecord(value, "meta");
  assertNonEmptyString(value.updatedAt, "meta.updatedAt");
  if (!/^\d{4}-\d{2}-\d{2}T/u.test(value.updatedAt) || Number.isNaN(Date.parse(value.updatedAt))) {
    fail("meta.updatedAt", "ожидалась ISO-дата");
  }
  if (value.source !== "excel") fail("meta.source", "ожидалось значение 'excel'");
}

function assertCrossReferences(value: Record<string, unknown>): void {
  const productList = (value.products as { products: Array<Record<string, unknown>> }).products;
  const productIds = new Set(productList.map((product) => product.id as string));
  const shipmentList = value.shipments as Array<Record<string, unknown>>;
  shipmentList.forEach((shipment, shipmentIndex) => {
    (shipment.rawItems as Array<Record<string, unknown>>).forEach((item, itemIndex) => {
      if (!productIds.has(item.productId as string)) {
        fail(
          `shipments[${shipmentIndex}].rawItems[${itemIndex}].productId`,
          "товар отсутствует в products.products"
        );
      }
    });
  });
}

export function assertPublishedDataBundle(
  value: unknown
): asserts value is PublishedDataBundle {
  assertRecord(value, "bundle");

  if (value.schemaVersion !== 1) {
    throw new Error("Неподдерживаемая версия схемы пакета данных");
  }
  if (
    typeof value.version !== "string" ||
    !/^\d{8}T\d{6}Z-[a-f0-9]{12}$/u.test(value.version)
  ) {
    throw new Error("В пакете данных отсутствует корректный version");
  }
  if (
    typeof value.publishedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T/u.test(value.publishedAt) ||
    Number.isNaN(Date.parse(value.publishedAt))
  ) {
    throw new Error("В пакете данных отсутствует корректный publishedAt");
  }
  if (
    typeof value.sourceHash !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.sourceHash)
  ) {
    throw new Error("В пакете данных отсутствует корректный sourceHash");
  }

  assertShipments(value.shipments);
  assertProducts(value.products);
  assertMoney(value.money);
  assertMeta(value.meta);
  if (value.productIdRegistry !== undefined) {
    assertProductIdRegistry(value.productIdRegistry);
  }
  if (
    value.registryBaseVersion !== undefined &&
    value.registryBaseVersion !== null
  ) {
    assertNonEmptyString(value.registryBaseVersion, "bundle.registryBaseVersion");
  }
  assertCrossReferences(value);
}
