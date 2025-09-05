# Скрипт для обновления zrok URL в проекте
# Использование: .\update-zrok-url.ps1 -NewUrl "https://новый-домен.share.zrok.io"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewUrl
)

Write-Host "🔄 Обновление zrok URL на: $NewUrl" -ForegroundColor Green

# Извлекаем домен из URL
$domain = $NewUrl -replace "https://", ""

Write-Host "📝 Обновление файлов..." -ForegroundColor Yellow

# 1. Обновляем login.tsx
$loginFile = "apps/web-remix/app/routes/login.tsx"
if (Test-Path $loginFile) {
    $content = Get-Content $loginFile -Raw -Encoding UTF8
    $content = $content -replace "https://[a-zA-Z0-9]+\.share\.zrok\.io", $NewUrl
    Set-Content $loginFile $content -Encoding UTF8
    Write-Host "✅ Обновлен: $loginFile" -ForegroundColor Green
} else {
    Write-Host "❌ Файл не найден: $loginFile" -ForegroundColor Red
}

# 2. Обновляем vite.config.ts
$viteFile = "apps/web-remix/vite.config.ts"
if (Test-Path $viteFile) {
    $content = Get-Content $viteFile -Raw -Encoding UTF8
    $content = $content -replace "'[a-zA-Z0-9]+\.share\.zrok\.io'", "'$domain'"
    Set-Content $viteFile $content -Encoding UTF8
    Write-Host "✅ Обновлен: $viteFile" -ForegroundColor Green
} else {
    Write-Host "❌ Файл не найден: $viteFile" -ForegroundColor Red
}

# 3. Обновляем CORS заголовки в API
$apiFiles = @(
    "apps/web-remix/app/routes/api/auth.telegram_web.ts",
    "apps/web-remix/app/routes/api/deals.ts"
)

foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace "https://[a-zA-Z0-9]+\.share\.zrok\.io", $NewUrl
        Set-Content $file $content -Encoding UTF8
        Write-Host "✅ Обновлен: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Файл не найден: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Обновление завершено!" -ForegroundColor Green
Write-Host "`n📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Обновите домен в @BotFather: /setdomain" -ForegroundColor White
Write-Host "2. Введите новый домен: $domain" -ForegroundColor White
Write-Host "3. Очистите данные браузера: localStorage.clear()" -ForegroundColor White
Write-Host "4. Перезапустите сервер: npm run dev" -ForegroundColor White
Write-Host "5. Перезапустите zrok с новым URL" -ForegroundColor White

Write-Host "`n🔗 Новый URL: $NewUrl" -ForegroundColor Magenta