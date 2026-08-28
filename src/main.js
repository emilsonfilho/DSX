import "./styles/main.css";
import { SegmentTreeApp } from "./app/SegmentTreeApp.js";
import { el } from "./ui/dom.js";
import { AppTabs } from "./ui/components/AppTabs.js";

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
            initFn: (container) => 
                container.innerHTML = "<p>Deque em desenvolvimento...</p>"
        }
    ]

    const tabManager = AppTabs(appsConfig, appContainer);
    
    root.replaceChildren(tabManager.root, appContainer);

    tabManager.selectApp('tree');
}

renderTabs();