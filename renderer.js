const { ipcRenderer } = require("electron");
const { createApp, ref, onMounted } = Vue;

const app = createApp({
    setup() {
        const port = ref("5500");
        const webviewRef = ref(null);
        const isPinned = ref(false);

        // Navigation
        const navigateToPort = () => {
            const url = `http://localhost:${port.value}`;
            localStorage.setItem("savedPort", port.value);
            if (webviewRef.value) {
                webviewRef.value.loadURL(url);
            }
        };

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
        onMounted(() => {
            // Load saved port
            const savedPort = localStorage.getItem("savedPort");
            if (savedPort) {
                port.value = savedPort;
                navigateToPort(); 
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