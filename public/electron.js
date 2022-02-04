const path = require('path');
const Chaincode = require("./chaincode");
const fs = require('fs');
const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 975,
    height: 675,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    // titleBarStyle: 'hidden',
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
app.whenReady().then(() => {
  if (fs.existsSync('Wallet/AdminIdentity.id') && fs.existsSync('connection.json'))
    Chaincode.connect();
      
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    Chaincode.disconnect();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (fs.existsSync('Wallet/AdminIdentity.id') && fs.existsSync('connection.json')) 
      Chaincode.connect();

    createWindow();
  }
});

ipcMain.handle('submit-transaction', async (event, args) => {
  return Chaincode.contract.submitTransaction(...args);
})

ipcMain.handle('evaluate-transaction', async (event, args) => {
  return Chaincode.contract.evaluateTransaction(...args);
})

ipcMain.handle('connect', async (event, data) => {
  fs.writeFileSync('connection.json', data);
  return Chaincode.connect();
})

ipcMain.handle('add-peer', async (event, [peerId]) => {
  fs.writeFileSync('Wallet/AdminIdentity.id', peerId);
  return true;
})

ipcMain.handle('logout', async (event, args) => {
  fs.unlinkSync('Wallet/AdminIdentity.id');
  fs.unlinkSync('connection.json');
  return true;
})
