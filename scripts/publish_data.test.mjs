import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createDataBundle } from "../lib/dataBundle.ts";
import { writeSnapshot, readLocalSnapshot } from "./local_snapshot.mjs";
const mocks = vi.hoisted(() => ({ build: vi.fn(), spawn: vi.fn() }));
vi.mock("./build_snapshot.mjs", () => ({ buildSnapshot: mocks.build }));
vi.mock("node:child_process", () => ({ spawnSync: mocks.spawn }));
import { publishData } from "./publish_data.mjs";

let rootDir, original, next, posts, responseStatus, versionAvailable;
const read = () => readFileSync(path.join(rootDir, "data/snapshot.json"), "utf8");
beforeEach(() => {
  rootDir = mkdtempSync(path.join(tmpdir(), "mehmet-publish-test-"));
  mkdirSync(path.join(rootDir, "data"));
  original = createDataBundle({ shipments: [], products: { products: [] }, money: {}, meta: { updatedAt: "2026-09-03T12:00:00Z", source: "excel" }, productIdRegistry: { schemaVersion: 1, nextAutoNumber: 1, entries: [] } });
  next = createDataBundle({ ...original, money: { deposits: [{ title: "Test", amount: 100 }] } });
  writeSnapshot(path.join(rootDir, "data/snapshot.json"), original);
  writeSnapshot(path.join(rootDir, "tmp/preview-snapshot.json"), next);
  writeFileSync(path.join(rootDir, "data/money.json"), JSON.stringify(next.money));
  mocks.build.mockReset().mockReturnValue(next);
  vi.stubEnv("MEHMET_SITE_URL", "https://example.test");
  vi.stubEnv("MEHMET_PUBLISH_TOKEN", "test-only");
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  posts = [];
  responseStatus = 200;
  versionAvailable = true;
  const onPost = (body) => { posts.push(body); return { status: responseStatus, body: "test response" }; };
  mocks.spawn.mockReset().mockImplementation((_command, _args, options) => {
    const response = onPost(Buffer.from(options.input, "base64").toString("utf8"));
    return { status: 0, stdout: `${response.status}\n${response.body}` };
  });
  vi.stubGlobal("fetch", vi.fn(async (url, options) => {
    if (options?.method === "POST") {
      const response = onPost(options.body);
      return new Response(response.body, { status: response.status });
    }
    if (url.endsWith("/api/data-version")) {
      if (!versionAvailable) throw new Error("confirmation unavailable");
      return Response.json({ version: next.version, sourceHash: next.sourceHash });
    }
    return Response.json({ version: original.version, productIdRegistry: original.productIdRegistry });
  }));
});
afterEach(() => {
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs();
  if (!path.resolve(rootDir).startsWith(path.resolve(tmpdir(), "mehmet-publish-test-"))) throw new Error("Unsafe cleanup path");
  rmSync(rootDir, { recursive: true, force: true });
});

it("dry-run is offline, never parses, and preserves both local snapshots and manual money", async () => {
  const before = read();
  const preview = readFileSync(path.join(rootDir, "tmp/preview-snapshot.json"), "utf8");
  // Even malformed publication settings are irrelevant to offline validation.
  writeFileSync(path.join(rootDir, ".env.publish.local"), "THIS IS NOT A VALID CONFIG");
  const result = await publishData({ rootDir, dryRun: true });
  expect(result.money).toEqual(next.money);
  expect(fetch).not.toHaveBeenCalled();
  expect(mocks.build).not.toHaveBeenCalled();
  expect(mocks.spawn).not.toHaveBeenCalled();
  expect(read()).toBe(before);
  expect(readFileSync(path.join(rootDir, "tmp/preview-snapshot.json"), "utf8")).toBe(preview);
});
it("normal publication uses the authoritative registry and caches the entire confirmed bundle", async () => {
  await publishData({ rootDir });
  expect(mocks.build).toHaveBeenCalledWith({ registry: original.productIdRegistry, fetchSheet: true, rootDir });
  expect(JSON.parse(posts[0])).toEqual({ ...next, registryBaseVersion: original.version });
  expect(readLocalSnapshot({ rootDir, preview: false })).toEqual(next);
  expect(existsSync(path.join(rootDir, "tmp/preview-snapshot.json"))).toBe(false);
});
it.each([404, 405, 401, 503])("GET failure %i stops before parsing or writing local state", async (status) => {
  const before = read();
  vi.mocked(fetch).mockResolvedValue(new Response(null, { status }));
  await expect(publishData({ rootDir })).rejects.toThrow(`HTTP ${status}`);
  expect(mocks.build).not.toHaveBeenCalled();
  expect(posts).toHaveLength(0);
  expect(read()).toBe(before);
});
it("parse failure leaves all durable state intact", async () => {
  const before = read();
  mocks.build.mockImplementation(() => { throw new Error("formula missing"); });
  await expect(publishData({ rootDir })).rejects.toThrow("formula missing");
  expect(posts).toHaveLength(0);
  expect(read()).toBe(before);
});
it("a rejected POST never changes the confirmed local cache", async () => {
  const before = read(); responseStatus = 409;
  await expect(publishData({ rootDir })).rejects.toThrow("HTTP 409");
  expect(read()).toBe(before);
});
it("a lost POST response is confirmed by the runtime version", async () => {
  responseStatus = 503;
  await publishData({ rootDir });
  expect(readLocalSnapshot({ rootDir })).toEqual(next);
  expect(posts).toHaveLength(1);
});
it("unconfirmed delivery retries the exact body, never reparses, and preserves cache", async () => {
  const before = read(); versionAvailable = false;
  await expect(publishData({ rootDir })).rejects.toThrow("пока неизвестен");
  expect(posts).toHaveLength(2);
  expect(posts[0]).toBe(posts[1]);
  expect(mocks.build).toHaveBeenCalledTimes(1);
  expect(read()).toBe(before);
});
it("invalid content cannot replace a local snapshot", () => {
  const before = read();
  expect(() => writeSnapshot(path.join(rootDir, "data/snapshot.json"), { ...next, money: {} })).toThrow("sourceHash");
  expect(read()).toBe(before);
});

it("image validation ignores test-only paths but rejects absent assets referenced by runtime", async () => {
  const fixtureSource = 'const photo = "/images/products/jpg/missing.jpg";';
  mkdirSync(path.join(rootDir, "lib"));
  writeFileSync(path.join(rootDir, "lib/photo.test.ts"), fixtureSource);
  await expect(publishData({ rootDir, dryRun: true })).resolves.toBeDefined();
  writeFileSync(path.join(rootDir, "lib/photo.ts"), fixtureSource);
  vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(publishData({ rootDir, dryRun: true })).rejects.toThrow("отсутствующее изображение");
});
