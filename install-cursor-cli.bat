@echo off
chcp 65001 >nul
echo Installing Cursor Agent CLI...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-cursor-cli.ps1"
echo.
pause
