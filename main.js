// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app, BrowserWindow } = require('electron');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    icon: path.join(__dirname, 'assets/logo.png') // Add the path to your icon here
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'out/index.html')}`;
  
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
