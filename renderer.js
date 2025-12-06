const { ipcRenderer } = require("electron");
const { createApp, ref, onMounted, watch, nextTick } = Vue;

const app = createApp({
    setup() {
        const port = ref("5500");
        const webviewRef = ref(null);
        const isPinned = ref(false);
        let debounceTimer = null;

        // Navigation
        const navigateToPort = () => {
            const url = `http://localhost:${port.value}`;
            localStorage.setItem("savedPort", port.value);
            if (webviewRef.value) {
                webviewRef.value.loadURL(url);
            }
        };

        const debouncedNavigate = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (port.value) {
                    navigateToPort();
                }
            }, 500);
        };

        watch(port, () => {
             debouncedNavigate();
        });

        // Webview Controls
        const goBack = () => {
            if (webviewRef.value && webviewRef.value.canGoBack()) {
                webviewRef.value.goBack();
            }
        };
        const goForward = () => {
            if (webviewRef.value && webviewRef.value.canGoForward()) {
                webviewRef.value.goForward();
            }
        };
        const reload = () => {
            if (webviewRef.value) {
                webviewRef.value.reload();
            }
        };

        // Window Controls
        const closeApp = () => ipcRenderer.send("close-app");
        const toggleMaximize = () => ipcRenderer.send("toggle-maximize");
        const toggleAlwaysOnTop = () => ipcRenderer.send("toggle-always-on-top");

        // Lifecycle
        onMounted(async () => {
            await nextTick();

            // Load saved port
            const savedPort = localStorage.getItem("savedPort");
            if (savedPort) {
                // If saved port is different, this will trigger the watcher (debounced)
                // If it's the same as default, watcher won't trigger.
                port.value = savedPort;
            }
            
            // Force an initial load immediately (skipping debounce for startup speed)
            // Using a small timeout to ensure webview is fully attached and ready
            if (port.value) {
                setTimeout(() => {
                    if (webviewRef.value) {
                        navigateToPort();
                    }
                }, 100);
            }

            // IPC Listeners
            ipcRenderer.on("always-on-top-changed", (_, state) => {
                isPinned.value = state;
            });

            // Webview Setup
            const webview = webviewRef.value;
            if (webview) {
                webview.addEventListener("dom-ready", () => {
                    webview.insertCSS(`
                        /* Scrollbar geral */
                        ::-webkit-scrollbar {
                            width: 10px;
                            height: 10px;
                        }
                        /* Trilha invisível (fundo transparente) */
                        ::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        /* Polegar (a barrinha) */
                        ::-webkit-scrollbar-thumb {
                            background: #3b2a5a; /* roxo bem escuro */
                            border-radius: 8px;
                        }
                        /* Hover no polegar (um pouco mais claro) */
                        ::-webkit-scrollbar-thumb:hover {
                            background: #5c3e8b;
                        }
                        /* Canto onde scroll horizontal e vertical se encontram */
                        ::-webkit-scrollbar-corner {
                            background: transparent;
                        }
                    `);
                });
            }
        });

        return {
            port,
            webviewRef,
            isPinned,
            navigateToPort,
            goBack,
            goForward,
            reload,
            closeApp,
            toggleMaximize,
            toggleAlwaysOnTop
        };
    }
});

app.mount("#app");