@echo off
setlocal
cd /d "%~dp0"

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
