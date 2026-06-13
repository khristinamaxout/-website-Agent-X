@echo off
setlocal EnableExtensions EnableDelayedExpansion

chcp 65001 >nul 2>&1
cd /d "%~dp0"

title Цифровой Агент Х — локальный сервер

echo.
echo  Локальный просмотр — Цифровой Агент Х
echo  -------------------------------------
echo.

set "PORT=3000"
set "HAS_PYTHON=0"
set "HAS_PY=0"
set "HAS_NODE=0"

where python >nul 2>&1 && set "HAS_PYTHON=1"
where py >nul 2>&1 && set "HAS_PY=1"
where node >nul 2>&1 && set "HAS_NODE=1"

if "!HAS_PYTHON!"=="0" if "!HAS_PY!"=="0" if "!HAS_NODE!"=="0" (
  echo  [Ошибка] Не найден Python и Node.js.
  echo  Установите Python: https://www.python.org/downloads/
  echo  При установке отметьте "Add python.exe to PATH".
  echo.
  goto END
)

:FIND_PORT
netstat -ano | findstr /C:":!PORT! " | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
  set /a PORT+=1
  if !PORT! GTR 3010 (
    echo  [Ошибка] Порты 3000-3010 заняты.
    echo  Закройте другие программы с локальным сервером.
    echo.
    goto END
  )
  goto FIND_PORT
)

echo  Адрес: http://127.0.0.1:!PORT!/
echo  Браузер откроется через несколько секунд...
echo  НЕ ЗАКРЫВАЙТЕ это окно — иначе сайт перестанет работать.
echo  Остановка: Ctrl+C или закройте окно.
echo.

start "" /b cmd /c "ping -n 4 127.0.0.1 >nul & start http://127.0.0.1:!PORT!/"

if "!HAS_PYTHON!"=="1" (
  python -m http.server !PORT!
  goto STOPPED
)

if "!HAS_PY!"=="1" (
  py -3 -m http.server !PORT!
  goto STOPPED
)

echo  Python не найден — запуск через Node.js...
npx --yes serve -l !PORT! .
goto STOPPED

:STOPPED
echo.
echo  Сервер остановлен.
goto END

:END
echo.
echo  Нажмите любую клавишу, чтобы закрыть окно...
pause >nul
exit /b 0
