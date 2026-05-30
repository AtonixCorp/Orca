/* ============================================================================
   File: webapp/electron/main.cjs
   Purpose: Electron main process for the ORCA desktop operator shell.
   ============================================================================ */

const path = require("node:path");
const { app, BrowserWindow, shell } = require("electron");

const devServerUrl = process.env.ELECTRON_RENDERER_URL;

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1680,
    height: 1040,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: "#07111b",
    autoHideMenuBar: true,
    title: "ORCA Operator",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return mainWindow;
  }

  mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  return mainWindow;
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});