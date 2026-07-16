import { DOUBLE_LAYER_PROMPT, NOTEBOOK_PROMPT } from "./prompts.js";

const prompts = {
  notebook: NOTEBOOK_PROMPT,
  double: DOUBLE_LAYER_PROMPT,
};

for (const [key, text] of Object.entries(prompts)) {
  const output = document.querySelector(`[data-prompt-text="${key}"]`);
  const meta = document.querySelector(`[data-prompt-meta="${key}"]`);
  if (output) output.textContent = text;
  if (meta) meta.textContent = `${text.split("\n").length} 行 · ${text.length} 字符`;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some embedded browsers expose the API but deny clipboard permission.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command was rejected");
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  const originalLabel = button.querySelector("span")?.textContent || "复制全文";
  let resetTimer;

  button.addEventListener("click", async () => {
    const key = button.dataset.copy;
    const text = prompts[key];
    const label = button.querySelector("span");
    if (!text || !label) return;

    window.clearTimeout(resetTimer);
    try {
      await copyText(text);
      button.classList.add("is-copied");
      label.textContent = "已完整复制";
    } catch {
      button.classList.add("is-error");
      label.textContent = "复制失败，请重试";
    }

    resetTimer = window.setTimeout(() => {
      button.classList.remove("is-copied", "is-error");
      label.textContent = originalLabel;
    }, 5000);
  });
});

const stepLinks = document.querySelectorAll(".step-rail li");
const sections = [document.getElementById("step-1"), document.getElementById("step-2")].filter(Boolean);
const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = visible.target.id === "step-2" ? 1 : 0;
    stepLinks.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
  },
  { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.5] },
);

sections.forEach((section) => observer.observe(section));
