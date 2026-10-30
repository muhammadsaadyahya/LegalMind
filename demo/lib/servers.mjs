import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR, isPortOpen, killProcess, log, startProcess, waitForPort } from "./util.mjs";

export const MONGO_PORT = 27017;
export const BACKEND_PORT = 5000; // hard-coded in the frontend (socket URL + vite proxy)
export const FRONTEND_PORT = 5173;
export const BASE_URL = process.env.DEMO_BASE_URL || `http://localhost:${FRONTEND_PORT}`;
export const API_URL = `http://localhost:${BACKEND_PORT}`;

// The demo runs against its own database so the video only ever shows seeded, fake data.
export const DEMO_DB = process.env.DEMO_DB || "legalmind_demo";
export const MONGO_URI = `mongodb://127.0.0.1:${MONGO_PORT}/${DEMO_DB}`;

const MONGOD_PATH =
  process.env.MONGOD_PATH || "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe";
const MONGO_DBPATH = process.env.MONGO_DBPATH || "C:\\data\\db";

export async function startServers() {
  const started = [];

  if (await isPortOpen(MONGO_PORT)) {
    log("servers", `MongoDB already running on :${MONGO_PORT}`);
  } else {
    if (!fs.existsSync(MONGOD_PATH)) {
      throw new Error(`MongoDB is not running and mongod was not found at ${MONGOD_PATH} (set MONGOD_PATH).`);
    }
    log("servers", `starting MongoDB (dbpath ${MONGO_DBPATH})`);
    started.push(startProcess("mongod", MONGOD_PATH, [
      "--dbpath", MONGO_DBPATH, "--port", String(MONGO_PORT), "--bind_ip", "127.0.0.1",
    ]));
    await waitForPort(MONGO_PORT, 30000, "MongoDB");
  }

  if (await isPortOpen(BACKEND_PORT)) {
    throw new Error(
      `Port ${BACKEND_PORT} is already in use. Stop your dev backend first: the demo starts its own ` +
        `backend against the '${DEMO_DB}' database so no real data appears in the video.`,
    );
  }
  log("servers", `starting backend on :${BACKEND_PORT} (db: ${DEMO_DB})`);
  // --unhandled-rejections=warn: document ingestion runs un-awaited after upload; if it throws,
  // Node 22 would otherwise kill the server mid-recording.
  // --use-system-ca: trust the OS certificate store (needed behind TLS-inspecting antivirus/proxies).
  const nodeFlags = ["--unhandled-rejections=warn"];
  if (process.allowedNodeEnvironmentFlags.has("--use-system-ca")) nodeFlags.push("--use-system-ca");
  started.push(startProcess("backend", process.execPath, [...nodeFlags, "app.js"], {
    cwd: path.join(ROOT_DIR, "Backend"),
    env: { ...process.env, MONGO_URI, PORT: String(BACKEND_PORT) },
  }));
  await waitForPort(BACKEND_PORT, 60000, "Backend");

  if (await isPortOpen(FRONTEND_PORT)) {
    log("servers", `frontend already running on :${FRONTEND_PORT}`);
  } else {
    log("servers", `starting frontend (vite) on :${FRONTEND_PORT}`);
    const frontendDir = path.join(ROOT_DIR, "Frontend");
    started.push(startProcess("frontend", process.execPath, [
      path.join(frontendDir, "node_modules", "vite", "bin", "vite.js"),
      "--port", String(FRONTEND_PORT), "--strictPort",
    ], { cwd: frontendDir }));
    await waitForPort(FRONTEND_PORT, 60000, "Frontend");
  }

  return () => started.reverse().forEach(killProcess);
}
