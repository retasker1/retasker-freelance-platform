import { z } from 'zod'

// Валидация для создания заказа
export const createOrderSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Заголовок слишком длинный'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов').max(2000, 'Описание слишком длинное'),
  budgetCents: z.number().int().positive('Бюджет должен быть положительным числом').min(100, 'Минимальный бюджет 1 рубль')
})

// Валидация для создания отклика
export const createResponseSchema = z.object({
  priceCents: z.number().int().positive('Цена должна быть положительным числом').min(100, 'Минимальная цена 1 рубль'),
  message: z.string().max(1000, 'Сообщение слишком длинное').optional()
})

// Валидация для создания сделки
export const createDealSchema = z.object({
  responseId: z.string().cuid('Неверный ID отклика')
})

// Валидация для рейтинга
export const rateDealSchema = z.object({
  score: z.number().int().min(0, 'Рейтинг должен быть от 0 до 5').max(5, 'Рейтинг должен быть от 0 до 5')
})

// Валидация для жалобы
export const createComplaintSchema = z.object({
  text: z.string().min(10, 'Текст жалобы должен содержать минимум 10 символов').max(1000, 'Текст жалобы слишком длинный')
})

// Валидация для поиска заказов
export const searchOrdersSchema = z.object({
  q: z.string().optional(),
  minBudget: z.number().int().positive().optional(),
  maxBudget: z.number().int().positive().optional(),
  status: z.enum(['OPEN', 'IN_DEAL', 'CLOSED']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20)
})

// Валидация для пагинации
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20)
})

// Валидация для Telegram аутентификации
export const telegramAuthSchema = z.object({
  id: z.number().positive(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
  auth_date: z.number().positive(),
  hash: z.string()
})

// Валидация для админских операций
export const adminBalanceOperationSchema = z.object({
  userId: z.string().cuid('Неверный ID пользователя'),
  amountCents: z.number().int().not(0, 'Сумма не может быть нулевой'),
  reason: z.string().min(1, 'Причина обязательна').max(200, 'Причина слишком длинная')
})

// Валидация для feature flags
export const featureFlagSchema = z.object({
  key: z.string().min(1, 'Ключ обязателен'),
  enabled: z.boolean()
})

// Типы для TypeScript
export type CreateOrderRequest = z.infer<typeof createOrderSchema>
export type CreateResponseRequest = z.infer<typeof createResponseSchema>
export type CreateDealRequest = z.infer<typeof createDealSchema>
export type RateDealRequest = z.infer<typeof rateDealSchema>
export type CreateComplaintRequest = z.infer<typeof createComplaintSchema>
export type SearchOrdersRequest = z.infer<typeof searchOrdersSchema>
export type PaginationRequest = z.infer<typeof paginationSchema>
export type TelegramAuthRequest = z.infer<typeof telegramAuthSchema>
export type AdminBalanceOperationRequest = z.infer<typeof adminBalanceOperationSchema>
export type FeatureFlagRequest = z.infer<typeof featureFlagSchema>
