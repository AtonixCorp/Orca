/**
 * ============================================================================
 * File: webapp/src/types/desktop.d.ts
 * Purpose:
 *   Renderer-side desktop runtime contract exposed by the Electron preload.
 * ============================================================================
 */

declare global {
  interface Window {
    orcaDesktop?: {
      isDesktop: boolean;
      platform: string;
    };
  }
}

export {};