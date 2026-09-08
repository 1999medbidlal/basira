# Basira - Cloudflare Pages Build Script (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Basira - Building Cloudflare Pages Distribution Bundle   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DistDir = Join-Path $ScriptDir "dist"

Write-Host "1. Compiling Vite Frontend Bundle..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Vite build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "2. Assembling Cloudflare Distribution in: $DistDir..." -ForegroundColor Yellow
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
}
New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

Copy-Item -Recurse -Force (Join-Path $ProjectRoot "dist\*") $DistDir
Copy-Item -Force (Join-Path $ScriptDir "_headers") $DistDir

Write-Host "SUCCESS: Cloudflare Pages distribution bundle is ready!" -ForegroundColor Green
Write-Host "Target Directory: $DistDir" -ForegroundColor Green
