@echo off
setlocal
cd /d "%~dp0"

if exist "%~dp0.tools\node\npm.cmd" set "PATH=%~dp0.tools\node;%PATH%"

call npm run publish:data
if errorlevel 1 (
  echo.
  echo Publication was not confirmed. Check the reported version and /api/data-version.
  pause
  exit /b 1
)

echo.
echo Publication completed successfully.
pause
