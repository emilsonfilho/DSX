import { el } from "../dom.js";

// Controles da "fita" gravada pelo core
export function Playback({ onPrev, onToggle, onNext, onScrub, onSpeed }) {
    const prevButton = el("button", { class: "btn btn--icon", type: "button", title: "Passo anterior", onclick: onPrev }, "◀");
    const toggleButton = el("button", { class: "btn btn--icon btn--primary", type: "button", title: "Reproduzir", onclick: onToggle }, "▶");
    const nextButton = el("button", { class: "btn btn--icon", type: "button", title: "Próximo passo", onclick: onNext }, "▶|");

    const scrubber = el("input", {
        class: "playback__scrubber",
        type: "range",
        min: "0",
        max: "0",
        value: "0",
        "aria-label": "Passo da animação",
        oninput: (event) => onScrub(Number(event.target.value)),
    });

    const speed = el("select", {
        class: "playback__speed",
        "aria-label": "Velocidade da animação",
        onchange: (event) => onSpeed(Number(event.target.value)),
    },
        el("option", { value: "1200" }, "0,5x"),
        el("option", { value: "600", selected: "" }, "1x"),
        el("option", { value: "300" }, "2x"),
        el("option", { value: "120" }, "5x")
    );

    const counter = el("span", { class: "playback__counter" }, "0 / 0");
    const message = el("p", { class: "playback__message" }, "Nenhuma operação executada ainda.");
    const detail = el("p", { class: "playback__detail", hidden: true });

    const root = el(
        "div",
        { class: "playback" },
        el("span", { class: "playback__label" }, "Passo a passo da execução"),
        message,
        detail,
        el(
            "div",
            { class: "playback__controls" },
            prevButton,
            toggleButton,
            nextButton,
            scrubber,
            counter,
            speed
        )
    );

    return {
        root,
        update(frame, index, total) {
            message.innerHTML = frame.message;
            detail.innerHTML = frame.detail ?? "";
            detail.hidden = !frame.detail;
            counter.textContent = `${index + 1} / ${total}`;
            scrubber.max = String(Math.max(total - 1, 0));
            scrubber.value = String(index);
            prevButton.disabled = index === 0;
            nextButton.disabled = index === total - 1;
        },
        setPlaying(isPlaying) {
            toggleButton.textContent = isPlaying ? "❚❚" : "▶";
            toggleButton.title = isPlaying ? "Pausar" : "Reproduzir";
        },
        reset() {
            message.innerHTML = "Nenhuma operação executada ainda.";
            detail.innerHTML = "";
            detail.hidden = true;
            counter.textContent = "0 / 0";
            scrubber.max = "0";
            scrubber.value = "0";
        },
    };
}