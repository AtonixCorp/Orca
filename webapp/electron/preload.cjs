/* ============================================================================
   File: webapp/electron/preload.cjs
   Purpose: Expose a minimal desktop runtime contract to the renderer.
   ============================================================================ */

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("orcaDesktop", {
  isDesktop: true,
  platform: process.platform,
});