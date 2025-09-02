import { z } from 'zod'

// Валидация для создания заказа
export const createOrderSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Заголовок слишком длинный'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов').max(2000, 'Описание слишком длинное'),    
  budgetCents: z.number().int().positive('Бюджет должен быть положительным числом').min(100, 'Минимальный бюджет 1 рубль'),
  customerId: z.string().min(1, 'ID заказчика обязателен')
})

// Валидация для создания отклика
export const createResponseSchema = z.object({
  priceCents: z.number().int().positive('Цена должна быть положительным числом').min(100, 'Минимальная цена 1 рубль'),
  message: z.string().max(1000, 'Сообщение слишком длинное').optional()
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

// Типы для TypeScript
export type CreateOrderRequest = z.infer<typeof createOrderSchema>
export type CreateResponseRequest = z.infer<typeof createResponseSchema>
export type SearchOrdersRequest = z.infer<typeof searchOrdersSchema>
export type PaginationRequest = z.infer<typeof paginationSchema>
export type TelegramAuthRequest = z.infer<typeof telegramAuthSchema>

