@echo off
setlocal EnableExtensions

set "PROJECT_ROOT=%~1"
set "DEV_URL=%~2"
set "DEV_COMMAND=%~3"

if not defined PROJECT_ROOT (
    echo ERROR: PROJECT_ROOT is required
    exit /b 1
)

if not defined DEV_URL set "DEV_URL=http://localhost:3000"
if not defined DEV_COMMAND set "DEV_COMMAND=npm run dev"

echo.
echo Checking the dev server and waiting for a successful response...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_dev_server.ps1" -ProjectRoot "%PROJECT_ROOT%" -DevUrl "%DEV_URL%" -DevCommand "%DEV_COMMAND%"
exit /b %ERRORLEVEL%
