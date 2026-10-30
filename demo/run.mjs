// One command for the whole demo:
// servers -> seed -> fixtures -> TTS -> record -> timeline (trim waits) -> subtitles -> ffmpeg -> verify.
// Usage: npm run demo [-- --skip-tts] [--skip-record] [--skip-assemble]
import fs from "node:fs";
import path from "node:path";
import { FINAL_VIDEO, assemble, makeGif } from "./lib/assemble.mjs";
import { buildFixtures } from "./lib/fixtures.mjs";
import { TIMINGS_FILE, record } from "./lib/record.mjs";
import { seed } from "./lib/seed.mjs";
import { startServers } from "./lib/servers.mjs";
import { buildSubs } from "./lib/subs.mjs";
import { buildTimeline } from "./lib/timeline.mjs";
import { DURATIONS_FILE, generateAudio } from "./lib/tts.mjs";
import { OUT_DIR, loadScenes, log, readJson } from "./lib/util.mjs";
import { verify } from "./lib/verify.mjs";

const flags = new Set(process.argv.slice(2));
const config = loadScenes();
fs.mkdirSync(OUT_DIR, { recursive: true });

const durations = flags.has("--skip-tts") && fs.existsSync(DURATIONS_FILE)
  ? readJson(DURATIONS_FILE)
  : generateAudio(config);

let timings;
if (flags.has("--skip-record")) {
  timings = readJson(TIMINGS_FILE).scenes;
} else {
  const stopServers = await startServers();
  const cleanup = () => { stopServers(); process.exit(130); };
  process.once("SIGINT", cleanup);
  try {
    await seed();
    await buildFixtures();
    ({ timings } = await record(config, durations));
  } finally {
    process.off("SIGINT", cleanup);
    stopServers();
  }
}

if (!flags.has("--skip-assemble")) {
  // Final timeline: AI waits trimmed, slack sped up; times below are on the final video.
  const timeline = buildTimeline(timings);
  for (const s of timeline.scenes) {
    if (s.cut || s.speed !== 1 || s.slowSpeed !== 1) log("timeline", `${s.id.padEnd(12)} cut ${s.cut}s, slow steps ${s.slowSpeed}x, overall ${s.speed}x`);
  }
  buildSubs(config, timeline.scenes, 0);
  assemble(timeline);
  makeGif(config, timings); // raw times
  verify(config, timeline.scenes, 0);

  // Keep every run so versions can be compared side by side.
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const runsDir = path.join(OUT_DIR, "runs");
  fs.mkdirSync(runsDir, { recursive: true });
  fs.copyFileSync(FINAL_VIDEO, path.join(runsDir, `demo-${stamp}.mp4`));
  log("done", `archived as runs/demo-${stamp}.mp4`);
}
log("done", `outputs in ${OUT_DIR}`);
