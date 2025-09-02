export interface Deal {
  id: string;
  orderId: string;
  responseId: string;
  customerId: string;
  freelancerId: string;
  finalPrice: number;
  status: 'active' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    title: string;
    description: string;
    budgetCents: number;
    category: string;
    deadline: string;
    status: string;
  };
  response: {
    id: string;
    message: string;
    proposedPrice: number;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    telegramId: string;
  };
  freelancer: {
    id: string;
    firstName: string;
    lastName: string;
    telegramId: string;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  telegramId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  dealId: string;
  senderId: string;
  content: string;
  isFromCustomer: boolean;
  createdAt: string;
}

export interface BotContext {
  userId?: string;
  dealId?: string;
  isCustomer?: boolean;
  isFreelancer?: boolean;
  waitingForMessage?: boolean;
  complaintReason?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}
