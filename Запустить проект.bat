@echo off
echo Запуск проекта Mehmet Metrics...
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
echo Готово! Проект должен открыться в браузере.
echo Окно сервера останется открытым - закройте его, когда закончите работу.
pause

