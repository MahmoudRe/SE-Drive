const path = require('path');
const { connectFabricNetwork, disconnectFabricNetwork } = require("./chaincode-api");
const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
      'http://localhost:3000' // [DEV]
      // `file://${path.join(__dirname, '../build/index.html')}`
  );
  
  // [DEV]
  win.webContents.openDevTools({ mode: 'detach' });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('submit-transaction', async (event, args) => {
  const contract = await connectFabricNetwork();
  const result = await contract.submitTransaction(...args);
  disconnectFabricNetwork();
  return result;
})

ipcMain.handle('evaluate-transaction', async (event, args) => {
  const contract = await connectFabricNetwork();
  const result = await contract.evaluateTransaction(...args);
  disconnectFabricNetwork();
  return result;
})