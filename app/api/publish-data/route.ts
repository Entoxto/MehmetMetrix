import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { assertPublishedDataBundle, createDataBundle } from "@/lib/dataBundle";
import {
  registryHistoryConflict,
  registryPublicationConflict,
} from "@/lib/publicationRegistry";
import {
  CURRENT_DATA_KEY,
  openDataStoreForPublishing,
} from "@/lib/dataSource";
import type { DataPublicationRequest, PublishedDataBundle } from "@/types/dataBundle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 2 * 1024 * 1024;

function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.MEHMET_PUBLISH_TOKEN?.trim();
  const authorization = request.headers.get("authorization") ?? "";
  const providedToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!expectedToken || !providedToken) {
    return false;
  }

  const expected = new TextEncoder().encode(expectedToken);
  const provided = new TextEncoder().encode(providedToken);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

function uniquePhotoPaths(bundle: PublishedDataBundle): string[] {
  return Array.from(
    new Set(
      bundle.products.products
        .map((product) => product.photo)
        .filter((photo): photo is string => Boolean(photo))
    )
  );
}

async function assertPhotosAreDeployed(
  bundle: PublishedDataBundle,
  requestUrl: string
): Promise<void> {
  const photoPaths = uniquePhotoPaths(bundle);
  const invalidPath = photoPaths.find(
    (photo) =>
      !photo.startsWith("/images/products/jpg/") ||
      photo.includes("..") ||
      photo.includes("\\")
  );

  if (invalidPath) {
    throw new Error(`Недопустимый путь фотографии: ${invalidPath}`);
  }

  const pending = [...photoPaths];
  const missing: string[] = [];
  const workerCount = Math.min(6, pending.length);

  async function checkPhoto(photo: string): Promise<string | null> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(new URL(photo, requestUrl), {
          method: "HEAD",
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        });
        return response.ok ? null : `${photo} (HTTP ${response.status})`;
      } catch (error) {
        if (attempt === 0) continue;
        const message = error instanceof Error ? error.message : "неизвестная ошибка";
        return `${photo} (сетевая ошибка: ${message})`;
      }
    }

    return `${photo} (не удалось проверить)`;
  }

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (pending.length > 0) {
        const photo = pending.shift();
        if (!photo) return;
        const result = await checkPhoto(photo);
        if (result) missing.push(result);
      }
    })
  );

  if (missing.length > 0) {
    throw new Error(
      `Публикация ссылается на фотографии, которых ещё нет в текущем деплое: ${missing.sort().join(
        ", "
      )}`
    );
  }
}

function metadataFor(bundle: PublishedDataBundle) {
  return {
    schemaVersion: bundle.schemaVersion,
    version: bundle.version,
    publishedAt: bundle.publishedAt,
    sourceHash: bundle.sourceHash,
  };
}

async function readCurrentBundle() {
  const current = await openDataStoreForPublishing().getWithMetadata(CURRENT_DATA_KEY, {
    consistency: "strong",
    type: "json",
  });
  if (current === null) return null;
  assertPublishedDataBundle(current.data);
  return { bundle: current.data, etag: current.etag };
}

function success(bundle: PublishedDataBundle) {
  return NextResponse.json({ ok: true, ...metadataFor(bundle) });
}

function sameVersion(a: PublishedDataBundle, b: PublishedDataBundle): boolean {
  return a.version === b.version && a.sourceHash === b.sourceHash && a.publishedAt === b.publishedAt;
}

/**
 * Returns only the publication state needed by the next parser. The registry
 * is intentionally optional so a pre-migration production bundle remains
 * readable until the first bundle created by this version of the publisher.
 */
export async function GET(request: Request) {
  if (!process.env.MEHMET_PUBLISH_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "На сервере не настроен MEHMET_PUBLISH_TOKEN" },
      { status: 503 }
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 401 });
  }

  try {
    const current = await readCurrentBundle();
    return NextResponse.json(
      {
        version: current?.bundle.version ?? null,
        productIdRegistry: current?.bundle.productIdRegistry ?? null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!process.env.MEHMET_PUBLISH_TOKEN?.trim()) {
    return NextResponse.json(
      { error: "На сервере не настроен MEHMET_PUBLISH_TOKEN" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Пакет данных слишком большой" }, { status: 413 });
  }

  let storagePhase = false;
  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Пакет данных слишком большой" }, { status: 413 });
    }
    const incoming: unknown = JSON.parse(body);
    assertPublishedDataBundle(incoming);
    if (incoming.productIdRegistry === undefined) {
      return NextResponse.json(
        { error: "Новая публикация обязана содержать productIdRegistry" },
        { status: 409 }
      );
    }
    // Canonical stored data excludes the command's registryBaseVersion.
    const bundle = createDataBundle(incoming, incoming.publishedAt);
    if (bundle.version !== incoming.version) {
      throw new Error("version не соответствует publishedAt пакета");
    }
    storagePhase = true;
    const store = openDataStoreForPublishing();
    const current = await readCurrentBundle();
    if (current && sameVersion(current.bundle, bundle)) return success(bundle);

    const conflict = registryPublicationConflict({
      currentVersion: current?.bundle.version ?? null,
      incomingBaseVersion: (incoming as DataPublicationRequest).registryBaseVersion,
      incomingHasRegistry: true,
    }) || (current?.bundle.productIdRegistry && registryHistoryConflict(
      current.bundle.productIdRegistry, incoming.productIdRegistry
    ));
    if (conflict) {
      return NextResponse.json({ error: conflict, currentVersion: current?.bundle.version ?? null }, { status: 409 });
    }
    storagePhase = false;
    await assertPhotosAreDeployed(bundle, request.url);
    storagePhase = true;
    const serialized = JSON.stringify(bundle);
    const metadata = metadataFor(bundle);
    const versionKey = `versions/${bundle.version}`;
    const versionWrite = await store.set(versionKey, serialized, { metadata, onlyIfNew: true });
    if (!versionWrite.modified) {
      const archived = await store.get(versionKey, { consistency: "strong", type: "json" });
      assertPublishedDataBundle(archived);
      if (!sameVersion(archived, bundle)) {
        return NextResponse.json({ error: "Ключ версии занят другим пакетом" }, { status: 409 });
      }
      // An identical archived candidate can resume after an interrupted request.
    }
    const currentWrite = await store.set(CURRENT_DATA_KEY, serialized, {
      metadata,
      ...(current ? { onlyIfMatch: current.etag } : { onlyIfNew: true }),
    });
    if (!currentWrite.modified) {
      const latest = await readCurrentBundle();
      if (latest && sameVersion(latest.bundle, bundle)) return success(bundle);
      return NextResponse.json({
        error: "Версия изменилась параллельно. Повторите публикацию с новым реестром.",
        currentVersion: latest?.bundle.version ?? null,
      }, { status: 409 });
    }
    return success(bundle);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Публикация данных остановлена:", error);
    return NextResponse.json({
      error: message,
      ...(storagePhase ? { publicationState: "unknown" } : {}),
    }, { status: storagePhase ? 503 : 400 });
  }
}
