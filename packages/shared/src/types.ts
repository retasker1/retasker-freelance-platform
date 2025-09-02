// Основные типы для Retasker

export interface User {
  id: string
  tgId: string
  displayName: string
  createdAt: Date
  avatarUrl?: string
  rating: number
  ratingsCount: number
  balanceCents: number
  isAdmin: boolean
  activeDealId?: string
}

export interface Order {
  id: string
  title: string
  description: string
  budgetCents: number
  customerId: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  customer?: User
  responses?: Response[]
  deal?: Deal
}

export interface Response {
  id: string
  orderId: string
  freelancerId: string
  priceCents: number
  message?: string
  createdAt: Date
  order?: Order
  freelancer?: User
}

export interface Deal {
  id: string
  orderId: string
  customerId: string
  freelancerId: string
  status: DealStatus
  createdAt: Date
  startedAt?: Date
  finishedAt?: Date
  order?: Order
  customer?: User
  freelancer?: User
  messages?: Message[]
  ratings?: Rating[]
  complaints?: Complaint[]
}

export interface Message {
  id: string
  dealId: string
  senderId: string
  type: MessageType
  payload: any
  createdAt: Date
  deal?: Deal
  sender?: User
}

export interface BalanceTransaction {
  id: string
  userId: string
  amountCents: number
  reason: string
  createdAt: Date
  adminId?: string
  user?: User
}

export interface Rating {
  id: string
  dealId: string
  raterId: string
  rateeId: string
  score: number
  createdAt: Date
  deal?: Deal
  rater?: User
  ratee?: User
}

export interface Favorite {
  id: string
  userId: string
  orderId: string
  createdAt: Date
  user?: User
  order?: Order
}

export interface Complaint {
  id: string
  dealId: string
  authorId: string
  text: string
  createdAt: Date
  status: ComplaintStatus
  deal?: Deal
  author?: User
}

export interface FeatureFlag {
  key: string
  enabled: boolean
}

// Enums
export enum OrderStatus {
  OPEN = 'OPEN',
  IN_DEAL = 'IN_DEAL',
  CLOSED = 'CLOSED'
}

export enum DealStatus {
  ACTIVE = 'ACTIVE',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELED = 'CANCELED'
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  REVIEWED = 'REVIEWED',
  CLOSED = 'CLOSED'
}

export enum MessageType {
  TEXT = 'text',
  PHOTO = 'photo',
  VIDEO = 'video',
  VOICE = 'voice',
  DOCUMENT = 'doc'
}

// API типы теперь экспортируются из validation.ts

// Утилиты
export type UserRole = 'customer' | 'freelancer' | 'admin'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

