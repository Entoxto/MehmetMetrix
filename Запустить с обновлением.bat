@echo off
setlocal EnableExtensions
chcp 65001 >nul

pushd "%~dp0" >nul || (
    echo ERROR: failed to enter project root
    exit /b 1
)

echo ========================================
echo Starting Mehmet Metrics with data update
echo ========================================
echo.

echo [1/5] Downloading sheet from Google Docs...
pushd "Excel" >nul
python fetch_google_sheet.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: failed to download sheet from Google Docs
    echo          using local Excel file instead
)
popd >nul
echo.

echo [2/5] Parsing Excel file...
pushd "Excel" >nul
python parse_excel.py --auto
if %ERRORLEVEL% NEQ 0 (
    popd >nul
    echo.
    echo ERROR: Excel parsing failed
    goto :fail
)
popd >nul
echo.

echo [3/5] Converting images to WebP...
pushd "scripts" >nul
python convert_to_webp.py --auto
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: image conversion to WebP failed
    echo          continuing to start the project...
)
popd >nul
echo.

echo [4/5] Running fast startup checks...
call npm run preflight:fast
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: fast startup checks failed
    goto :fail
)
echo.

echo [5/5] Starting dev server...
call "%~dp0scripts\windows\start_dev_server.bat" "%CD%" "http://localhost:3000" "npm run dev"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: failed to start dev server
    goto :fail
)

echo ========================================
echo Project is up and running with fresh data
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

