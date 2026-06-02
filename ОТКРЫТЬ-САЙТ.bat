@echo off
chcp 65001 >nul
cd /d "%~dp0dist"
echo.
echo  Сайт запускается...
echo  Откройте в браузере:  http://localhost:3000
echo.
echo  Не закрывайте это окно, пока смотрите сайт.
echo  Чтобы остановить — нажмите любую клавишу.
echo.
start http://localhost:3000
python -m http.server 3000
pause
