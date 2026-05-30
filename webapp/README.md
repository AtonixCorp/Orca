<!--
================================================================================
 File: webapp/README.md
 Purpose: Dev quickstart for the Orca React docs and downloads site.
================================================================================
-->

# Orca Webapp (React + Vite)

The local-first documentation and downloads site for ORCA.

## Container Image

- Build file: `webapp/Dockerfile`
- What the image does: builds the React docs site with Vite and serves the production bundle from nginx on port `80`.
- What ships in the runtime image: compiled static assets, nginx config, and a copy of this README at `/usr/share/nginx/html/README.md`.

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
```

Desktop shell during development:

```bash
npm run desktop:dev
```

Desktop artifacts on CI runners:

```bash
GitHub Actions -> Desktop Packaging -> Run workflow
```

Desktop branding assets:

- Source mark: `public/assets/logo/orca-catfish-favicon.svg`
- Generated Windows icon: `electron/assets/icon.ico`
- Generated macOS icon: `electron/assets/icon.icns`
- Installer banner assets: `electron/assets/installer-sidebar.bmp` and `electron/assets/installer-header.bmp`
- DMG background: `electron/assets/dmg-background.png`

The dev server proxies `/api` to `http://localhost:8000`, so start the
backend API with `uvicorn app.main:app --reload` from [`../orcaapi/`](../orcaapi/)
in another shell, or use `docker compose up` from the repo root.

## GitHub Pages Deployment

The production deployment target for this site is GitHub Pages:

- Repository URL: `https://github.com/AtonixCorp/Orca`
- Pages URL: `https://atonixcorp.github.io/Orca/`
- Workflow: `.github/workflows/deploy-github-pages.yml`

Deployment behavior:

- Pushes to `main` run the Pages workflow automatically.
- The workflow builds the Vite app with `GITHUB_PAGES=true`, so the correct
  base path is generated for the repository slug.
- The workflow copies `index.html` to `404.html` so deep links continue to work
  on GitHub Pages.

Repository setting required once:

- In GitHub, open **Settings > Pages** and set **Source** to **GitHub Actions**.

Local validation command:

```bash
GITHUB_PAGES=true GITHUB_REPOSITORY=AtonixCorp/Orca npm run build
```

## Project Layout

```
webapp/
├── index.html                 # Vite entry HTML
├── vite.config.ts             # Vite + Vitest config
├── tsconfig.json              # Strict TypeScript options
├── package.json
└── src/
    ├── main.tsx               # React + providers entrypoint
    ├── App.tsx                # Shell + routes
    ├── pages/                 # One file per route
    ├── pages/                 # Documentation and download routes
    ├── styles/global.css      # Minimal design system
    └── test/setup.ts          # Vitest setup
```

## Conventions

- **Every file** opens with a documentation header (see existing files).
- The webapp is now static-content oriented; avoid reintroducing dashboard-only
  API clients or browser authentication flows.
- TypeScript is strict; do not silence errors with `any`.

## Scripts

| Command          | Purpose                                  |
|------------------|------------------------------------------|
| `npm run dev`    | Vite dev server with HMR                 |
| `npm run build`  | Type-check + production build to `dist/` |
| `npm run preview`| Serve the production build locally       |
| `npm run lint`   | ESLint (zero warnings tolerated)         |
| `npm run test`   | Vitest in CI mode                        |
| `npm run desktop:dev` | Launch Electron against the Vite dev server |
| `npm run desktop:dist:win` | Build the desktop shell and package a Windows installer |
| `npm run desktop:dist:mac` | Build the desktop shell and package a macOS DMG |

## Desktop Packaging

The webapp now includes an Electron wrapper for the operator control center.

- Route: `/operator`
- Dev shell: `npm run desktop:dev`
- Packaging targets: Windows `nsis` installer (`.exe`) and macOS `dmg`
- CI packaging workflow: `.github/workflows/desktop-packaging.yml`
- Release publishing: tagged desktop builds automatically attach `.exe` and `.dmg` assets to GitHub Releases

Platform note:

- Building a signed macOS `.dmg` requires running the packaging step on macOS.
- Building a Windows installer from Linux may require additional host tooling such as Wine.
- This repository now provides GitHub-hosted Windows and macOS runners for packaging those installers.

Signing and notarization environment hooks:

- `MACOS_CERTIFICATE_P12`: base64-encoded Developer ID Application certificate
- `MACOS_CERTIFICATE_PASSWORD`: password for the macOS signing certificate
- `MAC_CODESIGN_IDENTITY`: Developer ID Application identity string used by codesign
- `APPLE_ID`: Apple ID email for notarization
- `APPLE_APP_SPECIFIC_PASSWORD`: app-specific password for notarization
- `APPLE_TEAM_ID`: Apple developer team identifier
- `WINDOWS_CERTIFICATE_P12`: base64-encoded Authenticode certificate bundle
- `WINDOWS_CERTIFICATE_PASSWORD`: password for the Windows signing certificate

Provide those values to the GitHub Actions job environment or to a self-hosted runner environment before packaging if you want signed installers and notarized macOS builds.

Release flow:

- Push a tag matching `desktop-v*` to package installers and publish them to a GitHub Release automatically.
- For manual runs, supply `release_tag` in the workflow dispatch form if you want the generated installers attached to an existing or new release.
