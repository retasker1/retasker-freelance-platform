# PowerShell скрипт для тестирования Retasker API

$API_BASE = "http://localhost:3000/api"

Write-Host "🚀 Тестирование Retasker API..." -ForegroundColor Green
Write-Host ""

# 1. Создаем тестового пользователя
Write-Host "1️⃣ Создаем тестового пользователя..." -ForegroundColor Yellow

$userData = @{
    tgId = "123456789"
    displayName = "Иван Петров"
    avatarUrl = "https://t.me/i/userpic/320/123456789.jpg"
} | ConvertTo-Json

try {
    $userResponse = Invoke-WebRequest -Uri "$API_BASE/users" -Method POST -Body $userData -ContentType "application/json"
    $user = $userResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Пользователь создан: $($user.id)" -ForegroundColor Green
    Write-Host "Ответ: $($userResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при создании пользователя: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# 2. Создаем тестовый заказ
Write-Host "`n2️⃣ Создаем тестовый заказ..." -ForegroundColor Yellow

$orderData = @{
    title = "Нужен дизайн логотипа для IT компании"
    description = "Требуется создать современный, минималистичный логотип для IT стартапа. Цветовая схема: синий и белый. Должен быть запоминающимся и хорошо смотреться в разных размерах."
    budgetCents = 50000
} | ConvertTo-Json

try {
    $orderResponse = Invoke-WebRequest -Uri "$API_BASE/orders" -Method POST -Body $orderData -ContentType "application/json"
    $order = $orderResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Заказ создан: $($order.id)" -ForegroundColor Green
    Write-Host "Ответ: $($orderResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при создании заказа: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# 3. Получаем список заказов
Write-Host "`n3️⃣ Получаем список заказов..." -ForegroundColor Yellow

try {
    $ordersResponse = Invoke-WebRequest -Uri "$API_BASE/orders" -Method GET
    Write-Host "✅ Список заказов получен" -ForegroundColor Green
    Write-Host "Ответ: $($ordersResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении списка заказов: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Получаем конкретный заказ
Write-Host "`n4️⃣ Получаем конкретный заказ..." -ForegroundColor Yellow

try {
    $orderDetailResponse = Invoke-WebRequest -Uri "$API_BASE/orders/$($order.id)" -Method GET
    Write-Host "✅ Детали заказа получены" -ForegroundColor Green
    Write-Host "Ответ: $($orderDetailResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении деталей заказа: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Создаем отклик на заказ
Write-Host "`n5️⃣ Создаем отклик на заказ..." -ForegroundColor Yellow

$responseData = @{
    priceCents = 45000
    message = "Готов выполнить работу качественно и в срок. У меня есть опыт создания логотипов для IT компаний."
} | ConvertTo-Json

try {
    $responseResponse = Invoke-WebRequest -Uri "$API_BASE/orders/$($order.id)/responses" -Method POST -Body $responseData -ContentType "application/json"
    $response = $responseResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Отклик создан: $($response.id)" -ForegroundColor Green
    Write-Host "Ответ: $($responseResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при создании отклика: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Получаем отклики на заказ
Write-Host "`n6️⃣ Получаем отклики на заказ..." -ForegroundColor Yellow

try {
    $responsesResponse = Invoke-WebRequest -Uri "$API_BASE/orders/$($order.id)/responses" -Method GET
    Write-Host "✅ Отклики получены" -ForegroundColor Green
    Write-Host "Ответ: $($responsesResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении откликов: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Получаем профиль пользователя
Write-Host "`n7️⃣ Получаем профиль пользователя..." -ForegroundColor Yellow

try {
    $userProfileResponse = Invoke-WebRequest -Uri "$API_BASE/users/$($user.id)" -Method GET
    Write-Host "✅ Профиль пользователя получен" -ForegroundColor Green
    Write-Host "Ответ: $($userProfileResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении профиля пользователя: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Тестируем поиск заказов
Write-Host "`n8️⃣ Тестируем поиск заказов..." -ForegroundColor Yellow

try {
    $searchResponse = Invoke-WebRequest -Uri "$API_BASE/orders?q=логотип&minBudget=10000&status=OPEN" -Method GET
    Write-Host "✅ Поиск заказов выполнен" -ForegroundColor Green
    Write-Host "Ответ: $($searchResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при поиске заказов: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Тестирование API завершено!" -ForegroundColor Green

