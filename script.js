"use strict";

const CONFIG = {
  name: "Cəmilə",
  introText: "sənin üçün kiçik bir sürprizim var...",
  introPrompt: "Hazırsansa, sehrli anı aç ✦",
  openButtonText: "SÜRPRİZİ AÇ",
  introText2: "Bunu sənə sadəcə bir mesaj kimi göndərmək istəmədim...",
  personalMessage2: "Çünki sən adi bir təbrikdən daha özəlsən. Ona görə bu balaca dünyanı yalnız sənin üçün hazırladım. 🤍",
  personalMessage3: "İndi isə əsas sürprizə keçək.",
  watchButtonText: "Videoya bax",
  videoPath: "birthday-video.mp4",
  finalPrelude: "Əzizim✨",
  finalTitle: "Ad günün mübarək!",
  finalMessage: "Yeni yaşında sənə hər şeydən əvvəl möhkəm can sağlığı, sonsuz xoşbəxtlik, gözəl xatirələr və hər gün üzünü güldürəcək səbəblər arzulayıram. Ürəyindəki bütün arzular gerçəkləşsin. Yaxşı ki, varsan ürəyimm❤️ ㅤㅤHəmişə yanındayam)))",
  hiddenMessageEnabled: true,
  hiddenMessage: "Bir şeyi unutma,sən düşündüyündən də daha dəyərlisən❤️",
  signature: "✦ For Jamila ♡ ᯓ✈︎\n17.09.2026 🤍"
};

const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes = [...document.querySelectorAll(".scene")];
const dom = {
  intro: document.getElementById("intro"), message: document.getElementById("message"), videoScene: document.getElementById("videoScene"), final: document.getElementById("final"), envelope: document.getElementById("envelope"), openSurprise: document.getElementById("openSurprise"), watchVideo: document.getElementById("watchVideo"), birthdayVideo: document.getElementById("birthdayVideo"), videoFrame: document.getElementById("videoFrame"), videoError: document.getElementById("videoError"), skipToFinal: document.getElementById("skipToFinal"), hiddenMessageButton: document.getElementById("hiddenMessageButton"), hiddenMessage: document.getElementById("hiddenMessage"), replayExperience: document.getElementById("replayExperience"), soundToggle: document.getElementById("soundToggle"), soundLabel: document.getElementById("soundLabel"), canvas: document.getElementById("celebrationCanvas"), liveRegion: document.getElementById("liveRegion")
};

let currentScene = document.getElementById("loading");
let transitionLocked = false;
let audioCtx = null;
let masterGain = null;
let ambientNodes = [];
let soundEnabled = false;
let celebrationFrame = 0;

function setViewportHeight() { document.documentElement.style.setProperty("--safe-vh", innerHeight + "px"); }
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function announce(message) { dom.liveRegion.textContent = message; }

function applyConfig() {
  document.getElementById("introTitle").textContent = CONFIG.name + ", " + CONFIG.introText;
  document.getElementById("introPrompt").textContent = CONFIG.introPrompt;
  document.getElementById("openButtonText").textContent = CONFIG.openButtonText;
  document.getElementById("messageTitle").textContent = CONFIG.introText2;
  document.getElementById("messageSecond").textContent = CONFIG.personalMessage2;
  document.getElementById("messageThird").textContent = CONFIG.personalMessage3;
  document.getElementById("watchButtonText").textContent = CONFIG.watchButtonText;
  document.getElementById("finalPrelude").textContent = CONFIG.finalPrelude;
  document.getElementById("finalTitle").textContent = CONFIG.finalTitle;
  document.getElementById("finalMessage").textContent = CONFIG.finalMessage;
  document.getElementById("hiddenMessageText").textContent = CONFIG.hiddenMessage;
  document.getElementById("signature").textContent = CONFIG.signature;
  dom.hiddenMessageButton.hidden = !CONFIG.hiddenMessageEnabled;
  dom.birthdayVideo.src = CONFIG.videoPath;
}

function createStars() {
  if (prefersReducedMotion) return;
  const field = document.getElementById("starField");
  const count = innerWidth < 600 ? 32 : 62;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("i");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.setProperty("--size", (.7 + Math.random() * 1.8).toFixed(1) + "px");
    star.style.setProperty("--opacity", (.16 + Math.random() * .55).toFixed(2));
    star.style.setProperty("--duration", 17 + Math.random() * 25 + "s");
    star.style.setProperty("--delay", -Math.random() * 28 + "s");
    field.appendChild(star);
  }
}

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioCtx = new AudioContext();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(audioCtx.destination);
}

function tone(frequency, duration = .18, type = "sine", volume = .1, delay = 0) {
  if (!soundEnabled || !audioCtx) return;
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  osc.connect(gain).connect(masterGain);
  osc.start(now); osc.stop(now + duration + .05);
}

function noiseBurst(duration = .22, volume = .025) {
  if (!soundEnabled || !audioCtx) return;
  const size = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 2);
  const source = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  filter.type = "highpass"; filter.frequency.value = 1800;
  gain.gain.value = volume;
  source.buffer = buffer; source.connect(filter).connect(gain).connect(masterGain); source.start();
}

function playClick() { tone(720, .09, "sine", .055); tone(1080, .11, "sine", .03, .035); }
function playWhoosh() { noiseBurst(.42, .018); tone(220, .38, "sine", .045); }
function playEnvelopeSound() { noiseBurst(.34, .025); tone(392, .5, "sine", .06, .05); tone(523.25, .65, "sine", .055, .2); tone(659.25, .8, "sine", .045, .36); }
function playFinalChime() { [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => tone(n, 1.15, "sine", .055, i * .13)); }

function startAmbient() {
  if (!soundEnabled || !audioCtx || ambientNodes.length) return;
  const ambientGain = audioCtx.createGain();
  ambientGain.gain.setValueAtTime(.0001, audioCtx.currentTime);
  ambientGain.gain.exponentialRampToValueAtTime(.028, audioCtx.currentTime + 1.5);
  ambientGain.connect(masterGain);
  [65.41, 98, 130.81].forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = index === 1 ? "triangle" : "sine";
    osc.frequency.value = freq;
    gain.gain.value = index === 0 ? .45 : .18;
    osc.connect(gain).connect(ambientGain); osc.start();
    ambientNodes.push(osc, gain);
  });
  ambientNodes.push(ambientGain);
}

function stopAmbient() {
  if (!ambientNodes.length) return;
  ambientNodes.forEach(node => { try { if (node.stop) node.stop(); } catch (_) {} try { node.disconnect(); } catch (_) {} });
  ambientNodes = [];
}

async function toggleSound() {
  initAudio();
  if (!audioCtx) return;
  await audioCtx.resume();
  soundEnabled = !soundEnabled;
  dom.soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  dom.soundToggle.setAttribute("aria-label", soundEnabled ? "Səsi söndür" : "Səsi aktiv et");
  dom.soundLabel.textContent = soundEnabled ? "SƏS AÇIQ" : "SƏS";
  if (soundEnabled) { startAmbient(); playFinalChime(); } else stopAmbient();
}

async function showScene(nextId, options = {}) {
  const next = document.getElementById(nextId);
  if (!next || next === currentScene || transitionLocked) return;
  transitionLocked = true;
  if (options.sound !== false) playWhoosh();
  currentScene.classList.add("is-leaving");
  await wait(prefersReducedMotion ? 20 : (options.delay ?? 650));
  scenes.forEach(scene => {
    const active = scene === next;
    scene.classList.toggle("is-active", active);
    scene.classList.remove("is-leaving");
    scene.setAttribute("aria-hidden", String(!active));
  });
  currentScene = next; next.scrollTop = 0; transitionLocked = false;
  if (next === dom.message) requestAnimationFrame(() => next.classList.add("sequence-start"));
  if (next === dom.final) {
    requestAnimationFrame(() => next.classList.add("sequence-start"));
    playFinalChime(); startCelebration();
  }
  announce(options.announcement || "Növbəti mərhələ açıldı.");
}

function addRipple(event) {
  playClick();
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = ((event.clientX || rect.left + rect.width / 2) - rect.left - size / 2) + "px";
  ripple.style.top = ((event.clientY || rect.top + rect.height / 2) - rect.top - size / 2) + "px";
  button.appendChild(ripple); ripple.addEventListener("animationend", () => ripple.remove());
}

async function openEnvelope() {
  if (transitionLocked || dom.envelope.classList.contains("is-open")) return;
  if (!audioCtx) { initAudio(); if (audioCtx) await audioCtx.resume(); }
  transitionLocked = true; dom.openSurprise.disabled = true;
  dom.envelope.classList.add("is-open"); playEnvelopeSound(); announce("Sürpriz açılır.");
  await wait(prefersReducedMotion ? 80 : 1900);
  transitionLocked = false;
  await showScene("message", { announcement: "Şəxsi mesaj açıldı." });
}

async function openVideo() {
  if (transitionLocked) return;
  dom.videoError.hidden = true; dom.birthdayVideo.hidden = false;
  await showScene("videoScene", { announcement: "Video açıldı." });
  if (soundEnabled && masterGain) masterGain.gain.setTargetAtTime(.18, audioCtx.currentTime, .25);
  try { await dom.birthdayVideo.play(); } catch (_) {}
}

async function finishVideo() {
  dom.videoFrame.classList.add("is-fading");
  if (soundEnabled && masterGain) masterGain.gain.setTargetAtTime(.55, audioCtx.currentTime, .35);
  await wait(prefersReducedMotion ? 25 : 820);
  await showScene("final", { delay: prefersReducedMotion ? 20 : 420, announcement: "Final ad günü mesajı açıldı." });
}

function handleVideoError() {
  dom.birthdayVideo.hidden = true; dom.videoError.hidden = false; announce("Video hazırda əlçatan deyil.");
}

function startCelebration() {
  if (prefersReducedMotion) return;
  cancelAnimationFrame(celebrationFrame);
  const canvas = dom.canvas, ctx = canvas.getContext("2d");
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio; ctx.scale(ratio, ratio);
  const colors = ["#f6dfaa", "#cda65d", "#d38a9c", "#8798bd", "#fff9ef"];
  const pieces = Array.from({ length: innerWidth < 600 ? 70 : 125 }, () => ({
    x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .8,
    vx: -1.1 + Math.random() * 2.2, vy: 1.5 + Math.random() * 3.3,
    size: 3 + Math.random() * 6, spin: Math.random() * Math.PI, spinSpeed: -.08 + Math.random() * .16,
    color: colors[Math.floor(Math.random() * colors.length)], shape: Math.random() > .83 ? "heart" : Math.random() > .62 ? "star" : "rect", opacity: .55 + Math.random() * .45
  }));
  const started = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pieces.forEach(p => {
      p.x += p.vx + Math.sin(p.y * .018) * .35; p.y += p.vy; p.spin += p.spinSpeed;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin); ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
      if (p.shape === "heart") { ctx.font = (p.size * 2.2) + "px serif"; ctx.fillText("♥", -p.size, p.size); }
      else if (p.shape === "star") { ctx.font = (p.size * 2) + "px serif"; ctx.fillText("✦", -p.size, p.size); }
      else ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
      ctx.restore();
    });
    if (now - started < 12500) celebrationFrame = requestAnimationFrame(frame); else ctx.clearRect(0,0,innerWidth,innerHeight);
  }
  celebrationFrame = requestAnimationFrame(frame);
}

function toggleHiddenMessage() {
  const open = dom.hiddenMessage.hidden;
  dom.hiddenMessage.hidden = !open; dom.hiddenMessageButton.setAttribute("aria-expanded", String(open));
  dom.hiddenMessageButton.textContent = open ? "Bu da sənə..." : "Bir şey də var...";
  dom.hiddenMessage.classList.toggle("is-visible", open);
  if (open) { playFinalChime(); dom.hiddenMessage.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" }); }
}

async function replay() {
  dom.birthdayVideo.pause(); dom.birthdayVideo.currentTime = 0; dom.videoFrame.classList.remove("is-fading");
  dom.envelope.classList.remove("is-open"); dom.openSurprise.disabled = false;
  dom.message.classList.remove("sequence-start"); dom.final.classList.remove("sequence-start");
  dom.hiddenMessage.hidden = true; dom.hiddenMessage.classList.remove("is-visible");
  dom.hiddenMessageButton.setAttribute("aria-expanded", "false"); dom.hiddenMessageButton.textContent = "Bir şey də var...";
  cancelAnimationFrame(celebrationFrame);
  await showScene("intro", { announcement: "Sürpriz yenidən başladı." });
}

function bindEvents() {
  dom.soundToggle.addEventListener("click", toggleSound);
  dom.openSurprise.addEventListener("click", openEnvelope);
  dom.watchVideo.addEventListener("click", openVideo);
  dom.birthdayVideo.addEventListener("ended", finishVideo);
  dom.birthdayVideo.addEventListener("error", handleVideoError);
  dom.skipToFinal.addEventListener("click", finishVideo);
  dom.hiddenMessageButton.addEventListener("click", toggleHiddenMessage);
  dom.replayExperience.addEventListener("click", replay);
  document.querySelectorAll(".button").forEach(button => button.addEventListener("pointerdown", addRipple));
  addEventListener("resize", setViewportHeight, { passive: true });
  document.addEventListener("visibilitychange", () => { if (audioCtx && document.hidden) audioCtx.suspend(); else if (audioCtx && soundEnabled) audioCtx.resume(); });
}

async function init() {
  setViewportHeight(); applyConfig(); createStars(); bindEvents();
  await wait(prefersReducedMotion ? 250 : 1550);
  await showScene("intro", { delay: prefersReducedMotion ? 20 : 500, announcement: "Sürpriz hazırdır.", sound: false });
}

document.addEventListener("DOMContentLoaded", init, { once: true });
