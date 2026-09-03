import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

export function createRegistryWorkspace(registry, temporaryRoot = os.tmpdir()) {
  const directory = mkdtempSync(path.join(temporaryRoot, "mehmet-product-registry-"));
  const filePath = path.join(directory, "product-id-registry.json");
  writeFileSync(filePath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  return { directory, filePath };
}

export function stageLocalRegistryFallback(
  localRegistryPath,
  temporaryRoot = os.tmpdir()
) {
  const registry = JSON.parse(readFileSync(localRegistryPath, "utf8"));
  return createRegistryWorkspace(registry, temporaryRoot);
}

export function commitLocalRegistry(workspacePath, localRegistryPath) {
  const temporaryPath = `${localRegistryPath}.${process.pid}.tmp`;
  copyFileSync(workspacePath, temporaryPath);
  renameSync(temporaryPath, localRegistryPath);
}

export function cleanupRegistryWorkspace(directory) {
  rmSync(directory, { recursive: true, force: true });
}
