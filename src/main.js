import "./style.css";
import { results } from "./results.js";

const imagePath = (item) =>
  `${import.meta.env.BASE_URL}certificates/${item.id}.webp`;
const dialog = document.querySelector("#certificate-dialog");
let previousFocus;
function openCertificate(item) {
  previousFocus = document.activeElement;
  document.querySelector("#dialog-title").textContent =
    `${item.university} · ${item.department}`;
  const image = document.querySelector("#dialog-image");
  image.src = imagePath(item);
  image.alt = `${item.university} 2026학년도 합격증, 개인정보 가림`;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}
function certificateCard(item, duplicate = false) {
  const button = document.createElement("button");
  button.className = "certificate-card";
  button.style.setProperty("--university", item.accent);
  button.setAttribute(
    "aria-label",
    `${item.university} ${item.department} 합격증 보기`,
  );
  button.innerHTML = `<div class="certificate-meta"><span>2026 합격</span><span>↗</span></div><div class="certificate-paper"><img src="${imagePath(item)}" alt="${item.university} 개인정보 가림 합격증" loading="lazy" width="260" height="310" /></div><h3>${item.university}</h3><p>${item.department}</p>`;
  button.addEventListener("click", () => openCertificate(item));
  if (duplicate) {
    button.tabIndex = -1;
    button.setAttribute("aria-hidden", "true");
  }
  return button;
}
const track = document.querySelector("#certificate-track");
for (let copy = 0; copy < 2; copy++) {
  const group = document.createElement("div");
  group.className = "marquee-group";
  if (copy) group.setAttribute("aria-hidden", "true");
  results.forEach((item) => group.append(certificateCard(item, Boolean(copy))));
  track.append(group);
}
const hero = document.querySelector("#hero-certificates");
[results[1], results[0], results[2]].forEach((item) =>
  hero.append(certificateCard(item)),
);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reducedMotion.matches;
const motionButton = document.querySelector("#motion-toggle");
function updateMotion() {
  track.classList.toggle("paused", paused);
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.disabled = reducedMotion.matches;
  motionButton.innerHTML = reducedMotion.matches
    ? "✓ <span>움직임 최소화 적용</span>"
    : paused
      ? "▶ <span>자동 재생 시작</span>"
      : "Ⅱ <span>자동 재생 멈춤</span>";
}
motionButton.addEventListener("click", () => {
  paused = !paused;
  updateMotion();
});
reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  updateMotion();
});
updateMotion();
document
  .querySelector("#close-dialog")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  previousFocus?.focus();
});
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
}
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  navigation.classList.toggle("open", !expanded);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.querySelector("#year").textContent = new Date().getFullYear();
