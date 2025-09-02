# Retasker API Documentation

API для платформы Retasker - фриланс платформа с Telegram интеграцией.

## Базовый URL

```
http://localhost:3000/api
```

## Аутентификация

**Внимание:** Аутентификация пока не реализована. Все эндпоинты используют временные ID пользователей.

## Эндпоинты

### Заказы

#### GET /api/orders
Получение списка заказов с фильтрацией и пагинацией.

**Query параметры:**
- `q` - поисковый запрос (по заголовку и описанию)
- `minBudget` - минимальный бюджет в центах
- `maxBudget` - максимальный бюджет в центах
- `status` - статус заказа (OPEN, IN_DEAL, CLOSED)
- `page` - номер страницы (по умолчанию 1)
- `limit` - количество заказов на странице (по умолчанию 20)

**Пример запроса:**
```bash
GET /api/orders?q=дизайн&minBudget=5000&status=OPEN&page=1&limit=10
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "clx123...",
      "title": "Нужен дизайн логотипа",
      "description": "Требуется создать современный логотип...",
      "budgetCents": 50000,
      "status": "OPEN",
      "createdAt": "2024-01-01T00:00:00Z",
      "customer": {
        "id": "clx456...",
        "displayName": "Иван Петров",
        "rating": 4.8,
        "ratingsCount": 15
      },
      "responses": [
        {
          "id": "clx789...",
          "priceCents": 45000,
          "createdAt": "2024-01-01T01:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST /api/orders
Создание нового заказа.

**Тело запроса:**
```json
{
  "title": "Нужен дизайн логотипа",
  "description": "Требуется создать современный логотип для IT компании",
  "budgetCents": 50000
}
```

**Ответ:**
```json
{
  "id": "clx123...",
  "title": "Нужен дизайн логотипа",
  "description": "Требуется создать современный логотип для IT компании",
  "budgetCents": 50000,
  "status": "OPEN",
  "createdAt": "2024-01-01T00:00:00Z",
  "customer": {
    "id": "temp-user-id",
    "displayName": "Временный пользователь",
    "rating": 0
  }
}
```

#### GET /api/orders/[id]
Получение заказа по ID.

**Ответ:**
```json
{
  "id": "clx123...",
  "title": "Нужен дизайн логотипа",
  "description": "Требуется создать современный логотип...",
  "budgetCents": 50000,
  "status": "OPEN",
  "createdAt": "2024-01-01T00:00:00Z",
  "customer": {
    "id": "clx456...",
    "displayName": "Иван Петров",
    "rating": 4.8,
    "ratingsCount": 15,
    "avatarUrl": "https://..."
  },
  "responses": [
    {
      "id": "clx789...",
      "priceCents": 45000,
      "createdAt": "2024-01-01T01:00:00Z",
      "freelancer": {
        "id": "clx999...",
        "displayName": "Анна Сидорова",
        "rating": 4.9,
        "ratingsCount": 23
      }
    }
  ],
  "deal": null
}
```

#### PUT /api/orders/[id]
Обновление заказа.

**Тело запроса:**
```json
{
  "title": "Обновленный заголовок",
  "description": "Обновленное описание",
  "budgetCents": 60000,
  "status": "CLOSED"
}
```

#### DELETE /api/orders/[id]
Удаление заказа.

### Отклики на заказы

#### GET /api/orders/[id]/responses
Получение откликов на заказ.

#### POST /api/orders/[id]/responses
Создание отклика на заказ.

**Тело запроса:**
```json
{
  "priceCents": 45000,
  "message": "Готов выполнить работу качественно и в срок"
}
```

### Пользователи

#### GET /api/users
Получение списка пользователей (для админов).

#### POST /api/users
Создание пользователя (при регистрации через Telegram).

**Тело запроса:**
```json
{
  "tgId": "123456789",
  "displayName": "Иван Петров",
  "avatarUrl": "https://t.me/i/userpic/320/..."
}
```

#### GET /api/users/[id]
Получение профиля пользователя.

#### PUT /api/users/[id]
Обновление профиля пользователя.

## Коды ошибок

- `400` - Неверные данные запроса
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Валидация

Все входящие данные валидируются с помощью Zod схем:

- `createOrderSchema` - для создания заказов
- `createResponseSchema` - для создания откликов
- `searchOrdersSchema` - для поиска заказов
- `paginationSchema` - для пагинации

## TODO

- [ ] Реализовать аутентификацию через Telegram
- [ ] Добавить middleware для проверки прав доступа
- [ ] Реализовать JWT токены
- [ ] Добавить rate limiting
- [ ] Добавить логирование запросов
- [ ] Реализовать кэширование
- [ ] Добавить тесты для API

