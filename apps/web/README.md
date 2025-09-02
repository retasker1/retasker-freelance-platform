# Retasker Web App

Веб-приложение для платформы Retasker — биржи фриланса в Telegram.

## Технологии

- **Next.js 14** с App Router
- **TypeScript** для типизации
- **Tailwind CSS** для стилизации
- **React Query** для управления состоянием
- **Prisma** для работы с базой данных

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
npm start
```

## Структура

```
src/
├── app/           # App Router страницы
├── components/    # React компоненты
├── lib/          # Утилиты и конфигурация
└── types/        # TypeScript типы
```

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните необходимые значения.
