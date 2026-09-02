"use strict";

/* Bütün əsas mətnləri və asset yollarını buradan dəyişə bilərsiniz. */
const CONFIG = {
  name: "NAME",
  introText: "Sənin üçün kiçik bir sürprizim var...",
  introPrompt: "Hazırsansa, aç ✦",
  openButtonText: "SÜRPRİZİ AÇ",
  introText2: "Bunu sənə sadə şəkildə göndərmək istəmədim...",
  personalMessage2: "Ona görə sənin üçün balaca bir sürpriz hazırladım. ❤️",
  personalMessage3: "Hazırsansa, əsas sürprizə keçək.",
  watchButtonText: "Videoya bax",
  videoPath: "birthday-video.mp4",
  finalPrelude: "Vəssalam... ❤️",
  finalTitle: "Ad günün mübarək!",
  finalMessage: "Yeni yaşında sənə bol-bol xoşbəxtlik, gözəl günlər və həmişə üzünü güldürəcək anlar arzulayıram. Yaxşı ki, varsan. ❤️",
  hiddenMessageEnabled: true,
  hiddenMessage: "Bu qədər. Sadəcə üzündə bir təbəssüm yaratmaq istədim. ❤️",
  signature: `✦ For Jamila ♡ ᯓ✈︎
17.09.2026🤍`,
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes = Array.from(document.querySelectorAll(".scene"));
const dom = {
  intro: document.getElementById("intro"),
  message: document.getElementById("message"),
  videoScene: document.getElementById("videoScene"),
  final: document.getElementById("final"),
  envelope: document.getElementById("envelope"),
  openSurprise: document.getElementById("openSurprise"),
  watchVideo: document.getElementById("watchVideo"),
  birthdayVideo: document.getElementById("birthdayVideo"),
  videoFrame: document.getElementById("videoFrame"),
  videoError: document.getElementById("videoError"),
  skipToFinal: document.getElementById("skipToFinal"),
  hiddenMessageButton: document.getElementById("hiddenMessageButton"),
  hiddenMessage: document.getElementById("hiddenMessage"),
  replayExperience: document.getElementById("replayExperience"),
  celebration: document.getElementById("celebration"),
  liveRegion: document.getElementById("liveRegion")
};

let currentScene = document.getElementById("loading");
let transitionLocked = false;

function setViewportHeight() {
  document.documentElement.style.setProperty("--safe-vh", window.innerHeight + "px");
}

function personaliseIntro() {
  const hasName = CONFIG.name.trim() && CONFIG.name.trim().toUpperCase() !== "NAME";
  return hasName ? CONFIG.name.trim() + ", " + CONFIG.introText.charAt(0).toLowerCase() + CONFIG.introText.slice(1) : CONFIG.introText;
}

function applyConfig() {
  document.getElementById("introTitle").textContent = personaliseIntro();
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

function announce(message) {
  dom.liveRegion.textContent = message;
}

async function showScene(nextId, options = {}) {
  const next = document.getElementById(nextId);
  if (!next || next === currentScene || transitionLocked) return;
  transitionLocked = true;

  currentScene.classList.add("is-leaving");
  await wait(prefersReducedMotion ? 20 : (options.delay ?? 550));

  scenes.forEach(scene => {
    const active = scene === next;
    scene.classList.toggle("is-active", active);
    scene.classList.remove("is-leaving");
    scene.setAttribute("aria-hidden", String(!active));
  });

  currentScene = next;
  next.scrollTop = 0;
  transitionLocked = false;

  if (next === dom.message) requestAnimationFrame(() => next.classList.add("sequence-start"));
  if (next === dom.final) {
    requestAnimationFrame(() => next.classList.add("sequence-start"));
    startCelebration();
  }
  announce(options.announcement || "Növbəti mərhələ açıldı.");
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function createAmbientParticles() {
  if (prefersReducedMotion) return;
  const container = document.getElementById("ambientParticles");
  const count = window.innerWidth < 600 ? 13 : 24;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "ambient-particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.setProperty("--duration", 12 + Math.random() * 16 + "s");
    particle.style.setProperty("--opacity", (.18 + Math.random() * .55).toFixed(2));
    particle.style.setProperty("--drift", -45 + Math.random() * 90 + "px");
    particle.style.animationDelay = -Math.random() * 20 + "s";
    container.appendChild(particle);
  }
}

function addRipple(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2 + "px";
  ripple.style.top = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2 + "px";
  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

async function openEnvelope() {
  if (transitionLocked || dom.envelope.classList.contains("is-open")) return;
  transitionLocked = true;
  dom.openSurprise.disabled = true;
  dom.envelope.classList.add("is-open");
  announce("Sürpriz açılır.");
  await wait(prefersReducedMotion ? 80 : 1750);
  transitionLocked = false;
  await showScene("message", { announcement: "Şəxsi mesaj açıldı." });
}

async function openVideo() {
  if (transitionLocked) return;
  dom.videoError.hidden = true;
  dom.birthdayVideo.hidden = false;
  await showScene("videoScene", { announcement: "Video açıldı." });
  try {
    await dom.birthdayVideo.play();
  } catch (error) {
    console.info("Brauzer videonun avtomatik başlamasına icazə vermədi. İstifadəçi play düyməsinə basa bilər.", error);
  }
}

async function finishVideo() {
  dom.videoFrame.classList.add("is-fading");
  await wait(prefersReducedMotion ? 25 : 750);
  await showScene("final", { delay: prefersReducedMotion ? 20 : 350, announcement: "Final ad günü mesajı açıldı." });
}

function handleVideoError(event) {
  console.error("Ad günü videosu yüklənmədi. Fayl yolunu və adını yoxlayın:", CONFIG.videoPath, event);
  dom.birthdayVideo.hidden = true;
  dom.videoError.hidden = false;
  announce("Video hazırda əlçatan deyil.");
}

function startCelebration() {
  dom.celebration.replaceChildren();
  if (prefersReducedMotion) return;
  const amount = window.innerWidth < 600 ? 26 : 42;
  const colors = ["#d8b875", "#f3e2bc", "#b96c7e", "#8e9ab9"];

  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    const random = Math.random();
    const type = random > .84 ? "heart" : random > .66 ? "sparkle" : "confetti";
    piece.className = "celebration-piece " + type;
    if (type === "heart") piece.textContent = "♥";
    if (type === "sparkle") piece.textContent = "✦";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.setProperty("--piece-color", colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty("--piece-size", 8 + Math.random() * 8 + "px");
    piece.style.setProperty("--fall-duration", 5 + Math.random() * 4 + "s");
    piece.style.setProperty("--fall-delay", Math.random() * 3.2 + "s");
    piece.style.setProperty("--fall-drift", -70 + Math.random() * 140 + "px");
    piece.style.setProperty("--fall-rotate", -220 + Math.random() * 440 + "deg");
    dom.celebration.appendChild(piece);
  }
  window.setTimeout(() => dom.celebration.replaceChildren(), 12500);
}

function toggleHiddenMessage() {
  const willOpen = dom.hiddenMessage.hidden;
  dom.hiddenMessage.hidden = !willOpen;
  dom.hiddenMessageButton.setAttribute("aria-expanded", String(willOpen));
  dom.hiddenMessageButton.textContent = willOpen ? "Bu da sənə..." : "Bir şey də var...";
  if (willOpen) {
    dom.hiddenMessage.classList.add("is-visible");
    dom.hiddenMessage.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
  } else {
    dom.hiddenMessage.classList.remove("is-visible");
  }
}

async function replay() {
  dom.birthdayVideo.pause();
  dom.birthdayVideo.currentTime = 0;
  dom.videoFrame.classList.remove("is-fading");
  dom.envelope.classList.remove("is-open");
  dom.openSurprise.disabled = false;
  dom.message.classList.remove("sequence-start");
  dom.final.classList.remove("sequence-start");
  dom.hiddenMessage.hidden = true;
  dom.hiddenMessage.classList.remove("is-visible");
  dom.hiddenMessageButton.setAttribute("aria-expanded", "false");
  dom.hiddenMessageButton.textContent = "Bir şey də var...";
  await showScene("intro", { announcement: "Sürpriz yenidən başladı." });
}

function bindEvents() {
  dom.openSurprise.addEventListener("click", openEnvelope);
  dom.watchVideo.addEventListener("click", openVideo);
  dom.birthdayVideo.addEventListener("ended", finishVideo);
  dom.birthdayVideo.addEventListener("error", handleVideoError);
  dom.skipToFinal.addEventListener("click", finishVideo);
  dom.hiddenMessageButton.addEventListener("click", toggleHiddenMessage);
  dom.replayExperience.addEventListener("click", replay);
  document.querySelectorAll(".button").forEach(button => button.addEventListener("pointerdown", addRipple));
  window.addEventListener("resize", setViewportHeight, { passive: true });
}

async function init() {
  setViewportHeight();
  applyConfig();
  createAmbientParticles();
  bindEvents();
  await wait(prefersReducedMotion ? 300 : 1450);
  await showScene("intro", { delay: prefersReducedMotion ? 20 : 450, announcement: "Sürpriz hazırdır." });
}

document.addEventListener("DOMContentLoaded", init, { once: true });
