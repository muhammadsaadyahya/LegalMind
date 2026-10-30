import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { io } from "socket.io-client";
import { BRIEF_PDF, LEASE_PDF } from "./fixtures.mjs";
import { DEMO_CASE, PASSWORD, USERS, getCases, login } from "./seed.mjs";
import { API_URL, BASE_URL } from "./servers.mjs";
import { OUT_DIR, log, sleep, writeJson } from "./util.mjs";

export const TIMINGS_FILE = path.join(OUT_DIR, "timings.json");
export const RAW_VIDEO = path.join(OUT_DIR, "raw.webm");

const WIDTH = 1920;
const HEIGHT = 1080;
// Playwright slowMo would delay every keystroke too, so pace actions explicitly instead.
const ACTION_PAUSE = 300; // ms before each click, like slowMo but typing stays natural
// Per-key typing costs ~300ms/key on this animated UI while recording, so text goes in as short
// chunks (short fields) or whole words (long text). It still reads as typing on video.
const CHUNK_DELAY = 60;
const WORD_DELAY = 110;
const GAP_AFTER_AUDIO = 0.6; // s of breathing room after each narration clip
const AI_TIMEOUT = 60000;
// Time the AI result stays on screen in the raw recording; the timeline trims the wait before it
// first, so a longer hold means less spinner and more answer in the final video.
const RESULT_HOLD = 5000;

// Playwright renders no cursor, so draw one: a dot that follows the mouse plus a ripple on click.
const CURSOR_SCRIPT = `(() => {
  if (window.__demoCursor) return;
  window.__demoCursor = true;
  const install = () => {
    const style = document.createElement("style");
    style.textContent = \`
      #__demo-cursor { position: fixed; left: -100px; top: -100px; width: 22px; height: 22px;
        margin: -11px 0 0 -11px; border-radius: 50%; background: rgba(255,255,255,0.95);
        border: 3px solid #7c3aed; box-shadow: 0 0 0 5px rgba(124,58,237,0.28), 0 2px 10px rgba(0,0,0,0.5);
        z-index: 2147483647; pointer-events: none; transition: transform 0.1s ease; }
      #__demo-cursor.down { transform: scale(0.7); }
      .__demo-ripple { position: fixed; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%;
        border: 3px solid #a78bfa; z-index: 2147483646; pointer-events: none;
        animation: __demo-ripple 0.6s ease-out forwards; }
      @keyframes __demo-ripple { from { transform: scale(1); opacity: 1; } to { transform: scale(5); opacity: 0; } }
      html { scroll-behavior: smooth; }
    \`;
    document.head.appendChild(style);
    const dot = document.createElement("div");
    dot.id = "__demo-cursor";
    document.body.appendChild(dot);
    addEventListener("mousemove", (e) => {
      dot.style.left = e.clientX + "px";
      dot.style.top = e.clientY + "px";
    }, true);
    addEventListener("mousedown", (e) => {
      dot.classList.add("down");
      const r = document.createElement("div");
      r.className = "__demo-ripple";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 700);
    }, true);
    addEventListener("mouseup", () => dot.classList.remove("down"), true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();`;

// Title / end cards, styled after the app (indigo-violet gradients, glass panels, sparkle mark).
// Content sits above centre to leave the bottom band free for subtitles.
const SPARKLE_SVG = `<svg width="64" height="64" viewBox="0 0 24 24" fill="white"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9z"/><path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" opacity=".85"/><path d="M5 15l.6 1.6 1.6.6-1.6.6L5 19.4l-.6-1.6-1.6-.6 1.6-.6z" opacity=".7"/></svg>`;
const GITHUB_SVG = `<svg width="34" height="34" viewBox="0 0 16 16" fill="#e2e8f0"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

export function cardHtml({ eyebrow, tagline, pills = [], pillsLabel = "", footer = "" }) {
  const pillHtml = pills
    .map((p, i) => `<span class="dc-pill" style="animation-delay:${0.55 + i * 0.08}s"><i></i>${p}</span>`)
    .join("");
  return `
    <style>
      #__demo-card .dc-orb { position:absolute; border-radius:50%; filter:blur(110px); opacity:.55; }
      #__demo-card .dc-grid { position:absolute; inset:0; opacity:.35;
        background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
        background-size:64px 64px; mask-image:radial-gradient(ellipse at center,#000 20%,transparent 70%); }
      #__demo-card .dc-in { opacity:0; animation:dc-up .8s cubic-bezier(.2,.8,.2,1) forwards; }
      #__demo-card .dc-mark { width:132px; height:132px; border-radius:36px; display:flex; align-items:center;
        justify-content:center; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
        box-shadow:0 20px 60px rgba(102,126,234,.55), inset 0 1px 0 rgba(255,255,255,.35); }
      #__demo-card .dc-title { font-size:150px; font-weight:800; letter-spacing:-4px; line-height:1.15;
        padding:0 12px 18px; margin-bottom:-18px; /* room for the "g" descender inside the gradient clip */
        background:linear-gradient(135deg,#a5b4fc 0%,#c084fc 50%,#f472b6 100%);
        -webkit-background-clip:text; background-clip:text; color:transparent; }
      #__demo-card .dc-pill { display:inline-flex; align-items:center; gap:12px; padding:14px 26px; border-radius:16px;
        background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); backdrop-filter:blur(12px);
        font-size:25px; font-weight:500; color:#e2e8f0; opacity:0; animation:dc-up .7s ease forwards; }
      #__demo-card .dc-pill i { width:10px; height:10px; border-radius:50%;
        background:linear-gradient(135deg,#818cf8,#f472b6); box-shadow:0 0 12px #c084fc; }
      @keyframes dc-up { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
    </style>
    <div class="dc-grid"></div>
    <div class="dc-orb" style="width:760px;height:760px;background:#6d28d9;top:-260px;left:-160px"></div>
    <div class="dc-orb" style="width:640px;height:640px;background:#db2777;bottom:-300px;right:-120px;opacity:.35"></div>
    <div class="dc-orb" style="width:520px;height:520px;background:#2563eb;top:30%;right:22%;opacity:.25"></div>
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;margin-top:-150px">
      <div class="dc-in dc-mark" style="animation-delay:.05s">${SPARKLE_SVG}</div>
      <div class="dc-in" style="animation-delay:.15s;margin-top:34px;font-size:24px;font-weight:600;letter-spacing:7px;
        text-transform:uppercase;color:#a78bfa">${eyebrow}</div>
      <div class="dc-in dc-title" style="animation-delay:.25s;margin-top:14px">LegalMind</div>
      <div class="dc-in" style="animation-delay:.38s;margin-top:22px;font-size:40px;color:#cbd5e1;font-weight:400">${tagline}</div>
      ${pillsLabel ? `<div class="dc-in" style="animation-delay:.5s;margin-top:46px;font-size:22px;letter-spacing:4px;text-transform:uppercase;color:#94a3b8">${pillsLabel}</div>` : ""}
      <div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;max-width:1500px;margin-top:${pillsLabel ? 18 : 48}px">${pillHtml}</div>
      ${footer ? `<div class="dc-in" style="animation-delay:1.1s;margin-top:44px;display:flex;align-items:center;gap:16px;
        padding:16px 30px;border-radius:999px;background:rgba(15,12,41,.6);border:1px solid rgba(167,139,250,.45);
        font-size:32px;color:#e2e8f0;font-family:Consolas,'Cascadia Mono',monospace">${GITHUB_SVG}${footer}</div>` : ""}
    </div>`;
}

export async function record(config, durations) {
  const rawDir = path.join(OUT_DIR, "raw");
  fs.rmSync(rawDir, { recursive: true, force: true });

  // Full Chromium with GPU rasterization: the app's blur/particle effects render at ~8 fps in the
  // software-only headless shell (choppy video, slow steps) vs ~55 fps on the GPU.
  const browser = await chromium
    .launch({ channel: "chromium", args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"] })
    .catch((e) => {
      log("record", `GPU Chromium unavailable (${e.message.split("\n")[0]}); using headless shell`);
      return chromium.launch();
    });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: { dir: rawDir, size: { width: WIDTH, height: HEIGHT } },
  });
  await context.addInitScript(CURSOR_SCRIPT);
  const page = await context.newPage();
  const t0 = Date.now(); // video time zero ~ page creation
  const now = () => (Date.now() - t0) / 1000;
  const warnings = [];
  page.on("dialog", (d) => d.accept().catch(() => {})); // app uses alert() after uploads

  // ---- helpers ------------------------------------------------------------
  let mouse = { x: WIDTH / 2, y: HEIGHT / 2 };
  async function moveTo(locator) {
    await locator.waitFor({ state: "visible", timeout: 15000 });
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const dist = Math.hypot(x - mouse.x, y - mouse.y);
    await page.mouse.move(x, y, { steps: Math.max(5, Math.min(10, Math.round(dist / 80))) });
    mouse = { x, y };
  }
  // Log any step that takes unusually long, to see where a slow scene spends its time.
  // Slow steps are also handed to the timeline, which plays them faster in the final video.
  let sceneSlow = [];
  async function timed(label, fn) {
    const t = now();
    await fn();
    const d = now() - t;
    if (d > 1.0) sceneSlow.push({ from: t, to: now() });
    if (d > 1.5) log("record", `  slow step ${d.toFixed(1)}s: ${label}`);
  }
  async function click(locator) {
    await timed(`click ${locator}`, async () => {
      await moveTo(locator);
      await sleep(ACTION_PAUSE);
      await locator.click();
      await sleep(ACTION_PAUSE);
    });
  }
  async function type(locator, text) {
    await click(locator);
    await timed(`type "${text.slice(0, 24)}"`, async () => {
      await locator.fill(""); // the login form ships with prefilled demo credentials
      const short = text.length <= 32;
      for (const chunk of short ? text.match(/.{1,3}/g) : text.match(/\S+\s*/g)) {
        await page.keyboard.insertText(chunk);
        await sleep(short ? CHUNK_DELAY : WORD_DELAY);
      }
    });
  }
  const caseTitle = () => page.getByText(DEMO_CASE.title, { exact: true }).locator("visible=true").first();
  const navLink = (label) =>
    page.locator(".navbar .nav-link").filter({ has: page.getByText(label, { exact: true }) });
  // Pages swap with a 0.3s exit/enter animation; let it finish so locators don't grab the exiting page.
  async function go(label) {
    await click(navLink(label));
    await sleep(700);
  }
  async function soft(promise, what) {
    try {
      await promise;
      return true;
    } catch (e) {
      const msg = `${what}: ${e.message.split("\n")[0]}`;
      warnings.push(msg);
      log("record", `WARN ${msg}`);
      return false;
    }
  }
  // Waiting on an AI response: logged so the timeline step can trim most of it from the video.
  let sceneWaits = [];
  async function aiWait(promise, what) {
    const from = now();
    const ok = await soft(promise, what);
    sceneWaits.push({ from, to: now() });
    return ok;
  }
  // Keep an AI result on screen; the timeline may trim the end of this hold if the scene runs long.
  let sceneHolds = [];
  async function holdResult() {
    sceneHolds.push({ from: now() });
    await sleep(RESULT_HOLD);
  }
  async function smoothScrollIntoView(locator) {
    await locator.evaluate((el) => el.scrollIntoView({ behavior: "smooth", block: "center" }));
    await sleep(900);
  }
  async function showCard(opts) {
    await page.evaluate((html) => {
      const el = document.createElement("div");
      el.id = "__demo-card";
      el.style.cssText = `position:fixed;inset:0;z-index:2147483600;display:flex;flex-direction:column;
        align-items:center;justify-content:center;font-family:Inter,Segoe UI,system-ui,sans-serif;
        overflow:hidden;background:#0b0920;opacity:0;transition:opacity 0.6s ease`;
      el.innerHTML = html;
      document.body.appendChild(el);
      const cursor = document.getElementById("__demo-cursor");
      if (cursor) cursor.style.visibility = "hidden"; // no cursor over the title cards
      requestAnimationFrame(() => requestAnimationFrame(() => (el.style.opacity = "1")));
    }, cardHtml(opts));
    await sleep(600);
  }
  async function hideCard() {
    await page.evaluate(() => {
      const el = document.getElementById("__demo-card");
      if (!el) return;
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 700);
      const cursor = document.getElementById("__demo-cursor");
      if (cursor) cursor.style.visibility = "visible";
    });
    await sleep(700);
  }
  async function signIn(user) {
    await type(page.getByPlaceholder("Email Address"), user.email);
    await type(page.getByPlaceholder("Password"), PASSWORD);
    await click(page.getByRole("button", { name: "Sign In" }));
    await page.waitForURL("**/app", { timeout: 15000 });
  }

  // Hidden second participant for the live-chat scene (the client, replying from "another device").
  let clientSocket = null;
  let chatCtx = null;
  async function prepareClientChat() {
    const { token, user } = await login(USERS.client.email);
    const cases = await getCases(token);
    const demoCase = cases.find((c) => c.title === DEMO_CASE.title);
    if (!demoCase) throw new Error("demo case not found for client");
    clientSocket = io(API_URL, { transports: ["websocket"], auth: { token } });
    await new Promise((resolve, reject) => {
      clientSocket.once("connect", resolve);
      clientSocket.once("connect_error", reject);
    });
    // No UI path creates a case's chat room record, so create it via the app's own socket event.
    await new Promise((resolve) => {
      clientSocket.once("chatCreated", resolve);
      clientSocket.once("errorMessage", resolve); // "Chat already exists" is fine
      clientSocket.emit("createChat", { caseId: demoCase._id });
    });
    clientSocket.emit("joinChat", { caseId: demoCase._id, userId: user._id });
    chatCtx = { caseId: demoCase._id, userId: user._id };
  }

  // ---- scenes ---------------------------------------------------------------
  const scenes = {
    async intro() {
      await showCard({
        eyebrow: "AI-powered legal practice",
        tagline: "Cases, documents, real-time chat and AI research in one workspace",
        pills: ["Case management", "AI document summaries", "RAG search", "Real-time chat", "Outcome prediction"],
      });
      await page.evaluate(() => document.getElementById("__demo-cover")?.remove());
    },

    async "sign-in"() {
      await hideCard();
      await moveTo(page.locator(".hero h1"));
      await click(page.getByRole("button", { name: "Request Demo" }));
      await signIn(USERS.client);
      await soft(page.getByText("Welcome back").first().waitFor({ timeout: 10000 }), "client dashboard");
    },

    async "create-case"() {
      await go("My Cases");
      await click(page.getByRole("button", { name: "Add New Case" }));
      await type(page.getByPlaceholder("Enter case title"), DEMO_CASE.title);
      await click(page.getByText("Click to select a lawyer..."));
      await click(page.locator(".modal").getByText(USERS.lawyer.email));
      await click(page.getByRole("button", { name: new RegExp(DEMO_CASE.caseType) }));
      await type(page.getByPlaceholder("Describe your case..."), DEMO_CASE.description);
      await type(page.getByPlaceholder("e.g., urgent, review, contract"), DEMO_CASE.tags);
      await click(page.getByRole("button", { name: "Add Case" }));
      await soft(caseTitle().waitFor({ timeout: 8000 }), "new case in list");
      await moveTo(caseTitle());
      await sleep(1200);
    },

    async upload() {
      await click(caseTitle());
      await click(page.getByRole("button", { name: "Add Document" }));
      const chooser = page.waitForEvent("filechooser");
      await click(page.getByText("Click to select a file"));
      await (await chooser).setFiles(LEASE_PDF);
      await sleep(600);
      await click(page.getByRole("button", { name: "Upload Document" }));
      await soft(page.locator(".modal").waitFor({ state: "hidden", timeout: 20000 }), "document upload");
    },

    async "lawyer-view"() {
      await click(page.locator(".navbar .dropdown").last());
      await click(page.getByText("Logout"));
      await page.getByPlaceholder("Email Address").waitFor();
      await signIn(USERS.lawyer);
      await soft(page.getByText("Active Cases").first().waitFor({ timeout: 10000 }), "lawyer dashboard");
      await moveTo(page.getByText("Active Cases").first());
      await sleep(800);
      await go("Cases");
      await click(caseTitle());
    },

    async chat() {
      await soft(prepareClientChat(), "client chat socket");
      await go("Chat");
      await click(page.getByText(DEMO_CASE.title, { exact: true }).first());
      const box = page.getByPlaceholder(/Type a message/);
      await type(box, "Hi Maya, I reviewed your lease. Section 3 says the deposit is due back within 21 days, so we have a strong claim.");
      await click(page.getByRole("button", { name: "Send Message" }));
      if (clientSocket && chatCtx) {
        await sleep(1500);
        clientSocket.emit("sendMessage", {
          ...chatCtx,
          message: "That's great news, thank you! I also have photos of the roof damage.",
        });
        await soft(page.getByText("photos of the roof damage").waitFor({ timeout: 8000 }), "live chat reply");
      }
    },

    async summary() {
      await go("Documents");
      await click(page.getByText(path.basename(LEASE_PDF)).first());
      await click(page.getByRole("button", { name: /Generate Summary/ }));
      const summary = page.locator("pre").first();
      if (await aiWait(summary.waitFor({ timeout: AI_TIMEOUT }), "AI summary")) {
        await smoothScrollIntoView(summary);
        await holdResult();
      }
    },

    async rag() {
      await go("RAG Search");
      await click(page.getByRole("heading", { name: path.basename(LEASE_PDF) }).first());
      await type(
        page.getByPlaceholder("Ask a question about your documents..."),
        "How long does the landlord have to return the security deposit?",
      );
      await click(page.locator("form button[type=submit]"));
      const firstResult = page.getByText(/^Context 1$/).first();
      if (await aiWait(firstResult.waitFor({ timeout: AI_TIMEOUT }), "RAG results")) {
        await moveTo(firstResult);
        await sleep(1200); // let the retrieved passages register before opening the answer
        await click(firstResult);
        const answer = page.getByText("Generated Answer (from all contexts)");
        if (await soft(answer.waitFor({ timeout: 5000 }), "RAG answer")) {
          await smoothScrollIntoView(answer);
          await holdResult();
        }
      }
    },

    async assistant() {
      await go("AI Assistant");
      await type(
        page.getByPlaceholder("Ask me anything about your legal case..."),
        "What can a tenant do if a landlord ignores repeated written repair requests?",
      );
      await page.keyboard.press("Enter");
      await soft(page.getByText("AI is thinking...").waitFor({ timeout: 5000 }), "assistant thinking");
      await aiWait(page.getByText("AI is thinking...").waitFor({ state: "hidden", timeout: AI_TIMEOUT }), "assistant reply");
      await holdResult();
    },

    async predictor() {
      await go("Case Predictor");
      const chooser = page.waitForEvent("filechooser");
      await click(page.getByText("Upload Case Document"));
      await (await chooser).setFiles(BRIEF_PDF);
      await click(page.getByRole("button", { name: /Analyze Document/ }));
      await aiWait(page.getByText("Winning Probability", { exact: true }).waitFor({ timeout: AI_TIMEOUT }), "case prediction");
      await holdResult();
    },

    async outro() {
      await showCard({
        eyebrow: "Thanks for watching",
        tagline: "AI-powered legal practice management",
        pillsLabel: "Built with",
        pills: config.techStack,
        footer: config.githubUrl,
      });
    },
  };

  // ---- run ----------------------------------------------------------------
  const timings = [];
  try {
    // Pre-roll (trimmed from the final video): load the landing page behind a plain dark cover,
    // so the intro scene can animate the title card in on camera.
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const cover = document.createElement("div");
      cover.id = "__demo-cover";
      cover.style.cssText = "position:fixed;inset:0;z-index:2147483500;background:#0b0920";
      document.body.appendChild(cover);
    });
    await sleep(500);

    for (const scene of config.scenes) {
      const fn = scenes[scene.id];
      if (!fn) throw new Error(`No Playwright actions defined for scene "${scene.id}"`);
      const audio = durations[scene.id];
      const start = now();
      const ctx = {
        // Wait until `offset` seconds relative to the end of this scene's narration.
        untilAudioEnd: async (offset = 0) => {
          const wait = start + audio + offset - now();
          if (wait > 0) await sleep(wait * 1000);
        },
      };
      log("record", `${scene.id.padEnd(12)} start ${start.toFixed(2)}s (audio ${audio.toFixed(2)}s)`);
      sceneWaits = [];
      sceneHolds = [];
      sceneSlow = [];
      await fn(ctx);
      const actionsEnd = now();
      // Narration drives timing: never end a scene before its clip (plus a short gap) has played.
      await ctx.untilAudioEnd(scene.id === "outro" ? 1.5 : GAP_AFTER_AUDIO);
      timings.push({ id: scene.id, start, actionsEnd, end: now(), audio, waits: sceneWaits, holds: sceneHolds, slow: sceneSlow });
    }
  } catch (err) {
    await page.screenshot({ path: path.join(OUT_DIR, "error.png") }).catch(() => {});
    log("record", `failed; screenshot at ${path.join(OUT_DIR, "error.png")}`);
    throw err;
  } finally {
    clientSocket?.disconnect();
    await context.close(); // flushes the video
    await browser.close();
  }

  const video = await page.video().path();
  fs.copyFileSync(video, RAW_VIDEO);
  fs.rmSync(rawDir, { recursive: true, force: true });
  writeJson(TIMINGS_FILE, { video: path.basename(RAW_VIDEO), recordedAt: new Date().toISOString(), scenes: timings, warnings });
  log("record", `video saved, ${timings.at(-1).end.toFixed(1)}s, ${warnings.length} warning(s)`);
  return { timings, warnings };
}
