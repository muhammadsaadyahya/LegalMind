import fs from "node:fs";
import path from "node:path";
import { OUT_DIR, log } from "./util.mjs";

export const SRT_FILE = path.join(OUT_DIR, "subs.srt");
const MAX_LINE = 42;
const MAX_LINES = 2;

function wrap(text) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > MAX_LINE) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Split text into cues of at most MAX_LINES x MAX_LINE chars, breaking at sentence ends first.
export function splitCues(text) {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g).map((s) => s.trim());
  const cues = [];
  for (const sentence of sentences) {
    const lines = wrap(sentence);
    for (let i = 0; i < lines.length; i += MAX_LINES) {
      cues.push(lines.slice(i, i + MAX_LINES));
    }
  }
  return cues;
}

const stamp = (t) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

// Cue times come from the real scene start (recorded) + the real clip duration (ffprobe).
// Each cue's share of the clip is proportional to its character count.
export function buildSubs(config, timings, trimStart) {
  const byId = Object.fromEntries(timings.map((t) => [t.id, t]));
  const entries = [];
  for (const scene of config.scenes) {
    const t = byId[scene.id];
    const cues = splitCues(scene.subtitle ?? scene.narration);
    const totalChars = cues.reduce((n, c) => n + c.join(" ").length, 0);
    let cursor = t.start - trimStart;
    for (const cue of cues) {
      const len = (t.audio * cue.join(" ").length) / totalChars;
      entries.push({ from: cursor, to: cursor + len, lines: cue });
      cursor += len;
    }
  }
  const srt = entries
    .map((e, i) => `${i + 1}\n${stamp(e.from)} --> ${stamp(e.to - 0.05)}\n${e.lines.join("\n")}\n`)
    .join("\n");
  fs.writeFileSync(SRT_FILE, srt);
  log("subs", `${entries.length} cues -> ${path.basename(SRT_FILE)}`);
  return entries;
}
