import { getStore } from "@netlify/blobs";
import { unstable_noStore as noStore } from "next/cache";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import snapshotData from "@/data/snapshot.json";
import { assertPublishedDataBundle } from "@/lib/dataBundle";
import type { PublishedDataBundle } from "@/types/dataBundle";

export const DATA_BLOB_STORE = "mehmet-metrics-data";
export const CURRENT_DATA_KEY = "current";

const embeddedBundle = (() => {
  const bundle: unknown = snapshotData;
  assertPublishedDataBundle(bundle);
  return bundle;
})();

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
  if (!shouldReadNetlifyBlobs()) {
    // Drafts are visible only in next dev. Builds and Blob outages always use
    // the embedded snapshot, never an unpublished preview or manual money file.
    if (process.env.NODE_ENV === "development") {
      const previewPath = path.join(process.cwd(), "tmp/preview-snapshot.json");
      if (existsSync(previewPath)) {
        const preview: unknown = JSON.parse(readFileSync(previewPath, "utf8"));
        assertPublishedDataBundle(preview);
        return preview;
      }
    }
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
