export interface Deal {
  id: string;
  orderId: string;
  customerId: string;
  freelancerId: string;
  status: 'ACTIVE' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    title: string;
    description: string;
    budgetCents: number;
    status: string;
  };
  customer: {
    id: string;
    displayName: string;
    tgId: string;
  };
  freelancer: {
    id: string;
    displayName: string;
    tgId: string;
  };
}

export interface User {
  id: string;
  displayName: string;
  tgId: string;
  rating: number;
  ratingsCount: number;
  balanceCents: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  dealId: string;
  senderId: string;
  type: string;
  payload: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
  };
}

export interface ApiService {
  getUserByTelegramId: (telegramId: string) => Promise<User | null>;
  getUserDeals: (userId: string) => Promise<Deal[]>;
  getDeal: (dealId: string) => Promise<Deal | null>;
  createMessage: (dealId: string, senderId: string, content: string, isFromCustomer: boolean) => Promise<Message | null>;
  getMessages: (dealId: string) => Promise<Message[]>;
  deliverDeal: (dealId: string, freelancerId: string) => Promise<boolean>;
  confirmDeal: (dealId: string, customerId: string) => Promise<boolean>;
  createComplaint: (dealId: string, customerId: string, reason: string) => Promise<boolean>;
}

export interface BotContext {
  userId?: string;
  dealId?: string;
  isCustomer?: boolean;
  isFreelancer?: boolean;
  waitingForMessage?: boolean;
  complaintReason?: string;
  apiService?: ApiService;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}
