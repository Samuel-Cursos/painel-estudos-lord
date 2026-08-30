import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const isVercel = process.env.VERCEL === "1";

if (!isVercel) rmSync(new URL("../dist", import.meta.url), { recursive: true, force: true });

for (const script of [
  "scripts/build-question-answer-key.mjs",
  "scripts/audit-question-answer-key.mjs",
  "scripts/inspect-enem-dataset.mjs",
]) {
  const check = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
  if (check.error) {
    console.error(check.error.message);
    process.exit(1);
  }
  if ((check.status ?? 1) !== 0) process.exit(check.status ?? 1);
}

const command = isVercel ? process.execPath : "bash";
const args = isVercel
  ? [require.resolve("next/dist/bin/next"), "build", "--webpack"]
  : ["scripts/build-verified.sh"];

console.log(isVercel ? "Building the Next.js app for Vercel..." : "Building the Vinext app for Sites...");

const result = spawnSync(command, args, {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
