@echo off
chcp 65001 >nul
echo ========================================
echo Starting Mehmet Metrics with data update
echo ========================================
echo.

echo [1/4] Downloading sheet from Google Docs...
cd Excel
python fetch_google_sheet.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: failed to download sheet from Google Docs
    echo          using local Excel file instead
)
echo.

echo [2/4] Parsing Excel file...
python parse_excel.py --auto
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Excel parsing failed
    pause
    exit /b 1
)
cd ..
echo.

echo [3/4] Converting images to WebP...
cd scripts
python convert_to_webp.py --auto
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo WARNING: image conversion to WebP failed
    echo          continuing to start the project...
)
cd ..
echo.

echo [4/4] Starting dev server...
echo.
echo Running "npm run dev"...
start cmd /k "npm run dev"
echo.
echo Waiting for dev server to start...
timeout /t 5 /nobreak >nul
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo ========================================
echo Project is up and running with fresh data
echo ========================================
echo.
echo Dev server window will stay open - close it when you are done.
pause

