import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { AUDIO_DIR, findPython, log, probeDuration, run, writeJson } from "./util.mjs";

export const DURATIONS_FILE = path.join(AUDIO_DIR, "durations.json");

// One MP3 per scene via edge-tts. Clips are cached by (voice, rate, text) hash so re-runs are fast.
export function generateAudio(config) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  let python = null;
  const durations = {};

  for (const scene of config.scenes) {
    const mp3 = path.join(AUDIO_DIR, `${scene.id}.mp3`);
    const hashFile = path.join(AUDIO_DIR, `${scene.id}.hash`);
    const hash = crypto
      .createHash("sha1")
      .update(`${config.voice}|${config.rate}|${scene.narration}`)
      .digest("hex");

    const cached = fs.existsSync(mp3) && fs.existsSync(hashFile) && fs.readFileSync(hashFile, "utf8") === hash;
    if (!cached) {
      python ??= findPython();
      run(python, [
        "-m", "edge_tts",
        "--voice", config.voice,
        `--rate=${config.rate}`,
        "--text", scene.narration,
        "--write-media", mp3,
      ]);
      fs.writeFileSync(hashFile, hash);
    }
    durations[scene.id] = probeDuration(mp3);
    log("tts", `${scene.id.padEnd(12)} ${durations[scene.id].toFixed(2)}s${cached ? " (cached)" : ""}`);
  }

  writeJson(DURATIONS_FILE, durations);
  const total = Object.values(durations).reduce((a, b) => a + b, 0);
  log("tts", `total narration ${total.toFixed(1)}s`);
  return durations;
}
