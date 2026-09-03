import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

function localCandidates(rootDir) {
  if (process.platform === "win32") {
    return [
      path.join(rootDir, ".venv", "Scripts", "python.exe"),
      path.join(rootDir, ".tools", "python", "python.exe"),
    ];
  }
  return [
    path.join(rootDir, ".venv", "bin", "python3"),
    path.join(rootDir, ".tools", "python", "bin", "python3"),
  ];
}

function bundledCandidate() {
  if (!process.env.USERPROFILE) return null;
  return path.join(
    process.env.USERPROFILE,
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "python",
    process.platform === "win32" ? "python.exe" : "bin/python3"
  );
}

function candidateKey(candidate) {
  return `${candidate.command}\0${candidate.argsPrefix.join("\0")}`.toLocaleLowerCase();
}

export function resolvePython({ rootDir = process.cwd(), requiredModules = [] } = {}) {
  const candidates = [];
  const configured = process.env.MEHMET_PYTHON?.trim();
  if (configured) candidates.push({ command: configured, argsPrefix: [], label: "MEHMET_PYTHON" });

  for (const command of localCandidates(rootDir)) {
    if (existsSync(command)) candidates.push({ command, argsPrefix: [], label: "локальный Python" });
  }

  const bundled = bundledCandidate();
  if (bundled && existsSync(bundled)) {
    candidates.push({ command: bundled, argsPrefix: [], label: "bundled Codex Python" });
  }

  if (process.platform === "win32") {
    candidates.push(
      { command: "python", argsPrefix: [], label: "system python" },
      { command: "py", argsPrefix: ["-3"], label: "system py -3" }
    );
  } else {
    candidates.push(
      { command: "python3", argsPrefix: [], label: "system python3" },
      { command: "python", argsPrefix: [], label: "system python" }
    );
  }

  const importCheck = requiredModules.length > 0
    ? requiredModules.map((moduleName) => `import ${moduleName}`).join("; ")
    : "import sys";
  const failures = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    const result = spawnSync(
      candidate.command,
      [...candidate.argsPrefix, "-c", importCheck],
      { cwd: rootDir, encoding: "utf8", shell: false }
    );
    if (result.status === 0) return candidate;
    failures.push(`${candidate.label}: ${result.error?.message ?? result.stderr?.trim() ?? "не запустился"}`);
  }

  const dependencyHint = requiredModules.length > 0
    ? ` Требуемые модули: ${requiredModules.join(", ")}.`
    : "";
  throw new Error(
    `Не найден подходящий Python.${dependencyHint} Установите зависимости командой ` +
      "`python -m pip install -r requirements.txt` или задайте MEHMET_PYTHON. " +
      `Проверено: ${failures.join(" | ")}`
  );
}

export function pythonArgs(runtime, args) {
  return [...runtime.argsPrefix, ...args];
}
