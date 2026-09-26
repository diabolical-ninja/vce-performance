import { spawnSync } from "node:child_process";

const checks = [
  "data:export",
  "test:python",
  "test",
  "typecheck",
  "e2e",
  "lint",
  "format:check",
  "quality:dead",
  "quality:dupes",
  "quality:deps",
  "quality:god-components",
  "build",
  "e2e:production",
];
const failures = [];
for (const script of checks) {
  console.log(`\n=== ${script} ===`);
  const result = spawnSync("npm", ["run", script], { stdio: "inherit" });
  if (result.status !== 0) failures.push(script);
}
if (failures.length) {
  console.error(`Validation failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Validation passed.");
