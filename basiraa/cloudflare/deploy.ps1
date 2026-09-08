# Basira - Cloudflare Deploy Script (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DistDir = Join-Path $ScriptDir "dist"

Write-Host "1. Building distribution bundle..." -ForegroundColor Yellow
& (Join-Path $ScriptDir "build.ps1")

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed, aborting deployment." -ForegroundColor Red
    exit 1
}

Write-Host "2. Deploying to Cloudflare Pages via Wrangler..." -ForegroundColor Cyan
Set-Location $ProjectRoot
npx wrangler pages deploy "$DistDir" --project-name="basira-ocr" --commit-dirty=true

Write-Host "Deployment completed!" -ForegroundColor Green
