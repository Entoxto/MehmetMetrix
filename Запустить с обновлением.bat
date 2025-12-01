@echo off
echo ========================================
echo Запуск проекта Mehmet Metrics с обновлением данных
echo ========================================
echo.

echo [1/3] Парсинг Excel файла...
cd Excel
python parse_excel.py --auto
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Ошибка при парсинге Excel файла
    pause
    exit /b 1
)
cd ..
echo.

echo [2/3] Конвертация изображений в WebP...
cd scripts
python convert_to_webp.py --auto
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Предупреждение: ошибка при конвертации изображений
    echo    Продолжаю запуск проекта...
)
cd ..
echo.

echo [3/3] Запуск сервера разработки...
echo.
echo Запускаю сервер разработки...
start cmd /k "npm run dev"
echo.
echo Ожидание запуска сервера...
timeout /t 5 /nobreak >nul
echo.
echo Открываю браузер...
start http://localhost:3000
echo.
echo ========================================
echo ✅ Готово! Проект запущен с обновлёнными данными
echo ========================================
echo.
echo Окно сервера останется открытым - закройте его, когда закончите работу.
pause

