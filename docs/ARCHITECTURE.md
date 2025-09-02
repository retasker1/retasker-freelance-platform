# Архитектура Retasker

## Обзор

Retasker — это монорепозиторий, содержащий веб-приложение и Telegram бота для биржи фриланса.

## Структура проекта

```
retasker-freelance-platform/
├── apps/
│   ├── web/          # Next.js веб-приложение
│   └── bot/          # Telegram бот (Telegraf)
├── packages/
│   └── shared/       # Общие типы и утилиты
├── docs/             # Документация
└── .github/          # GitHub Actions и шаблоны
```

## Технологический стек

### Frontend (apps/web)
- **Next.js 14** с App Router
- **TypeScript** для типизации
- **Tailwind CSS** для стилизации
- **React Query** для управления состоянием
- **Prisma** для работы с базой данных

### Backend (apps/bot)
- **Telegraf** для Telegram бота
- **TypeScript** для типизации
- **Prisma** для работы с базой данных

### Общие пакеты (packages/shared)
- Общие типы TypeScript
- Утилиты для валидации
- Константы и конфигурация

## База данных

Используется PostgreSQL с Prisma ORM. Основные модели:

- **User** - пользователи системы
- **Order** - заказы
- **Response** - отклики на заказы
- **Deal** - сделки
- **Message** - сообщения в чате
- **BalanceTransaction** - транзакции баланса
- **Rating** - рейтинги
- **Complaint** - жалобы

## Git Flow

Проект использует Git Flow с ветками:
- `main` - стабильные релизы
- `develop` - интеграция фич
- `feature/*` - разработка новых функций
- `release/*` - подготовка релизов
- `hotfix/*` - срочные исправления

## Развертывание

- **Веб-приложение**: Vercel/Railway
- **Бот**: Railway/Render
- **База данных**: Supabase/Neon PostgreSQL
