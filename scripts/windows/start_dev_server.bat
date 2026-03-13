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
echo Running "%DEV_COMMAND%"...

if /I "%MM_DRY_RUN%"=="1" (
    echo DRY RUN: would start dev server in a new window from "%PROJECT_ROOT%"
    echo DRY RUN: would wait 5 seconds and open %DEV_URL%
    exit /b 0
)

start "Mehmet Metrics Dev Server" cmd /k "cd /d ""%PROJECT_ROOT%"" && %DEV_COMMAND%"
echo.
echo Waiting for dev server to start...
timeout /t 5 /nobreak >nul
echo.
echo Opening browser...
start "" "%DEV_URL%"
echo.
echo Dev server window will stay open - close it when you are done.

exit /b 0
