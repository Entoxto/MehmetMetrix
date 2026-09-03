import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { resolvePython, pythonArgs } from "./python_runtime.mjs";

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

function postJsonWithPowerShell(url, body) {
  const script = String.raw`
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$headers = @{ Authorization = "Bearer $env:MEHMET_PUBLISH_TOKEN" }
$body = [Convert]::FromBase64String([Console]::In.ReadToEnd())

try {
  $requestParameters = @{
    Uri = $env:MEHMET_PUBLISH_URL
    Method = "Post"
    Headers = $headers
    ContentType = "application/json; charset=utf-8"
    Body = $body
    TimeoutSec = 90
  }
  $response = Invoke-WebRequest @requestParameters
  $statusCode = [int]$response.StatusCode
  $responseBody = [string]$response.Content
} catch {
  $errorResponse = $_.Exception.Response
  if ($null -eq $errorResponse) {
    throw
  }

  $statusCode = [int]$errorResponse.StatusCode
  if (-not [string]::IsNullOrWhiteSpace($_.ErrorDetails.Message)) {
    $responseBody = [string]$_.ErrorDetails.Message
  } elseif ($null -ne $errorResponse.Content) {
    $responseBody = $errorResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult()
  } else {
    $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
    try {
      $responseBody = $reader.ReadToEnd()
    } finally {
      $reader.Dispose()
    }
  }
}

[Console]::Out.Write([string]$statusCode)
[Console]::Out.Write([Environment]::NewLine)
[Console]::Out.Write($responseBody)
`;
  const env = {
    ...process.env,
    MEHMET_PUBLISH_URL: url,
  };
  let lastMissingExecutable = null;

  for (const executable of ["pwsh", "powershell"]) {
    const result = spawnSync(
      executable,
      ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
      {
        cwd: rootDir,
        encoding: "utf8",
        env,
        input: Buffer.from(body, "utf8").toString("base64"),
        shell: false,
        windowsHide: true,
      }
    );

    if (result.error?.code === "ENOENT") {
      lastMissingExecutable = result.error;
      continue;
    }
    if (result.error) {
      throw new Error(`Windows HTTP-клиент: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(
        `Windows HTTP-клиент завершился с кодом ${result.status}: ${result.stderr.trim()}`
      );
    }

    const separatorIndex = result.stdout.indexOf("\n");
    if (separatorIndex < 0) {
      throw new Error("Windows HTTP-клиент вернул некорректный ответ");
    }

    return {
      body: result.stdout.slice(separatorIndex + 1),
      status: Number(result.stdout.slice(0, separatorIndex).trim()),
    };
  }

  throw new Error(
    `Не найден PowerShell для безопасной отправки пакета: ${lastMissingExecutable?.message ?? "неизвестная ошибка"}`
  );
}

async function postJson(url, token, body) {
  if (process.platform === "win32") {
    return postJsonWithPowerShell(url, body);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body,
    signal: AbortSignal.timeout(90_000),
  });

  return {
    body: await response.text(),
    status: response.status,
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
  const response = await postJson(
    `${siteUrl}/api/publish-data`,
    token,
    JSON.stringify(bundle)
  );
  const responseText = response.body;
  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    result = { error: responseText || `HTTP ${response.status}` };
  }

  if (response.status < 200 || response.status >= 300) {
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
  const python = resolvePython({ rootDir, requiredModules: ["pandas", "openpyxl"] });

  if (dryRun) {
    run(
      python.command,
      pythonArgs(python, ["Excel/validate_generated_data.py"]),
      "Проверка существующих JSON"
    );
    run(
      process.execPath,
      ["scripts/validate_catalog_images.mjs"],
      "Проверка изображений"
    );
  } else {
    run(
      python.command,
      pythonArgs(python, ["Excel/fetch_google_sheet.py"]),
      "Загрузка Google Sheet"
    );
    run(
      python.command,
      pythonArgs(python, ["Excel/parse_excel.py", "--auto"]),
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
