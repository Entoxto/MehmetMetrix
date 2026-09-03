@echo off
setlocal
cd /d "%~dp0"

if exist "%~dp0.tools\node\npm.cmd" set "PATH=%~dp0.tools\node;%PATH%"

call npm run publish:data
if errorlevel 1 (
  echo.
  echo Publication failed. The previous application data remains active.
  pause
  exit /b 1
)

echo.
echo Publication completed successfully.
pause
