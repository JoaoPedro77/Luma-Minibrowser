const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
let win;

app.on("ready", () => {
    win = new BrowserWindow({
        icon: "src/icon.ico",
        width: 390,
        minWidth:350,
        minHeight:400,
        height: 430,
        frame: false,
        alwaysOnTop: true, 
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true
        }
    });

    win.loadFile("index.html");
});


// fechar app
ipcMain.on("close-app", () => {
    win.close();
});

// maximizar/restaurar
ipcMain.on("toggle-maximize", () => {
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

// alternar always on top
ipcMain.on("toggle-always-on-top", () => {
    const state = !win.isAlwaysOnTop();
    win.setAlwaysOnTop(state);
    win.webContents.send("always-on-top-changed", state);
});
