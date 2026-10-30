// Maps the raw recording onto the final timeline so every scene ends shortly after its narration:
//  1. cut the middle of AI waits (keep a moment of the spinner, then jump to the result),
//  2. shorten the static hold on an AI result at the end of the scene (keeping a minimum),
//  3. speed up steps the browser was slow to perform (cursor crawl, laggy typing), up to 3x,
//  4. if the scene is still longer than its narration, speed the whole scene slightly (capped).
// Narration is never shortened; it is placed at each scene's new start.

const GAP = 0.6; // s after each narration clip
const OUTRO_TAIL = 1.5;
const KEEP_BEFORE_CUT = 1.2; // s of spinner kept at the start of a wait
const KEEP_AFTER_CUT = 0.4; // s kept just before the result appears
const MIN_RESULT_HOLD = 2.5; // s an AI result stays on screen at minimum
const MAX_SLOW_STEP_SPEED = 3;
const MAX_SPEED = 1.6;

// pieces: [{ from, to, slow }]
function removeInterval(pieces, a, b) {
  return pieces.flatMap((p) => {
    if (b <= p.from || a >= p.to) return [p];
    return [
      { ...p, to: Math.min(a, p.to) },
      { ...p, from: Math.max(b, p.from) },
    ].filter((q) => q.to - q.from > 0.02);
  });
}

function markSlow(pieces, a, b) {
  return pieces.flatMap((p) => {
    if (b <= p.from || a >= p.to) return [p];
    return [
      { ...p, to: Math.max(p.from, Math.min(a, p.to)) },
      { ...p, from: Math.max(a, p.from), to: Math.min(b, p.to), slow: true },
      { ...p, from: Math.min(Math.max(b, p.from), p.to) },
    ].filter((q) => q.to - q.from > 0.02);
  });
}

const length = (pieces) => pieces.reduce((n, p) => n + p.to - p.from, 0);

export function buildTimeline(timings) {
  const segments = [];
  const scenes = [];
  let out = 0;

  for (const t of timings) {
    const target = t.audio + (t.id === "outro" ? OUTRO_TAIL : GAP);
    let pieces = [{ from: t.start, to: t.end, slow: false }];
    let excess = t.end - t.start - target;
    let cut = 0;

    for (const w of t.waits ?? []) {
      const avail = w.to - KEEP_AFTER_CUT - (w.from + KEEP_BEFORE_CUT);
      if (excess <= 0 || avail <= 0) continue;
      const c = Math.min(excess, avail);
      const cutEnd = w.to - KEEP_AFTER_CUT;
      pieces = removeInterval(pieces, cutEnd - c, cutEnd);
      excess -= c;
      cut += c;
    }

    for (const h of t.holds ?? []) {
      const avail = t.end - (h.from + MIN_RESULT_HOLD);
      if (excess <= 0 || avail <= 0) continue;
      const c = Math.min(excess, avail);
      pieces = removeInterval(pieces, t.end - c, t.end);
      excess -= c;
      cut += c;
    }

    let slowSpeed = 1;
    if (excess > 0 && t.slow?.length) {
      for (const s of t.slow) pieces = markSlow(pieces, s.from, s.to);
      const slowLen = length(pieces.filter((p) => p.slow));
      // Speed v saves slowLen * (1 - 1/v) seconds.
      const maxSave = slowLen * (1 - 1 / MAX_SLOW_STEP_SPEED);
      slowSpeed = excess >= maxSave ? MAX_SLOW_STEP_SPEED : slowLen / (slowLen - excess);
      excess -= slowLen * (1 - 1 / slowSpeed);
    }

    const playLen = pieces.reduce((n, p) => n + (p.to - p.from) / (p.slow ? slowSpeed : 1), 0);
    const speed = excess > 0.01 ? Math.min(MAX_SPEED, playLen / target) : 1;
    for (const p of pieces) segments.push({ from: p.from, to: p.to, speed: speed * (p.slow ? slowSpeed : 1) });

    const len = playLen / speed;
    scenes.push({
      id: t.id, start: out, end: out + len, audio: t.audio,
      cut: +cut.toFixed(2), slowSpeed: +slowSpeed.toFixed(2), speed: +speed.toFixed(2),
    });
    out += len;
  }

  return { segments, scenes, total: out };
}
