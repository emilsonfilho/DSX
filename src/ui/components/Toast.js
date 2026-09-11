import { el } from "../dom.js";

const DURATIONS = {
    info: 4000,
    success: 4000,
    result: 4000,
    error: 6000,
};

const MAX_TOASTS = 3;

let container = null;

// Chave -> aviso ativo, pra detectar duplicatas ainda visíveis e não empilhar
const toasts = new Map();

function getContainer() {
    if (container) return container;

    container = el("div", { class: "toast-container" });
    document.body.appendChild(container);

    return container;
}

function clearEntryTimer(entry) {
    if (entry.timer) {
        clearTimeout(entry.timer);
        entry.timer = null;
    }
}

// (Re)inicia a contagem regressiva do aviso a partir de uma duração cheia
function armTimer(entry, duration) {
    clearEntryTimer(entry);
    entry.remaining = duration;
    entry.startedAt = Date.now();
    entry.timer = setTimeout(() => dismiss(entry), duration);
}

// Pausa e guarda quanto tempo ainda faltava, sem reiniciar do zero
function pauseTimer(entry) {
    if (!entry.timer) return;

    entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
    clearEntryTimer(entry);
}

function resumeTimer(entry) {
    if (entry.timer) return;

    armTimer(entry, entry.remaining || 300);
}

function dismiss(entry) {
    if (!toasts.has(entry.key)) return;

    toasts.delete(entry.key);
    clearEntryTimer(entry);

    entry.root.classList.add("toast--leaving");
    entry.root.addEventListener("animationend", () => entry.root.remove(), { once: true });

    // Se a animação não disparar (prefers-reduced-motion, aba em segundo plano),
    // garante a remoção de qualquer forma.
    setTimeout(() => entry.root.remove(), 400);
}

/**
 * Mostra um aviso flutuante no canto inferior direito da tela.
 *
 * @param {string} text
 * @param {"info"|"success"|"error"|"result"} kind
 */
export function showToast(text, kind = "info") {
    if (!text) return;

    const duration = DURATIONS[kind] ?? DURATIONS.info;
    const key = `${kind}::${text}`;

    const existing = toasts.get(key);
    if (existing) {
        armTimer(existing, duration);
        return;
    }

    const root = getContainer();

    while (toasts.size >= MAX_TOASTS) {
        const [oldestKey] = toasts.keys();
        dismiss(toasts.get(oldestKey));
    }

    let entry;

    const toastEl = el(
        "div",
        {
            class: `toast toast--${kind}`,
            role: kind === "error" ? "alert" : "status",
            "aria-live": kind === "error" ? null : "polite",
            onmouseenter: () => pauseTimer(entry),
            onmouseleave: () => resumeTimer(entry),
        },
        el("p", { class: "toast__text" }, text),
        el(
            "button",
            {
                class: "toast__close",
                type: "button",
                "aria-label": "Fechar aviso",
                onclick: () => dismiss(entry),
            },
            "×"
        )
    );

    entry = { key, root: toastEl, timer: null, remaining: duration, startedAt: Date.now() };

    toasts.set(key, entry);
    root.appendChild(toastEl);

    armTimer(entry, duration);
}
