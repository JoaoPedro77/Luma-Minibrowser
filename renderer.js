const { ipcRenderer } = require("electron");
const webview = document.getElementById("viewer");
const pinBtn = document.getElementById("pin");


//controlar webview
document.getElementById("back").onclick = () => webview.goBack();
document.getElementById("forward").onclick = () => webview.goForward();
document.getElementById("reload").onclick = () => webview.reload();

document.getElementById("go").onclick = () => {
    const port = document.getElementById("port").value;
    webview.loadURL(`http://localhost:${port}`);
};



//controles de janela
document.getElementById("close").onclick = () => {
    ipcRenderer.send("close-app");
};
document.getElementById("maximize").onclick = () => {
    ipcRenderer.send("toggle-maximize");
};
pinBtn.onclick = () => {
    ipcRenderer.send("toggle-always-on-top");
};
ipcRenderer.on("always-on-top-changed", (_, state) => {
    if (state) {
        pinBtn.classList.add("active");
    } else {
        pinBtn.classList.remove("active");
    }
});


// para alterar scrolls
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