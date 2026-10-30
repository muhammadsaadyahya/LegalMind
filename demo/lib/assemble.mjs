import fs from "node:fs";
import path from "node:path";
import { AUDIO_DIR, OUT_DIR, findTool, log, run } from "./util.mjs";
import { RAW_VIDEO } from "./record.mjs";
import { SRT_FILE } from "./subs.mjs";

export const FINAL_VIDEO = path.join(OUT_DIR, "demo.mp4");
export const PREVIEW_GIF = path.join(OUT_DIR, "preview.gif");
const MAX_BYTES = 9.5 * 1024 * 1024; // GitHub's limit is 10 MB; keep a margin

// Best quality first; the first one under the size limit wins. 1080p is kept as long as possible
// because GitHub plays the README video at full width and small UI text needs the pixels.
const ENCODINGS = [
  { width: 1920, height: 1080, crf: 22 },
  { width: 1920, height: 1080, crf: 24 },
  { width: 1920, height: 1080, crf: 26 },
  { width: 1920, height: 1080, crf: 28 },
  { width: 1280, height: 720, crf: 26 },
  { width: 1280, height: 720, crf: 30 },
];

// Movie-style: white text, no box, thin dark outline + soft shadow, bottom centre
// (ASS colours are &HAABBGGRR).
const SUB_STYLE = [
  "FontName=Segoe UI Semibold",
  "FontSize=14",
  "PrimaryColour=&H00FFFFFF",
  "OutlineColour=&H00101010",
  "BackColour=&H80000000",
  "BorderStyle=1",
  "Outline=1.2",
  "Shadow=1",
  "Alignment=2",
  "MarginV=24",
].join(",");

// `timeline` comes from buildTimeline(): raw-video segments (with cuts and speed-ups) and the
// resulting scene start times, which is where each narration clip is placed.
export function assemble(timeline) {
  const ffmpeg = findTool("ffmpeg");
  const { segments, scenes, total } = timeline;

  const inputs = ["-i", RAW_VIDEO];
  const audioChains = [];
  scenes.forEach((t, i) => {
    inputs.push("-i", path.join(AUDIO_DIR, `${t.id}.mp3`));
    const delay = Math.round(t.start * 1000);
    audioChains.push(`[${i + 1}:a]adelay=${delay}|${delay}[a${i}]`);
  });
  const mix = `${scenes.map((_, i) => `[a${i}]`).join("")}amix=inputs=${scenes.length}:normalize=0:duration=longest[aout]`;

  const n = segments.length;
  const cutChains = [
    `[0:v]fps=25,split=${n}${segments.map((_, i) => `[s${i}]`).join("")}`,
    ...segments.map((s, i) =>
      `[s${i}]trim=start=${s.from.toFixed(3)}:end=${s.to.toFixed(3)},setpts=(PTS-STARTPTS)/${s.speed.toFixed(4)}[v${i}]`),
    `${segments.map((_, i) => `[v${i}]`).join("")}concat=n=${n}:v=1:a=0[vcat]`,
  ];

  for (const enc of ENCODINGS) {
    const video = `[vcat]scale=${enc.width}:${enc.height}:flags=lanczos,subtitles=${path.basename(SRT_FILE)}:force_style='${SUB_STYLE}'[vout]`;
    run(ffmpeg, [
      "-y", "-hide_banner", "-loglevel", "error",
      ...inputs,
      "-filter_complex", [...cutChains, video, ...audioChains, mix].join(";"),
      "-map", "[vout]", "-map", "[aout]",
      "-t", total.toFixed(3),
      "-c:v", "libx264", "-preset", "slow", "-crf", String(enc.crf), "-pix_fmt", "yuv420p", "-r", "25",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      path.basename(FINAL_VIDEO),
    ], { cwd: OUT_DIR }); // relative subtitle path avoids Windows drive-letter escaping in the filter
    const size = fs.statSync(FINAL_VIDEO).size;
    log("assemble", `${enc.width}x${enc.height} crf ${enc.crf} -> ${(size / 1048576).toFixed(2)} MB`);
    if (size <= MAX_BYTES) return { ...enc, size };
  }
  throw new Error("Could not get demo.mp4 under 10 MB with the configured encodings");
}

// Silent GIF of the chosen moment, taken from the raw recording (cursor visible, no subtitles).
export function makeGif(config, timings) {
  const ffmpeg = findTool("ffmpeg");
  const scene = timings.find((t) => t.id === config.gif.scene) ?? timings[1];
  const start = scene.start + (config.gif.offset ?? 0);
  for (const width of [960, 800, 640]) {
    run(ffmpeg, [
      "-y", "-hide_banner", "-loglevel", "error",
      "-ss", start.toFixed(2), "-t", String(config.gif.duration), "-i", RAW_VIDEO,
      "-filter_complex",
      `fps=12,scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
      "-loop", "0",
      PREVIEW_GIF,
    ]);
    const size = fs.statSync(PREVIEW_GIF).size;
    log("gif", `${width}px wide, ${config.gif.duration}s from "${scene.id}" -> ${(size / 1048576).toFixed(2)} MB`);
    if (size <= MAX_BYTES) return size;
  }
  return fs.statSync(PREVIEW_GIF).size;
}
