const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
let autoUpdater = null;
try { autoUpdater = require('electron-updater').autoUpdater; } catch (e) {}

function setupUpdates(win) {
  // Portable sürüm kendini güncelleyemez; yalnızca kurulumlu (Setup) sürüm güncellenir.
  if (!autoUpdater || !app.isPackaged || process.env.PORTABLE_EXECUTABLE_FILE) return;
  const tr = app.getLocale().startsWith('tr');
  autoUpdater.autoDownload = true;
  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox(win, {
      type: 'info',
      buttons: tr ? ['Yeniden başlat', 'Sonra'] : ['Restart', 'Later'],
      defaultId: 0,
      title: tr ? 'Güncelleme' : 'Update',
      message: tr ? `Lime Network Simulator ${info.version} indirildi.` : `Lime Network Simulator ${info.version} has been downloaded.`,
      detail: tr ? 'Şimdi yeniden başlatıp kurmak ister misiniz?' : 'Restart now to install the update?'
    }).then((r) => { if (r.response === 0) autoUpdater.quitAndInstall(); });
  });
  autoUpdater.on('error', () => {});
  autoUpdater.checkForUpdates().catch(() => {});
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const w = new BrowserWindow({ width: 1366, height: 820, backgroundColor: '#12161c', title: 'Lime Network Simulator', icon: path.join(__dirname, 'icon.ico') });
  w.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  w.loadFile('index.html');
  setupUpdates(w);
});
app.on('window-all-closed', () => app.quit());
