# ⛅ Cloudflare Pages Deployment Package — Basira

This directory contains the production-ready configuration, SPA routing manifests, WebAssembly security headers (COOP/COEP), and automated build scripts to deploy **Basira (Original-Image Visual Reading Assistant)** to **Cloudflare Pages**.

> **Live Production URL:** [https://basira-3jl.pages.dev/](https://basira-3jl.pages.dev/)  
> **Lead Architect:** **Mohamed Hsini** ([https://hsini.dev](https://hsini.dev) | [contact@hsini.dev](mailto:contact@hsini.dev))

---

## 📁 Directory Structure

```
cloudflare/
├── wrangler.toml              # Cloudflare Pages / Workers configuration
├── _headers                   # Security headers (COOP, COEP for WebAssembly OCR)
├── _routes.json               # SPA routing rule definitions (excludes static assets)
├── build.ps1 / build.sh       # Automated build & dist assembly scripts
├── deploy.ps1 / deploy.sh     # One-click Wrangler deployment scripts
├── functions/                 # Cloudflare Pages Functions (V8 Edge API)
│   └── api/
│       └── health.js          # Edge GET /api/health
└── dist/                      # Compiled production distribution directory
```

---

## 🚀 One-Click CLI Deployment (Wrangler)

### Windows (PowerShell):
```powershell
# 1. Log in to Cloudflare (one-time)
npx wrangler login

# 2. Run automated build and deploy
.\cloudflare\deploy.ps1
```

### Linux / macOS (Bash):
```bash
# 1. Log in to Cloudflare (one-time)
npx wrangler login

# 2. Run automated build and deploy
chmod +x cloudflare/deploy.sh
./cloudflare/deploy.sh
```
