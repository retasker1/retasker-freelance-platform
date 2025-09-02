# Retasker — Биржа фриланса в Telegram

> MVP версия Retasker — платформа для анонимного общения между заказчиками и исполнителями через Telegram бота с виртуальным балансом.

## Описание проекта

Retasker — это биржа фриланса, которая позволяет:
- Создавать и просматривать заказы
- Анонимно общаться через Telegram бота
- Безопасно проводить сделки с виртуальным балансом
- Оставлять рейтинги и отзывы

## Технологический стек

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **База данных**: PostgreSQL
- **Bot**: Telegraf (Node.js)
- **Аутентификация**: Telegram Login Widget

## Git-флоу

- `main` — стабильные релизы
- `develop` — интеграция фич
- `feature/*` — работа над задачами. Пример: `feature/web-order-form`
- `release/*` — подготовка релиза, затем merge → main (tag)
- `hotfix/*` — срочные исправления от `main`

### Коммиты (Conventional Commits)

- `feat: ...` новая функциональность
- `fix: ...` исправление багов
- `chore|refactor|docs|test|ci: ...`

## Установка и запуск

> **Внимание**: Для работы с проектом необходимо установить Git. Скачайте его с [git-scm.com](https://git-scm.com/download/win)

После установки Git выполните:

```bash
# Клонирование репозитория
git clone <repository-url>
cd retasker

# Установка зависимостей
npm install

# Настройка базы данных
npx prisma migrate dev

# Запуск в режиме разработки
npm run dev
```

## Структура проекта

```
retasker/
├── apps/
│   ├── web/          # Next.js веб-приложение
│   └── bot/          # Telegram бот (Telegraf)
├── packages/
│   └── shared/       # Общие типы и утилиты
├── docs/             # Документация
└── .github/          # GitHub Actions и шаблоны
```

## Разработка

1. Создайте feature ветку: `git checkout -b feature/your-feature`
2. Внесите изменения
3. Сделайте коммит: `git commit -m "feat: add your feature"`
4. Отправьте PR в `develop`
5. После ревью и мержа создайте release PR в `main`

## Лицензия

MIT
