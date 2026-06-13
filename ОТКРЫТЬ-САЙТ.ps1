# Локальный просмотр сайта — запуск: правый клик -> "Выполнить с помощью PowerShell"
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$port = 3000
while ($port -le 3010) {
  $busy = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $busy) { break }
  $port++
}

if ($port -gt 3010) {
  Write-Host "Порты 3000-3010 заняты." -ForegroundColor Red
  Read-Host "Enter для выхода"
  exit 1
}

$url = "http://127.0.0.1:$port/"
Write-Host ""
Write-Host "  Цифровой Агент Х — локальный сервер" -ForegroundColor Cyan
Write-Host "  $url"
Write-Host "  Не закрывайте это окно." -ForegroundColor Yellow
Write-Host ""

Start-Job -ScriptBlock { param($u) Start-Sleep -Seconds 2; Start-Process $u } -ArgumentList $url | Out-Null

if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server $port
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
  py -3 -m http.server $port
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
  npx --yes serve -l $port .
} else {
  Write-Host "Установите Python: https://www.python.org/downloads/" -ForegroundColor Red
  Read-Host "Enter для выхода"
}
