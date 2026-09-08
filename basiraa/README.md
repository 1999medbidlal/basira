# 👁️ Basira — Original-Image Visual Reading Assistant

[![Live Demo: Cloudflare Pages](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://basira-3jl.pages.dev/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20Vanilla%20JS-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tesseract.js](https://img.shields.io/badge/OCR-Tesseract.js%20WASM-563D7C.svg)](https://tesseract.projectnaptha.com/)

> **Basira** is an assistive reading system that performs optical character recognition (OCR) and text-to-speech synchronization directly over high-resolution original images and documents in the browser using WebAssembly.

🌐 **Live Cloudflare Production URL:** [https://basira-3jl.pages.dev/](https://basira-3jl.pages.dev/)  
🎬 **Lead Architect:** **Mohamed Hsini** ([https://hsini.dev](https://hsini.dev) | [contact@hsini.dev](mailto:contact@hsini.dev))

---

## 🚀 Key Features

1. **Original-Image Dynamic Highlighting:** Preserves original font, layout, and visual fidelity while highlighting spoken words in real time.
2. **Client-Side WebAssembly OCR:** 100% private, zero-upload local OCR using Tesseract.js running across worker threads.
3. **Multi-Speed Speech Synthesis:** Natural pacing, pitch modulation, and sentence-level pause control.
4. **Cloudflare Edge Optimized:** Distributed via 300+ Cloudflare edge locations with custom COOP/COEP headers for low-latency WebAssembly execution.

---

## 🛠️ Local Development & Build

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle
npm run build
```

---

## ⛅ Cloudflare Pages Deployment

```powershell
# Windows PowerShell
.\cloudflare\deploy.ps1
```
```bash
# Linux / macOS
./cloudflare/deploy.sh
```
