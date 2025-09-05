# Автоматический скрипт обновления zrok URL
# Использование: .\update-zrok-auto.ps1

Write-Host "🔍 Поиск нового zrok URL..." -ForegroundColor Yellow

# Получаем новый URL от пользователя
$NewUrl = Read-Host "Введите новый zrok URL (например: https://abc123.share.zrok.io)"

if ($NewUrl -match "https://[a-zA-Z0-9]+\.share\.zrok\.io") {
    Write-Host "✅ Валидный URL: $NewUrl" -ForegroundColor Green
    
    # Запускаем основной скрипт
    & ".\update-zrok-url.ps1" -NewUrl $NewUrl
    
    Write-Host "`n🚀 Дополнительные команды:" -ForegroundColor Cyan
    Write-Host "1. Обновите BotFather: /setdomain" -ForegroundColor White
    Write-Host "2. Новый домен: $($NewUrl -replace 'https://', '')" -ForegroundColor White
    Write-Host "3. Очистите браузер: localStorage.clear()" -ForegroundColor White
    
} else {
    Write-Host "❌ Неверный формат URL. Используйте: https://abc123.share.zrok.io" -ForegroundColor Red
}