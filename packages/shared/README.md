# Retasker Shared Package

Общие типы, валидация и конфигурация базы данных для платформы Retasker.

## Содержимое

- **Prisma Schema** - схема базы данных
- **TypeScript типы** - интерфейсы для всех сущностей
- **Zod валидация** - схемы валидации API запросов
- **Общие утилиты** - переиспользуемые функции

## База данных

### Основные сущности

- **User** - пользователи системы
- **Order** - заказы
- **Response** - отклики на заказы
- **Deal** - сделки
- **Message** - сообщения в чате
- **BalanceTransaction** - транзакции баланса
- **Rating** - рейтинги
- **Favorite** - избранные заказы
- **Complaint** - жалобы
- **FeatureFlag** - флаги функций

### Связи

- Пользователь может создавать заказы
- Пользователь может оставлять отклики
- Отклик может превратиться в сделку
- В сделке есть чат с сообщениями
- После завершения сделки ставятся рейтинги

## Установка и настройка

```bash
# Установка зависимостей
npm install

# Генерация Prisma клиента
npm run db:generate

# Создание миграций
npm run db:migrate

# Просмотр базы данных
npm run db:studio
```

## Переменные окружения

Создайте `.env` файл на основе `.env.example`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/retasker"
TELEGRAM_BOT_TOKEN="your_bot_token"
JWT_SECRET="your_jwt_secret"
```

## Использование

```typescript
import { PrismaClient, User, Order } from '@retasker/shared'
import { createOrderSchema } from '@retasker/shared'

const prisma = new PrismaClient()

// Создание заказа с валидацией
const orderData = createOrderSchema.parse({
  title: 'Нужен дизайн логотипа',
  description: 'Требуется создать современный логотип для IT компании',
  budgetCents: 50000 // 500 рублей
})

const order = await prisma.order.create({
  data: orderData,
  include: { customer: true }
})
```

