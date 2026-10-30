/**
 * Free GST Billing Software — Electron Main Process
 *
 * Provides a native desktop application container for macOS (.dmg) and Windows (.exe)
 * while wrapping the Express 5 local offline backend securely.
 */

const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const DEFAULT_PORT = 47371;
let currentPort = DEFAULT_PORT;

// Ensure single instance lock so users don't launch multiple conflicting servers
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function startBackendServer() {
  return new Promise((resolve, reject) => {
    const userDataPath = app.getPath('userData');
    try {
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
    } catch (e) {
      console.warn('[UserData Directory Warning]', e.message);
    }

    const serverPath = path.join(__dirname, '..', 'server.js');
    serverProcess = fork(serverPath, [], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        ELECTRON_RUN_AS_NODE: '1',
        APP_DATA_DIR: userDataPath
      },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      windowsHide: true
    });

    let resolved = false;
    let serverErrorOutput = '';

    serverProcess.stdout?.on('data', (data) => {
      const msg = data.toString();
      const match = msg.match(/http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/i);
      if (match && !resolved) {
        resolved = true;
        currentPort = parseInt(match[1], 10);
        resolve(currentPort);
      }
    });

    serverProcess.stderr?.on('data', (err) => {
      const msg = err.toString();
      serverErrorOutput += msg;
      console.error('[Server Error]', msg);
    });

    serverProcess.on('exit', (code) => {
      console.log(`[Server Process exited with code ${code}]`);
      if (!resolved) {
        resolved = true;
        if (code !== 0) {
          reject(new Error(`Server process terminated unexpectedly (code ${code}):\n${serverErrorOutput || 'Unknown error'}`));
        } else {
          resolve(currentPort);
        }
      }
    });

    // Fallback timer: check health endpoint if stdout didn't report port
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(currentPort);
      }
    }, 4000);
  });
}

function waitForServer(port, retries = 30) {
  return new Promise((resolve, reject) => {
    const check = (remaining) => {
      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        if (res.statusCode === 200) resolve();
        else if (remaining > 0) setTimeout(() => check(remaining - 1), 300);
        else reject(new Error('Server failed to respond to health checks in time'));
      });
      req.on('error', () => {
        if (remaining > 0) setTimeout(() => check(remaining - 1), 300);
        else reject(new Error('Server failed to start in time'));
      });
      req.end();
    };
    check(retries);
  });
}

async function createWindow(port) {
  const iconPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'Free GST Billing Software',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    }
  });

  // Open external links in user's default browser, not in Electron webview
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || (url.startsWith('http:') && !url.includes(`127.0.0.1:${port}`) && !url.includes(`localhost:${port}`))) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[WebContents Load Failed]', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] [${level}] ${message}`);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    const port = await startBackendServer();
    await waitForServer(port);
    await createWindow(port);
  } catch (err) {
    console.error('Failed to initialize desktop app:', err);
    dialog.showErrorBox(
      'Free GST Billing Software — Startup Error',
      `Failed to launch the local backend server:\n\n${err.message || err}\n\nPlease check permissions and try again.`
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(currentPort);
    }
  });
});

app.on('before-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill('SIGTERM');
    } catch { /* ignore */ }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
