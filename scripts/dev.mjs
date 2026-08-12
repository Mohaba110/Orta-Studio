import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const incoming = process.argv.slice(2);
const args = [];
for (let index = 0; index < incoming.length; index += 1) {
  const arg = incoming[index];
  if (arg === "--host") {
    args.push("--hostname");
    if (incoming[index + 1] && !incoming[index + 1].startsWith("--")) args.push(incoming[++index]);
  } else if (arg !== "--strictPort") {
    args.push(arg);
  }
}

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextBin, "dev", ...args], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
