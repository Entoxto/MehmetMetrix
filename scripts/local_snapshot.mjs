import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertMoney, assertProductIdRegistry, assertPublishedDataBundle, createDataBundle } from "../lib/dataBundle.ts";

export const ROOT_DIR = path.resolve(import.meta.dirname, "..");
export const SNAPSHOT_FILE = "data/snapshot.json";
export const PREVIEW_FILE = "tmp/preview-snapshot.json";

export function readLocalSnapshot({ rootDir = ROOT_DIR, preview = true } = {}) {
  const previewPath = path.join(rootDir, PREVIEW_FILE);
  const filePath = preview && existsSync(previewPath) ? previewPath : path.join(rootDir, SNAPSHOT_FILE);
  const snapshot = JSON.parse(readFileSync(filePath, "utf8"));
  assertPublishedDataBundle(snapshot);
  assertProductIdRegistry(snapshot.productIdRegistry);
  return snapshot;
}

export function readManualMoney(rootDir = ROOT_DIR) {
  const money = JSON.parse(readFileSync(path.join(rootDir, "data/money.json"), "utf8"));
  assertMoney(money);
  return money;
}

export function localCandidate(rootDir = ROOT_DIR) {
  const snapshot = readLocalSnapshot({ rootDir });
  return createDataBundle({ ...snapshot, money: readManualMoney(rootDir) }, snapshot.publishedAt);
}

export function writeSnapshot(filePath, snapshot) {
  assertPublishedDataBundle(snapshot);
  assertProductIdRegistry(snapshot.productIdRegistry);
  mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    renameSync(temporaryPath, filePath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    readLocalSnapshot({ preview: false });
    const candidate = localCandidate();
    console.log(`OK: snapshot и ручные финансы валидны; ${candidate.shipments.length} поставок, ${candidate.products.products.length} товаров.`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
