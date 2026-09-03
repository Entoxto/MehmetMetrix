import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanupRegistryWorkspace,
  commitLocalRegistry,
  stageLocalRegistryFallback,
} from "../scripts/product_registry_workspace.mjs";

const originalRegistry = {
  schemaVersion: 1,
  nextAutoNumber: 2,
  entries: [
    { name: "Жакет", normalizedName: "жакет", productId: "auto-001" },
  ],
};
const advancedRegistry = {
  schemaVersion: 1,
  nextAutoNumber: 3,
  entries: [
    ...originalRegistry.entries,
    { name: "Пальто", normalizedName: "пальто", productId: "auto-002" },
  ],
};

const sandboxes: string[] = [];

function createSandbox() {
  const directory = mkdtempSync(path.join(os.tmpdir(), "mehmet-registry-test-"));
  sandboxes.push(directory);
  const localRegistryPath = path.join(directory, "product-id-registry.json");
  writeFileSync(
    localRegistryPath,
    `${JSON.stringify(originalRegistry, null, 2)}\n`,
    "utf8"
  );
  return { directory, localRegistryPath };
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

afterEach(() => {
  while (sandboxes.length > 0) {
    rmSync(sandboxes.pop()!, { recursive: true, force: true });
  }
});

describe("product registry workspace", () => {
  it("keeps the local registry unchanged when migration publication fails", () => {
    const { directory, localRegistryPath } = createSandbox();
    const workspace = stageLocalRegistryFallback(localRegistryPath, directory);
    writeFileSync(
      workspace.filePath,
      `${JSON.stringify(advancedRegistry, null, 2)}\n`,
      "utf8"
    );

    // A failed POST exits through cleanup without committing the staged file.
    cleanupRegistryWorkspace(workspace.directory);

    expect(readJson(localRegistryPath)).toEqual(originalRegistry);
  });

  it("commits the staged registry only after a successful publication", () => {
    const { directory, localRegistryPath } = createSandbox();
    const workspace = stageLocalRegistryFallback(localRegistryPath, directory);
    writeFileSync(
      workspace.filePath,
      `${JSON.stringify(advancedRegistry, null, 2)}\n`,
      "utf8"
    );

    commitLocalRegistry(workspace.filePath, localRegistryPath);
    cleanupRegistryWorkspace(workspace.directory);

    expect(readJson(localRegistryPath)).toEqual(advancedRegistry);
  });
});
