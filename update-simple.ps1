# Простой скрипт обновления zrok URL
param(
    [string]$NewUrl = "https://4klnm84lswj4.share.zrok.io"
)

Write-Host "Updating zrok URL to: $NewUrl" -ForegroundColor Green

# Извлекаем домен
$domain = $NewUrl -replace "https://", ""

# Обновляем login.tsx
$loginFile = "apps/web-remix/app/routes/login.tsx"
if (Test-Path $loginFile) {
    $content = Get-Content $loginFile -Raw -Encoding UTF8
    $content = $content -replace "https://[a-zA-Z0-9]+\.share\.zrok\.io", $NewUrl
    Set-Content $loginFile $content -Encoding UTF8
    Write-Host "Updated: $loginFile" -ForegroundColor Green
}

# Обновляем vite.config.ts
$viteFile = "apps/web-remix/vite.config.ts"
if (Test-Path $viteFile) {
    $content = Get-Content $viteFile -Raw -Encoding UTF8
    $content = $content -replace "'[a-zA-Z0-9]+\.share\.zrok\.io'", "'$domain'"
    Set-Content $viteFile $content -Encoding UTF8
    Write-Host "Updated: $viteFile" -ForegroundColor Green
}

# Обновляем API файлы
$apiFiles = @(
    "apps/web-remix/app/routes/api/auth.telegram_web.ts",
    "apps/web-remix/app/routes/api/deals.ts"
)

foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace "https://[a-zA-Z0-9]+\.share\.zrok\.io", $NewUrl
        Set-Content $file $content -Encoding UTF8
        Write-Host "Updated: $file" -ForegroundColor Green
    }
}

Write-Host "`nUpdate completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update BotFather: /setdomain" -ForegroundColor White
Write-Host "2. New domain: $domain" -ForegroundColor White
Write-Host "3. Clear browser: localStorage.clear()" -ForegroundColor White
