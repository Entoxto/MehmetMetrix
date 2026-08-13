import { getStore } from "@netlify/blobs";
import { unstable_noStore as noStore } from "next/cache";
import metaData from "@/data/meta.json";
import moneyData from "@/data/money.json";
import productsData from "@/data/products.json";
import shipmentsData from "@/data/shipments.json";
import { assertPublishedDataBundle } from "@/lib/dataBundle";
import type {
  DataMeta,
  MoneyConfig,
  PublishedDataBundle,
} from "@/types/dataBundle";
import type { ProductsData } from "@/types/product";
import type { ShipmentConfig } from "@/types/shipment";

export const DATA_BLOB_STORE = "mehmet-metrics-data";
export const CURRENT_DATA_KEY = "current";

function createEmbeddedBundle(): PublishedDataBundle {
  const meta = metaData as DataMeta;
  const updatedAt = meta.updatedAt;
  const publishedAt =
    updatedAt && !Number.isNaN(Date.parse(updatedAt))
      ? updatedAt
      : "1970-01-01T00:00:00.000Z";

  return {
    schemaVersion: 1,
    version: `embedded-${publishedAt}`,
    publishedAt,
    sourceHash: "embedded-build-snapshot",
    shipments: shipmentsData as ShipmentConfig[],
    products: productsData as ProductsData,
    money: moneyData as MoneyConfig,
    meta,
  };
}

function shouldReadNetlifyBlobs(): boolean {
  const env = process.env;

  if (env.MEHMET_DATA_SOURCE === "local") {
    return false;
  }

  if (env.MEHMET_DATA_SOURCE === "netlify-blobs") {
    return true;
  }

  return (
    env.NETLIFY === "true" ||
    Boolean(env.NETLIFY_BLOBS_CONTEXT) ||
    Boolean(env.NETLIFY_SITE_ID && env.NETLIFY_AUTH_TOKEN)
  );
}

function getDataStore() {
  const env = process.env;
  const name = env.MEHMET_DATA_STORE?.trim() || DATA_BLOB_STORE;
  const siteID = env.NETLIFY_SITE_ID?.trim();
  const token = env.NETLIFY_AUTH_TOKEN?.trim();

  if (siteID && token) {
    return getStore({ name, siteID, token, consistency: "strong" });
  }

  return getStore({ name, consistency: "strong" });
}

/**
 * Returns the last explicitly published bundle in Netlify and falls back to
 * the build snapshot locally, before the first publication, or during a Blob
 * outage. noStore keeps normal page requests independent from a new deploy.
 */
export async function getDataBundle(): Promise<PublishedDataBundle> {
  noStore();
  const embeddedBundle = createEmbeddedBundle();

  if (!shouldReadNetlifyBlobs()) {
    return embeddedBundle;
  }

  try {
    const bundle = await getDataStore().get(CURRENT_DATA_KEY, {
      consistency: "strong",
      type: "json",
    });

    if (bundle === null) {
      return embeddedBundle;
    }

    assertPublishedDataBundle(bundle);
    return bundle;
  } catch (error) {
    console.error(
      "Не удалось прочитать опубликованные данные из Netlify Blobs; используется встроенный снимок.",
      error
    );
    return embeddedBundle;
  }
}

export function openDataStoreForPublishing() {
  return getDataStore();
}
