# Установка Cursor Agent CLI (Windows)
# Запустите вручную: правый клик -> "Выполнить с PowerShell"
# или в PowerShell: .\install-cursor-cli.ps1

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host "Downloading Cursor CLI installer..." -ForegroundColor Cyan
$scriptContent = (Invoke-WebRequest -Uri 'https://cursor.com/install?win32=true' -UseBasicParsing).Content

Write-Host "Running installer..." -ForegroundColor Cyan
Invoke-Expression $scriptContent

Write-Host "`nDone. Check with: agent --version" -ForegroundColor Green
