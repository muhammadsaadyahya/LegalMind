import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEMO_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT_DIR = path.resolve(DEMO_DIR, "..");
export const OUT_DIR = path.join(DEMO_DIR, "out");
export const AUDIO_DIR = path.join(OUT_DIR, "audio");
export const FIXTURES_DIR = path.join(OUT_DIR, "fixtures");

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}

export function loadScenes() {
  return JSON.parse(fs.readFileSync(path.join(DEMO_DIR, "scenes.json"), "utf8"));
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

// Locate ffmpeg/ffprobe: env override, then PATH, then the winget shim folder
// (winget adds it to PATH, but only for shells started after the install).
export function findTool(name) {
  const envKey = `${name.toUpperCase()}_PATH`;
  if (process.env[envKey]) return process.env[envKey];
  const probe = spawnSync(name, ["-version"], { stdio: "ignore", shell: false });
  if (probe.status === 0) return name;
  if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    const shim = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Links", `${name}.exe`);
    if (fs.existsSync(shim)) return shim;
  }
  throw new Error(`${name} not found. Install ffmpeg or set ${envKey}.`);
}

export function findPython() {
  for (const cmd of [process.env.PYTHON, "python", "py", "python3"].filter(Boolean)) {
    const r = spawnSync(cmd, ["-c", "import edge_tts"], { stdio: "ignore" });
    if (r.status === 0) return cmd;
  }
  throw new Error("Python with edge-tts not found. Run: pip install edge-tts");
}

// Run a command to completion; throws with stderr on failure.
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });
  if (r.status !== 0) {
    throw new Error(`${path.basename(cmd)} failed (${r.status}):\n${(r.stderr || "").slice(-3000)}`);
  }
  return r.stdout;
}

export function probeDuration(file) {
  const out = run(findTool("ffprobe"), [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
  ]);
  return parseFloat(out.trim());
}

// "localhost" may resolve to IPv4 or IPv6 depending on the server (vite binds ::1 on Windows).
export async function isPortOpen(port) {
  return (await isHostPortOpen(port, "127.0.0.1")) || (await isHostPortOpen(port, "::1"));
}

function isHostPortOpen(port, host) {
  return new Promise((resolve) => {
    const sock = net.connect({ port, host });
    sock.once("connect", () => { sock.destroy(); resolve(true); });
    sock.once("error", () => resolve(false));
    sock.setTimeout(1000, () => { sock.destroy(); resolve(false); });
  });
}

export async function waitForPort(port, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortOpen(port)) return;
    await sleep(500);
  }
  throw new Error(`${label} did not open port ${port} within ${timeoutMs / 1000}s`);
}

// Start a long-running child; its output goes to a log file in demo/out/logs.
export function startProcess(label, cmd, args, opts = {}) {
  const logDir = path.join(OUT_DIR, "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = fs.openSync(path.join(logDir, `${label}.log`), "w");
  const child = spawn(cmd, args, {
    stdio: ["ignore", logFile, logFile],
    windowsHide: true,
    ...opts,
  });
  child.label = label;
  return child;
}

export function killProcess(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}
