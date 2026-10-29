/**
 * Free GST Billing Software — Electron Main Process
 *
 * Provides a native desktop application container for macOS (.dmg) and Windows (.exe)
 * while wrapping the Express 5 local offline backend securely.
 */

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
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
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, '..', 'server.js');
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1' },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    let resolved = false;

    serverProcess.stdout?.on('data', (data) => {
      const msg = data.toString();
      const match = msg.match(/http:\/\/localhost:(\d+)/i);
      if (match && !resolved) {
        resolved = true;
        currentPort = parseInt(match[1], 10);
        resolve(currentPort);
      }
    });

    serverProcess.stderr?.on('data', (err) => {
      console.error('[Server Error]', err.toString());
    });

    serverProcess.on('exit', (code) => {
      console.log(`[Server Process exited with code ${code}]`);
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
        else reject(new Error('Server failed to start in time'));
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
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'Free GST Billing Software',
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
    if (url.startsWith('https:') || url.startsWith('http:') && !url.includes(`127.0.0.1:${port}`) && !url.includes(`localhost:${port}`)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
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
    // Try launching window anyway
    createWindow(currentPort);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(currentPort);
    }
  });
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
