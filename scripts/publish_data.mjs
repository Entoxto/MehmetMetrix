import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { assertProductIdRegistry } from "../lib/dataBundle.ts";
import { buildSnapshot } from "./build_snapshot.mjs";
import { validateCatalogImages } from "./validate_catalog_images.mjs";
import { ROOT_DIR, SNAPSHOT_FILE, PREVIEW_FILE, localCandidate, readLocalSnapshot, writeSnapshot } from "./local_snapshot.mjs";

function postJsonWithPowerShell(url, token, body) {
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
    MEHMET_PUBLISH_TOKEN: token,
  };
  let lastMissingExecutable = null;

  for (const executable of ["pwsh", "powershell"]) {
    const result = spawnSync(
      executable,
      ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
      {
        cwd: ROOT_DIR,
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
    return postJsonWithPowerShell(url, token, body);
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

async function publishedVersion(siteUrl) {
  const response = await fetch(`${siteUrl}/api/data-version`, {
    cache: "no-store", signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`data-version: HTTP ${response.status}`);
  return response.json();
}

function isExpectedVersion(status, bundle) {
  return status.version === bundle.version && status.sourceHash === bundle.sourceHash;
}

export async function publishData({ dryRun = false, rootDir = ROOT_DIR } = {}) {
  // Offline means offline, even when the checkout has publication credentials.
  if (dryRun) {
    const bundle = localCandidate(rootDir);
    validateCatalogImages(bundle.products, rootDir);
    console.log(`DRY RUN: проверен локальный пакет ${bundle.version}. Сеть и файлы не изменялись.`);
    return bundle;
  }

  const envPath = path.join(rootDir, ".env.publish.local");
  if (existsSync(envPath)) loadEnvFile(envPath);
  const siteUrl = process.env.MEHMET_SITE_URL?.trim().replace(/\/$/u, "");
  const token = process.env.MEHMET_PUBLISH_TOKEN?.trim();
  if (!siteUrl || !token) throw new Error("Нужны MEHMET_SITE_URL и MEHMET_PUBLISH_TOKEN до запуска импорта");

  const registryResponse = await fetch(`${siteUrl}/api/publish-data`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store", signal: AbortSignal.timeout(30_000),
  });
  if (!registryResponse.ok) {
    throw new Error(`GET publish-data: HTTP ${registryResponse.status}. Проверьте deployment и настройки; импорт не запускался.`);
  }
  const current = await registryResponse.json();
  if (current.version !== null && typeof current.version !== "string") throw new Error("API не вернул текущую version");
  if (current.version !== null && !current.productIdRegistry) {
    throw new Error("Текущий пакет не содержит registry. Требуется завершить миграцию deployment до публикации.");
  }
  const registry = current.productIdRegistry ?? readLocalSnapshot({ rootDir, preview: false }).productIdRegistry;
  assertProductIdRegistry(registry);
  const bundle = buildSnapshot({ registry, fetchSheet: true, rootDir });
  validateCatalogImages(bundle.products, rootDir);
  const body = JSON.stringify({ ...bundle, registryBaseVersion: current.version });
  console.log(`Публикация ${bundle.version}`);

  let confirmed = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await postJson(`${siteUrl}/api/publish-data`, token, body)
      .catch((error) => ({ status: 0, body: error.message }));
    if (response.status >= 400 && response.status < 500) {
      throw new Error(`Запрос отклонён (HTTP ${response.status}): ${response.body}. Локальный snapshot не изменён; после прерванной попытки проверьте /api/data-version.`);
    }
    const status = await publishedVersion(siteUrl).catch(() => null);
    if (status && isExpectedVersion(status, bundle)) {
      confirmed = true;
      break;
    }
    // Re-send the identical candidate, including base/version/hash. Never parse
    // again inside a retry: the server either confirms it or rejects a conflict.
  }
  if (!confirmed) {
    throw new Error(`Результат публикации ${bundle.version} пока неизвестен. POST мог переключить current; проверьте /api/data-version. Локальный подтверждённый snapshot не заменён.`);
  }

  try {
    writeSnapshot(path.join(rootDir, SNAPSHOT_FILE), bundle);
    rmSync(path.join(rootDir, PREVIEW_FILE), { force: true });
  } catch (error) {
    console.warn(`Production подтверждён, но локальный snapshot/preview не обновлён: ${error.message}`);
  }
  console.log(`OK: опубликована и проверена ${bundle.version}; ${bundle.shipments.length} поставок, ${bundle.products.products.length} товаров.`);
  return bundle;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  publishData({ dryRun: process.argv.includes("--dry-run") }).catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
