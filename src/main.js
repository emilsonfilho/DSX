import "./styles/main.css";
import { SegmentTreeApp } from "./app/SegmentTreeApp.js";
import { el } from "./ui/dom.js";
import { AppTabs } from "./ui/components/AppTabs.js";
import {DequeApp} from "./app/DequeApp.js";

const root = document.querySelector("#app");

function renderTabs() {
    const appContainer = el("div", { class: "app-container" });

    const appsConfig = [
        {
            key: 'tree',
            label: 'Árvore de Segmentos',
            initFn: (container) => new SegmentTreeApp(container)
        },
        {
            key: 'deque',
            label: 'Deque Monotônica',
            initFn: (container) => new DequeApp(container)
        }
    ]

    const tabManager = AppTabs(appsConfig, appContainer);
    
    root.replaceChildren(tabManager.root, appContainer);

    tabManager.selectApp('tree');
}

renderTabs();