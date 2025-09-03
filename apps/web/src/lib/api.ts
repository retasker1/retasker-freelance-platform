// Утилиты для работы с API

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Order {
  id: string
  title: string
  description: string
  budgetCents: number
  status: string
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    displayName: string
    rating: number
    ratingsCount: number
  }
  responses?: Array<{
    id: string
    priceCents: number
    createdAt: string
    freelancer: {
      id: string
      displayName: string
      rating: number
    }
  }>
}

export interface User {
  id: string
  displayName: string
  avatarUrl?: string
  rating: number
  ratingsCount: number
  balanceCents: number
  createdAt: string
}

// Функция для форматирования цены
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(cents / 100)
}

// Функция для форматирования даты
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Функция для получения статуса заказа на русском
export function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'OPEN': 'Открыт',
    'IN_DEAL': 'В работе',
    'CLOSED': 'Закрыт'
  }
  return statusMap[status] || status
}

// Функция для получения цвета статуса
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'OPEN': 'text-green-600 bg-green-100',
    'IN_DEAL': 'text-blue-600 bg-blue-100',
    'CLOSED': 'text-gray-600 bg-gray-100'
  }
  return colorMap[status] || 'text-gray-600 bg-gray-100'
}

// Функция для валидации бюджета
export function validateBudget(budget: number): boolean {
  return budget >= 100 && budget <= 1000000 // от 1 рубля до 10,000 рублей
}

// Функция для обрезки длинного текста
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

