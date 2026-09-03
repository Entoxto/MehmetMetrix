import { spawnSync } from "node:child_process";
import { resolvePython, pythonArgs } from "./python_runtime.mjs";

const separatorIndex = process.argv.indexOf("--");
if (separatorIndex === -1 || separatorIndex === process.argv.length - 1) {
  console.error(
    "Использование: node scripts/run_python.mjs [--require module1,module2] -- script.py [args]"
  );
  process.exit(2);
}

const launcherArgs = process.argv.slice(2, separatorIndex);
const scriptArgs = process.argv.slice(separatorIndex + 1);
const requiredModules = [];
for (let index = 0; index < launcherArgs.length; index += 1) {
  if (launcherArgs[index] !== "--require" || !launcherArgs[index + 1]) {
    console.error(`Неизвестный аргумент launcher: ${launcherArgs[index]}`);
    process.exit(2);
  }
  requiredModules.push(
    ...launcherArgs[index + 1].split(",").map((value) => value.trim()).filter(Boolean)
  );
  index += 1;
}

try {
  const runtime = resolvePython({ requiredModules });
  console.log(`Python: ${runtime.label} (${runtime.command})`);
  const result = spawnSync(runtime.command, pythonArgs(runtime, scriptArgs), {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
