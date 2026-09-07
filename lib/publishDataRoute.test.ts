import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { createDataBundle } from "./dataBundle";
import type { PublishedDataBundle } from "@/types/dataBundle";

const store = vi.hoisted(() => ({ getWithMetadata: vi.fn(), get: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/dataSource", () => ({ CURRENT_DATA_KEY: "current", openDataStoreForPublishing: () => store }));
import { GET, POST } from "@/app/api/publish-data/route";

function candidate(amount = 1) {
  return createDataBundle({
    shipments: [], products: { products: [] }, money: { deposits: [{ title: "Test", amount }] },
    meta: { updatedAt: "2026-09-03T11:59:00.000Z", source: "excel" },
    productIdRegistry: { schemaVersion: 1, nextAutoNumber: 1, entries: [] },
  }, "2026-09-03T12:00:00.000Z");
}
function request(bundle: unknown, base: string | null = null) {
  return new Request("https://example.test/api/publish-data", {
    method: "POST", headers: { Authorization: "Bearer test-token", "Content-Type": "application/json" },
    body: JSON.stringify({ ...(bundle as object), registryBaseVersion: base }),
  });
}
let current: PublishedDataBundle | null;
let revision: number;
let archives: Map<string, PublishedDataBundle>;

beforeEach(() => {
  vi.stubEnv("MEHMET_PUBLISH_TOKEN", "test-token");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  current = null;
  revision = 0;
  archives = new Map();
  store.getWithMetadata.mockReset().mockImplementation(async () => current && ({ data: current, etag: String(revision) }));
  store.get.mockReset().mockImplementation(async (key: string) => archives.get(key) ?? null);
  store.set.mockReset().mockImplementation(async (key: string, body: string, options: { onlyIfNew?: boolean; onlyIfMatch?: string }) => {
    if (key === "current") {
      if (options.onlyIfNew ? current !== null : options.onlyIfMatch !== String(revision)) return { modified: false };
      current = JSON.parse(body);
      revision++;
    } else {
      if (archives.has(key)) return { modified: false };
      archives.set(key, JSON.parse(body));
    }
    return { modified: true };
  });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("publication transaction", () => {
  it("archives and commits a complete bundle, storing no command precondition", async () => {
    const bundle = candidate();
    expect((await POST(request(bundle))).status).toBe(200);
    expect(current).toEqual(bundle);
    expect(archives.get(`versions/${bundle.version}`)).toEqual(bundle);
    expect(current).not.toHaveProperty("registryBaseVersion");
    const state = await GET(new Request("https://example.test/api/publish-data", { headers: { Authorization: "Bearer test-token" } }));
    expect(await state.json()).toEqual({ version: bundle.version, productIdRegistry: bundle.productIdRegistry });
  });
  it("acknowledges a replay of an already committed request without writing again", async () => {
    const bundle = candidate();
    await POST(request(bundle));
    store.set.mockClear();
    expect((await POST(request(bundle))).status).toBe(200);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("resumes an identical orphan archive after failure before current commit", async () => {
    const bundle = candidate();
    archives.set(`versions/${bundle.version}`, bundle);
    expect((await POST(request(bundle))).status).toBe(200);
    expect(current).toEqual(bundle);
  });
  it("does not let an old replay overwrite a later publication", async () => {
    const old = candidate();
    current = candidate(2);
    archives.set(`versions/${old.version}`, old);
    expect((await POST(request(old))).status).toBe(409);
    expect(current.money.deposits?.[0].amount).toBe(2);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("does not reuse a registry based on a stale version", async () => {
    current = candidate();
    expect((await POST(request(candidate(2)))).status).toBe(409);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("preserves issued IDs absent from today's catalog", async () => {
    current = createDataBundle({ ...candidate(), productIdRegistry: { schemaVersion: 1, nextAutoNumber: 2, entries: [{ name: "Кожа", normalizedName: "кожа", productId: "auto-001" }] } });
    expect((await POST(request(candidate(2), current.version))).status).toBe(409);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("reports an uncertain storage outcome after a committed write loses its response", async () => {
    const bundle = candidate();
    const normalSet = store.set.getMockImplementation()!;
    store.set.mockImplementation(async (...args: unknown[]) => {
      const result = await normalSet(...args);
      if (args[0] === "current") throw new Error("Connection lost after commit");
      return result;
    });
    const response = await POST(request(bundle));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ publicationState: "unknown" });
    expect(current).toEqual(bundle);
    expect((await POST(request(bundle))).status).toBe(200);
  });
  it("preserves current when archive write fails", async () => {
    current = candidate();
    store.set.mockRejectedValue(new Error("Storage unavailable"));
    expect((await POST(request(candidate(2), current.version))).status).toBe(503);
    expect(current).toEqual(candidate());
  });
  it("uses the etag from the same read as the current registry", async () => {
    current = candidate();
    const originalVersion = current.version;
    const normalSet = store.set.getMockImplementation()!;
    store.set.mockImplementation(async (...args: unknown[]) => {
      if (args[0] === "current") { current = candidate(3); revision++; }
      return normalSet(...args);
    });
    expect((await POST(request(candidate(2), originalVersion))).status).toBe(409);
    expect(current.money.deposits?.[0].amount).toBe(3);
  });
  it("rejects tampered content before all writes", async () => {
    const bundle = candidate();
    bundle.money = {};
    expect((await POST(request(bundle))).status).toBe(400);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("rejects new legacy bundles even with a valid legacy checksum", async () => {
    const legacy = { ...candidate() };
    delete legacy.productIdRegistry;
    const { shipments, products, money, meta } = legacy;
    legacy.sourceHash = createHash("sha256").update(JSON.stringify({ shipments, products, money, meta })).digest("hex");
    legacy.version = `20260903T120000Z-${legacy.sourceHash.slice(0, 12)}`;
    expect((await POST(request(legacy))).status).toBe(409);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("rejects a photo absent from the current deployment before any storage write", async () => {
    const bundle = createDataBundle({
      ...candidate(),
      products: { products: [{ id: "auto-001", name: "Кожа", category: "Кожа", excelRows: [2], sizes: [], photo: "/images/products/jpg/test.jpg" }] },
      productIdRegistry: { schemaVersion: 1, nextAutoNumber: 2, entries: [{ name: "Кожа", normalizedName: "кожа", productId: "auto-001" }] },
    });
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
    expect((await POST(request(bundle))).status).toBe(400);
    expect(store.set).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated requests", async () => {
    expect((await POST(new Request("https://example.test/api/publish-data", { method: "POST" }))).status).toBe(401);
    expect(store.getWithMetadata).not.toHaveBeenCalled();
  });
});
