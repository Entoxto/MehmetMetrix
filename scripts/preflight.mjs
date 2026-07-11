import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const localNodeDir = path.join(rootDir, ".tools", "node");
const bundledPythonDir = process.env.USERPROFILE
  ? path.join(
      process.env.USERPROFILE,
      ".cache",
      "codex-runtimes",
      "codex-primary-runtime",
      "dependencies",
      "python"
    )
  : null;
const localNpmPath = path.join(localNodeDir, process.platform === "win32" ? "npm.cmd" : "npm");
const npmCommand = existsSync(localNpmPath) ? localNpmPath : "npm";
const npmLabel = existsSync(localNpmPath) ? path.relative(rootDir, localNpmPath) : "npm";
const childEnv = { ...process.env };
const extraPathDirs = [];

if (existsSync(localNodeDir)) {
  extraPathDirs.push(localNodeDir);
}

if (bundledPythonDir && existsSync(path.join(bundledPythonDir, "python.exe"))) {
  extraPathDirs.push(bundledPythonDir);
}

if (extraPathDirs.length > 0) {
  childEnv.PATH = `${extraPathDirs.join(path.delimiter)}${path.delimiter}${childEnv.PATH ?? ""}`;
}

const isFastMode = process.argv.includes("--fast");
const tasks = isFastMode
  ? [
      ["run", "validate:data"],
      ["run", "validate:images"],
    ]
  : [
      ["run", "lint"],
      ["run", "typecheck"],
      ["run", "typecheck:strict"],
      ["run", "test"],
      ["run", "test:excel"],
      ["run", "validate:data"],
      ["run", "validate:images"],
      ["run", "build"],
    ];

for (let index = 0; index < tasks.length; index += 1) {
  const args = tasks[index];
  const label = `${index + 1}/${tasks.length} npm ${args.join(" ")}`;
  const quotedNpmCommand = npmCommand.includes(" ") ? `"${npmCommand}"` : npmCommand;
  const command = `${quotedNpmCommand} ${args.join(" ")}`;

  console.log("=".repeat(72));
  console.log(label);
  if (npmLabel !== "npm") {
    console.log(`using ${npmLabel}`);
  }
  console.log("=".repeat(72));

  const result = spawnSync(command, {
    cwd: rootDir,
    env: childEnv,
    stdio: "inherit",
    shell: true,
  });

  if (result.error) {
    console.error(`ERROR: не удалось запустить шаг "${label}": ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`ERROR: preflight остановлен на шаге "${label}"`);
    process.exit(result.status ?? 1);
  }
}

console.log("=".repeat(72));
console.log(`OK: ${isFastMode ? "preflight:fast" : "preflight"} завершен успешно`);
console.log("=".repeat(72));
