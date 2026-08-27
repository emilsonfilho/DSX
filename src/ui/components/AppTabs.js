import { el } from "../dom";

/**
 * Creates a tab navigation component for switching between applications.
 *
 * Each application is represented by a button in the tab list. When an
 * application is selected, the previously rendered content is removed from
 * the container and the application's initialization function is executed.
 *
 * @param {Array<Object>} appsConfig
 * Configuration for the applications available in the tabs.
 *
 * @param {string} appsConfig[].key
 * Unique identifier used to select the application.
 *
 * @param {string} appsConfig[].label
 * Text displayed on the application's tab button.
 *
 * @param {Function} [appsConfig[].initFn]
 * Function called when the application is selected. Receives the
 * application container as its only argument.
 *
 * @param {HTMLElement} appContainer
 * Container where the selected application's content will be rendered.
 *
 * @returns {{
 *   root: HTMLElement,
 *   selectApp: (key: string) => void
 * }}
 * An object containing the root element of the tab component and a function
 * for programmatically selecting an application.
 *
 * @example
 * const appsConfig = [
 *     {
 *         key: "dashboard",
 *         label: "Dashboard",
 *         initFn: initDashboard
 *     },
 *     {
 *         key: "settings",
 *         label: "Settings",
 *         initFn: initSettings
 *     }
 * ];
 *
 * const container = document.querySelector("#app");
 *
 * const { root, selectApp } = AppTabs(appsConfig, container);
 *
 * document.body.appendChild(root);
 *
 * // Select an application programmatically
 * selectApp("settings");
 */
export function AppTabs(appsConfig, appContainer) {
    const buttons = new Map();
    let currentAppKey = null;

    const toggleContainer = el("div", { class: "tabs-toggle", role: "tablist" });

    for (const app of appsConfig) {
        const button = el("button", {
            class: "btn",
            role: "tab",
            "aria-selected": "false",
            onclick: () => selectApp(app.key)
        }, app.label);

        buttons.set(app.key, { button, initFn: app.initFn });
        toggleContainer.appendChild(button);
    }

    const root = el("header", { class: "tabs-header" }, toggleContainer);

    function selectApp(key) {
        if (key === currentAppKey) return;
        currentAppKey = key;

        // Update buttons
        for (const [appKey, { button }] of buttons) {
            const isActive = appKey === currentAppKey;
            button.className = isActive ? "btn btn--primary" : "btn";
            button.setAttribute("aria-selected", String(isActive));
        }

        appContainer.innerHTML = "";
        const selectedApp = buttons.get(key);
        if (selectedApp && typeof selectedApp.initFn === 'function')
            selectedApp.initFn(appContainer);
    }

    return { root, selectApp };
}