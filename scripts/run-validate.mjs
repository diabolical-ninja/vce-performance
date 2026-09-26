import { spawn } from "node:child_process";
import { availableParallelism } from "node:os";

const full = process.argv.includes("--full");
const started = performance.now();
const concurrency = Math.min(3, availableParallelism());
const checks = [
  "lint",
  "test",
  ...(!full ? ["typecheck"] : []),
  "test:python",
  "format:check",
  "quality:dead",
  "quality:dupes",
  "quality:deps",
  "quality:god-components",
];
const timings = [];
let failed = false;

async function run(script, command = "npm", args = ["run", script]) {
  const start = performance.now();
  console.log(`Starting ${script}`);
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", (error) => (output += `${error.message}\n`));
    child.on("close", (code) => {
      const seconds = ((performance.now() - start) / 1000).toFixed(2);
      timings.push({
        check: script,
        seconds,
        result: code === 0 ? "PASS" : "FAIL",
      });
      console.log(
        `\n=== ${script}: ${code === 0 ? "PASS" : "FAIL"} (${seconds}s) ===\n${output}`,
      );
      if (code !== 0) failed = true;
      resolve();
    });
  });
}

// Export once before any consumer starts. Stop scheduling after a failure;
// already-running checks finish so their diagnostics are retained.
await run("data:export");
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (!failed && checks.length) await run(checks.shift());
  }),
);
if (full && !failed) {
  // Export already succeeded. Next's build includes the full TypeScript check.
  await run("build", process.execPath, [
    "node_modules/next/dist/bin/next",
    "build",
  ]);
  if (!failed) await run("e2e:production");
}
console.table(timings);
console.log(
  `Validation ${failed ? "failed" : "passed"} in ${((performance.now() - started) / 1000).toFixed(2)}s (${full ? "full" : "local"}).`,
);
process.exitCode = failed ? 1 : 0;
