@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Сайт запускается...
echo  Откройте в браузере:  http://localhost:3000
echo.
echo  Не закрывайте это окно, пока смотрите сайт.
echo  Чтобы остановить — нажмите Ctrl+C или закройте окно.
echo.
start http://localhost:3000
python -m http.server 3000
pause
