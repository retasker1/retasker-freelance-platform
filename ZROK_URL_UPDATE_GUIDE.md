# 🔄 Шпаргалка по обновлению zrok URL

## 🚀 Быстрый способ (скрипт)

```powershell
# Запустите скрипт с новым URL
.\update-zrok-url.ps1 -NewUrl "https://новый-домен.share.zrok.io"
```

## 📋 Ручной способ

### 1. **Обновить файлы кода:**

#### `apps/web-remix/app/routes/login.tsx`
```javascript
// Найти и заменить:
const baseUrl = 'https://СТАРЫЙ-ДОМЕН.share.zrok.io';
// На:
const baseUrl = 'https://НОВЫЙ-ДОМЕН.share.zrok.io';
```

#### `apps/web-remix/vite.config.ts`
```javascript
// Найти и заменить:
'СТАРЫЙ-ДОМЕН.share.zrok.io', // zrok домен
// На:
'НОВЫЙ-ДОМЕН.share.zrok.io', // zrok домен
```

#### API файлы (CORS заголовки)
```javascript
// В файлах:
// - apps/web-remix/app/routes/api/auth.telegram_web.ts
// - apps/web-remix/app/routes/api/users.ts
// - apps/web-remix/app/routes/api/orders.ts

// Найти и заменить:
"Access-Control-Allow-Origin": "https://СТАРЫЙ-ДОМЕН.share.zrok.io"
// На:
"Access-Control-Allow-Origin": "https://НОВЫЙ-ДОМЕН.share.zrok.io"
```

### 2. **Обновить Telegram Bot:**

1. Откройте @BotFather в Telegram
2. Выберите @RetaskerRobot
3. Отправьте: `/setdomain`
4. Введите: `https://НОВЫЙ-ДОМЕН.share.zrok.io`

### 3. **Очистить данные браузера:**

```javascript
// В консоли браузера (F12)
localStorage.clear();
sessionStorage.clear();
```

### 4. **Перезапустить сервисы:**

```powershell
# Остановить сервер (Ctrl+C)
# Запустить снова
npm run dev

# Остановить zrok (Ctrl+C)
# Запустить с новым URL
.\zrok.exe share public --backend-mode web http://localhost:5173
```

## 🔍 **Проверка:**

1. Откройте новый URL в браузере
2. Попробуйте авторизацию через Telegram
3. Проверьте, что все функции работают

## ⚠️ **Важно:**

- Всегда обновляйте домен в @BotFather
- Очищайте данные браузера после смены URL
- Перезапускайте сервер после изменений в коде
