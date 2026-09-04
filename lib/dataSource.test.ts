import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createDataBundle } from "./dataBundle";
import embedded from "@/data/snapshot.json";
const blobs = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@netlify/blobs", () => ({ getStore: () => blobs }));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
import { getDataBundle } from "./dataSource";
let rootDir: string;
const preview = createDataBundle({ ...embedded, money: {} });
beforeEach(() => {
  rootDir = mkdtempSync(path.join(tmpdir(), "mehmet-source-test-"));
  mkdirSync(path.join(rootDir, "tmp"));
  writeFileSync(path.join(rootDir, "tmp/preview-snapshot.json"), JSON.stringify(preview));
  vi.spyOn(process, "cwd").mockReturnValue(rootDir);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("MEHMET_DATA_SOURCE", "local");
  blobs.get.mockReset();
});
afterEach(() => {
  vi.restoreAllMocks(); vi.unstubAllEnvs();
  if (!path.resolve(rootDir).startsWith(path.resolve(tmpdir(), "mehmet-source-test-"))) throw new Error("Unsafe cleanup path");
  rmSync(rootDir, { recursive: true, force: true });
});
it("next dev uses the validated preview", async () => {
  vi.stubEnv("NODE_ENV", "development");
  expect(await getDataBundle()).toEqual(preview);
});
it("production ignores unpublished preview", async () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(await getDataBundle()).toEqual(embedded);
});
it.each([null, { ...preview, money: { deposits: [] } }])("absent or corrupt remote data uses the embedded bundle, not preview", async (remote) => {
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("MEHMET_DATA_SOURCE", "netlify-blobs");
  blobs.get.mockResolvedValue(remote);
  expect(await getDataBundle()).toEqual(embedded);
});
it("Blob outage cannot expose preview", async () => {
  vi.stubEnv("MEHMET_DATA_SOURCE", "netlify-blobs");
  blobs.get.mockRejectedValue(new Error("Unavailable"));
  expect(await getDataBundle()).toEqual(embedded);
});
it("a valid remote publication replaces the embedded snapshot without rebuild", async () => {
  vi.stubEnv("MEHMET_DATA_SOURCE", "netlify-blobs");
  blobs.get.mockResolvedValue(preview);
  expect(await getDataBundle()).toEqual(preview);
});
