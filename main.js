const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const w = new BrowserWindow({ width: 1366, height: 820, backgroundColor: '#12161c', title: 'Lime Network Simulator', icon: path.join(__dirname, 'icon.ico') });
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  w.loadFile('index.html');
});
app.on('window-all-closed', () => app.quit());
