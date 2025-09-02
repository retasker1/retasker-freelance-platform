# Retasker Bot

Telegram бот для платформы Retasker, обеспечивающий анонимное общение между заказчиками и исполнителями.

## Возможности

- 📋 Управление сделками
- 💬 Анонимный чат между участниками сделки
- 📤 Отправка результатов (для исполнителей)
- ✅ Подтверждение завершения (для заказчиков)
- ⚠️ Подача жалоб
- 🔗 Интеграция с веб-платформой

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Заполните переменные окружения в `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
APP_API_BASE=http://localhost:3000
NODE_ENV=development
```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

## Команды бота

- `/start` - Начать работу с ботом
- `/my_deals` - Показать мои сделки
- `/chat` - Открыть чат
- `/deliver` - Отправить результат
- `/confirm` - Подтвердить завершение
- `/complaint` - Подать жалобу

## Архитектура

```
src/
├── handlers/          # Обработчики команд
│   ├── start.ts      # Команда /start
│   ├── myDeals.ts    # Команда /my_deals
│   ├── chat.ts       # Команда /chat
│   ├── deliver.ts    # Команда /deliver
│   ├── confirm.ts    # Команда /confirm
│   └── complaint.ts  # Команда /complaint
├── services/         # Сервисы
│   └── api.ts        # API клиент
├── types/            # TypeScript типы
│   └── index.ts
└── index.ts          # Основной файл бота
```

## API Endpoints

Бот взаимодействует с следующими API endpoints:

- `GET /api/users?telegramId={id}` - Получить пользователя
- `GET /api/deals?userId={id}` - Получить сделки пользователя
- `GET /api/deals/{id}?userId={id}` - Получить сделку
- `POST /api/deals/{id}/deliver` - Отправить результат
- `POST /api/deals/{id}/confirm` - Подтвердить завершение
- `POST /api/deals/{id}/complaint` - Подать жалобу
- `GET /api/deals/{id}/messages` - Получить сообщения чата
- `POST /api/deals/{id}/messages` - Отправить сообщение

## Webhook (Продакшн)

В продакшене бот использует webhook вместо polling:

```env
BOT_WEBHOOK_URL=https://your-domain.com
PORT=3001
```

## Разработка

1. Убедитесь, что веб-приложение запущено на `http://localhost:3000`
2. Создайте бота через [@BotFather](https://t.me/botfather)
3. Получите токен и добавьте в `.env`
4. Запустите бота: `npm run dev`
5. Протестируйте команды в Telegram
