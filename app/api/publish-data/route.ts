import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { assertPublishedDataBundle } from "@/lib/dataBundle";
import {
  CURRENT_DATA_KEY,
  openDataStoreForPublishing,
} from "@/lib/dataSource";
import type { PublishedDataBundle } from "@/types/dataBundle";

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

  const results = await Promise.all(
    photoPaths.map(async (photo) => {
      const response = await fetch(new URL(photo, requestUrl), {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      return response.ok ? null : `${photo} (HTTP ${response.status})`;
    })
  );
  const missing = results.filter((item): item is string => item !== null);

  if (missing.length > 0) {
    throw new Error(
      `Публикация ссылается на фотографии, которых ещё нет в текущем деплое: ${missing.join(
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

  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Пакет данных слишком большой" }, { status: 413 });
    }

    const bundle: unknown = JSON.parse(body);
    assertPublishedDataBundle(bundle);

    const calculatedHash = createHash("sha256")
      .update(
        JSON.stringify({
          shipments: bundle.shipments,
          products: bundle.products,
          money: bundle.money,
          meta: bundle.meta,
        })
      )
      .digest("hex");
    if (calculatedHash !== bundle.sourceHash) {
      throw new Error("sourceHash не соответствует содержимому пакета");
    }
    if (!bundle.version.endsWith(bundle.sourceHash.slice(0, 12))) {
      throw new Error("version не соответствует sourceHash пакета");
    }

    await assertPhotosAreDeployed(bundle, request.url);

    const store = openDataStoreForPublishing();
    const currentBefore = await store.getMetadata(CURRENT_DATA_KEY, {
      consistency: "strong",
    });
    const serialized = JSON.stringify(bundle);
    const metadata = metadataFor(bundle);
    const versionKey = `versions/${bundle.version}`;

    const versionWrite = await store.set(versionKey, serialized, {
      metadata,
      onlyIfNew: true,
    });
    if (!versionWrite.modified) {
      throw new Error(`Версия ${bundle.version} уже существует`);
    }

    const currentWrite = await store.set(CURRENT_DATA_KEY, serialized, {
      metadata,
      ...(currentBefore
        ? { onlyIfMatch: currentBefore.etag }
        : { onlyIfNew: true }),
    });
    if (!currentWrite.modified) {
      return NextResponse.json(
        {
          error:
            "Опубликованная версия изменилась параллельно. Текущий снимок не заменён; повторите публикацию после проверки.",
          preservedVersion: bundle.version,
        },
        { status: 409 }
      );
    }

    const verified = await store.get(CURRENT_DATA_KEY, {
      consistency: "strong",
      type: "json",
    });
    assertPublishedDataBundle(verified);
    if (verified.version !== bundle.version) {
      throw new Error("Проверка опубликованной версии не совпала с отправленной");
    }

    return NextResponse.json({
      ok: true,
      version: bundle.version,
      publishedAt: bundle.publishedAt,
      shipments: bundle.shipments.length,
      products: bundle.products.products.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("Публикация данных остановлена:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
