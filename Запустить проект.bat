@echo off
setlocal EnableExtensions
chcp 65001 >nul

pushd "%~dp0" >nul || (
    echo ERROR: failed to enter project root
    exit /b 1
)

echo ========================================
echo Starting Mehmet Metrics
echo ========================================
echo.

echo [1/2] Running fast startup checks...
call npm run preflight:fast
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: fast startup checks failed
    goto :fail
)
echo.

echo [2/2] Starting dev server...
call "%~dp0scripts\windows\start_dev_server.bat" "%CD%" "http://localhost:3000" "npm run dev"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: failed to start dev server
    goto :fail
)

echo ========================================
echo Project is up and running
echo ========================================
echo.
goto :success

:fail
if /I not "%MM_DRY_RUN%"=="1" pause
popd >nul
exit /b 1

:success
if /I not "%MM_DRY_RUN%"=="1" pause
popd >nul
exit /b 0

