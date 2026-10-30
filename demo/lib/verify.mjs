import fs from "node:fs";
import path from "node:path";
import { FINAL_VIDEO, PREVIEW_GIF } from "./assemble.mjs";
import { OUT_DIR, findTool, log, probeDuration, run, writeJson } from "./util.mjs";

const MAX_SILENCE = 2.0;

// Checks: narration never runs into the next scene, no silent stretch > 2 s,
// plus three still frames (intro, a middle scene, outro) for a visual check of subtitles and cursor.
export function verify(config, timings, trimStart) {
  const issues = [];
  const gaps = [];
  timings.forEach((t, i) => {
    const audioEnd = t.start + t.audio;
    const nextStart = i + 1 < timings.length ? timings[i + 1].start : t.end;
    const silence = nextStart - audioEnd;
    gaps.push({ scene: t.id, audio: +t.audio.toFixed(2), sceneLength: +(nextStart - t.start).toFixed(2), silenceAfter: +silence.toFixed(2) });
    if (silence < 0) issues.push(`"${t.id}" narration overlaps the next scene by ${(-silence).toFixed(2)}s`);
    if (silence > MAX_SILENCE) issues.push(`"${t.id}" has ${silence.toFixed(2)}s of silence after its narration`);
  });

  const ffmpeg = findTool("ffmpeg");
  const middle = timings[Math.floor(timings.length / 2)];
  const frames = [
    ["intro", timings[0]],
    [`middle-${middle.id}`, middle],
    ["outro", timings.at(-1)],
  ].map(([name, t]) => {
    // Middle of the narration so a subtitle is on screen.
    const at = t.start - trimStart + t.audio * 0.5;
    const file = path.join(OUT_DIR, `frame-${name}.png`);
    run(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-ss", at.toFixed(2), "-i", FINAL_VIDEO, "-frames:v", "1", file]);
    return path.relative(OUT_DIR, file);
  });

  const report = {
    duration: +probeDuration(FINAL_VIDEO).toFixed(2),
    sizeMB: +(fs.statSync(FINAL_VIDEO).size / 1048576).toFixed(2),
    gifMB: fs.existsSync(PREVIEW_GIF) ? +(fs.statSync(PREVIEW_GIF).size / 1048576).toFixed(2) : null,
    scenes: gaps,
    issues,
    frames,
  };
  writeJson(path.join(OUT_DIR, "report.json"), report);

  console.table(gaps);
  log("verify", `demo.mp4: ${report.duration}s, ${report.sizeMB} MB; preview.gif: ${report.gifMB} MB`);
  log("verify", issues.length ? `${issues.length} issue(s):\n  - ${issues.join("\n  - ")}` : "timing OK: no overlaps, no silence > 2s");
  log("verify", `frames: ${frames.join(", ")}`);
  return report;
}
