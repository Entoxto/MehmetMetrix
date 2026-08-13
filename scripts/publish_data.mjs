import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const dryRun = process.argv.includes("--dry-run");

function loadLocalPublishEnv() {
  const envPath = path.join(rootDir, ".env.publish.local");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function run(executable, args, label) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(executable, args, {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`${label}: команда завершилась с кодом ${result.status}`);
  }
}

function resolvePython() {
  const bundledPython = process.env.USERPROFILE
    ? path.join(
        process.env.USERPROFILE,
        ".cache",
        "codex-runtimes",
        "codex-primary-runtime",
        "dependencies",
        "python",
        process.platform === "win32" ? "python.exe" : "bin/python3"
      )
    : null;
  const candidates = [
    process.env.MEHMET_PYTHON,
    bundledPython,
    process.platform === "win32" ? "python" : "python3",
    "python",
  ].filter(Boolean);

  for (const candidate of new Set(candidates)) {
    const result = spawnSync(candidate, ["-c", "import pandas, openpyxl"], {
      cwd: rootDir,
      encoding: "utf8",
      shell: false,
    });
    if (result.status === 0) return candidate;
  }

  throw new Error(
    "Не найден Python с pandas и openpyxl. Укажите подходящий путь в MEHMET_PYTHON."
  );
}

function readJson(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function buildBundle() {
  const payload = {
    shipments: readJson("data/shipments.json"),
    products: readJson("data/products.json"),
    money: readJson("data/money.json"),
    meta: readJson("data/meta.json"),
  };
  const sourceHash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
  const publishedAt = new Date().toISOString();
  const timestamp = publishedAt
    .replace(/\.\d{3}Z$/u, "Z")
    .replaceAll("-", "")
    .replaceAll(":", "");

  return {
    schemaVersion: 1,
    version: `${timestamp}-${sourceHash.slice(0, 12)}`,
    publishedAt,
    sourceHash,
    ...payload,
  };
}

async function publish(bundle) {
  const siteUrl = process.env.MEHMET_SITE_URL?.trim().replace(/\/$/u, "");
  const token = process.env.MEHMET_PUBLISH_TOKEN?.trim();

  if (!siteUrl) {
    throw new Error("Не задан MEHMET_SITE_URL");
  }
  if (!token) {
    throw new Error("Не задан MEHMET_PUBLISH_TOKEN");
  }

  console.log(`\n=== Публикация ${bundle.version} ===`);
  const response = await fetch(`${siteUrl}/api/publish-data`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(bundle),
    signal: AbortSignal.timeout(90_000),
  });
  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    result = { error: responseText || `HTTP ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(
      `Сервер отклонил публикацию (HTTP ${response.status}): ${
        result.error ?? responseText
      }`
    );
  }

  const statusResponse = await fetch(`${siteUrl}/api/data-version`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const status = await statusResponse.json();
  if (!statusResponse.ok || status.version !== bundle.version) {
    throw new Error(
      `Проверка после публикации не подтвердила версию ${bundle.version}`
    );
  }

  console.log(
    `OK: опубликована версия ${result.version}; поставок ${result.shipments}, товаров ${result.products}.`
  );
}

async function main() {
  loadLocalPublishEnv();
  const python = resolvePython();

  if (dryRun) {
    run(
      python,
      ["Excel/validate_generated_data.py"],
      "Проверка существующих JSON"
    );
    run(
      process.execPath,
      ["scripts/validate_catalog_images.mjs"],
      "Проверка изображений"
    );
  } else {
    run(python, ["Excel/fetch_google_sheet.py"], "Загрузка Google Sheet");
    run(
      python,
      ["Excel/parse_excel.py", "--auto"],
      "Преобразование XLSX в JSON"
    );
    run(
      process.execPath,
      ["scripts/preflight.mjs", "--fast"],
      "Проверка данных перед публикацией"
    );
  }

  const bundle = buildBundle();
  console.log(
    `\nПакет ${bundle.version}: ${bundle.shipments.length} поставок, ${bundle.products.products.length} товаров.`
  );

  if (dryRun) {
    console.log("DRY RUN: Netlify Blobs не изменялись.");
    return;
  }

  await publish(bundle);
}

main().catch((error) => {
  console.error(`\nERROR: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
