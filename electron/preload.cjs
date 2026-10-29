/**
 * Free GST Billing Software — Electron Preload Script
 * Exposes secure system metadata without nodeIntegration.
 */

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  arch: process.arch,
  version: process.versions.electron,
});
