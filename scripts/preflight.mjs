import { spawnSync } from "node:child_process";

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
      ["run", "validate:data"],
      ["run", "validate:images"],
      ["run", "build"],
    ];

for (let index = 0; index < tasks.length; index += 1) {
  const args = tasks[index];
  const label = `${index + 1}/${tasks.length} npm ${args.join(" ")}`;
  const command = `npm ${args.join(" ")}`;

  console.log("=".repeat(72));
  console.log(label);
  console.log("=".repeat(72));

  const result = spawnSync(command, {
    cwd: process.cwd(),
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
