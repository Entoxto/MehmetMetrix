@echo off
setlocal EnableExtensions
chcp 65001 >nul

pushd "%~dp0" >nul || (
    echo ERROR: failed to enter project root
    exit /b 1
)

echo ========================================
echo Building Mehmet Metrics
echo ========================================
echo.

echo [1/1] Running full preflight...
call npm run preflight
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: full preflight failed
    if /I not "%MM_DRY_RUN%"=="1" pause
    popd >nul
    exit /b 1
)

echo.
echo ========================================
echo Build and checks completed successfully
echo ========================================
echo.
echo Production build is ready in .next/
echo Start it with: npm start
echo.

if /I not "%MM_DRY_RUN%"=="1" pause
popd >nul
exit /b 0


