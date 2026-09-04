import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assertProductIdRegistry, createDataBundle, updateCatalogPrices } from "../lib/dataBundle.ts";
import { resolvePython, pythonArgs } from "./python_runtime.mjs";
import { ROOT_DIR, PREVIEW_FILE, readLocalSnapshot, readManualMoney, writeSnapshot } from "./local_snapshot.mjs";

export function buildSnapshot({ registry, fetchSheet = false, excelFile, rootDir = ROOT_DIR } = {}) {
  const productIdRegistry = registry ?? readLocalSnapshot({ rootDir }).productIdRegistry;
  assertProductIdRegistry(productIdRegistry);
  const money = readManualMoney(rootDir);
  const python = resolvePython({ rootDir, requiredModules: ["openpyxl"] });
  const args = [path.join(ROOT_DIR, "Excel/parse_excel.py")];
  if (fetchSheet) args.push("--fetch");
  else if (excelFile) args.push("--file", excelFile);
  const result = spawnSync(python.command, pythonArgs(python, args), {
    cwd: rootDir,
    input: JSON.stringify(productIdRegistry),
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Импорт XLSX остановлен: ${result.stderr.trim()}`);
  const data = { ...JSON.parse(result.stdout), money };
  updateCatalogPrices(data.products, data.shipments);
  return createDataBundle(data);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const snapshot = buildSnapshot();
    writeSnapshot(path.join(ROOT_DIR, PREVIEW_FILE), snapshot);
    console.log(`OK: локальный preview ${snapshot.version}; ${snapshot.shipments.length} поставок, ${snapshot.products.products.length} товаров. Production не изменён.`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}
