import axios, { AxiosInstance } from 'axios';

export class ApiService {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Получить пользователя по Telegram ID
  async getUserByTelegramId(telegramId: string) {
    try {
      console.log('API: Fetching user with telegramId:', telegramId);
      console.log('API: Base URL:', this.client.defaults.baseURL);
      
      const response = await this.client.get(`/api/users?telegramId=${telegramId}`);
      console.log('API: Response status:', response.status);
      console.log('API: Response data:', response.data);
      
      if (response.data && response.data.length > 0) {
        console.log('API: User found:', response.data[0]);
        return response.data[0];
      }
      
      console.log('API: No user found');
      return null;
    } catch (error) {
      console.error('API: Error fetching user by telegram ID:', error);
      return null;
    }
  }

  // Получить заказы пользователя
  async getUserOrders(userId: string) {
    try {
      const response = await this.client.get(`/api/orders?customerId=${userId}`);
      if (response.data && response.data.orders) {
        return response.data.orders;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  // Получить сделки пользователя
  async getUserDeals(userId: string) {
    try {
      const response = await this.client.get(`/api/deals?userId=${userId}`);
      if (response.data && response.data.deals) {
        return response.data.deals;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user deals:', error);
      return [];
    }
  }

  // Получить сделку по ID
  async getDeal(dealId: string) {
    try {
      const response = await this.client.get(`/api/deals/${dealId}`);
      if (response.data && response.data.deal) {
        return response.data.deal;
      }
      return null;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  }

  // Создать сообщение
  async createMessage(dealId: string, senderId: string, content: string, isFromCustomer: boolean) {
    try {
      const response = await this.client.post(`/api/deals/${dealId}/messages`, {
        senderId,
        content,
        isFromCustomer
      });
      if (response.data && response.data.message) {
        return response.data.message;
      }
      return null;
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  }

  // Получить сообщения
  async getMessages(dealId: string) {
    try {
      const response = await this.client.get(`/api/deals/${dealId}/messages`);
      if (response.data && response.data.messages) {
        return response.data.messages;
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Доставить результат
  async deliverDeal(dealId: string, freelancerId: string) {
    try {
      const response = await this.client.post(`/api/deals/${dealId}/deliver`, {
        userId: freelancerId
      });
      return response.data.success || false;
    } catch (error) {
      console.error('Error delivering deal:', error);
      return false;
    }
  }

  // Подтвердить сделку
  async confirmDeal(dealId: string, customerId: string) {
    try {
      const response = await this.client.post(`/api/deals/${dealId}/confirm`, {
        userId: customerId
      });
      return response.data.success || false;
    } catch (error) {
      console.error('Error confirming deal:', error);
      return false;
    }
  }

  // Создать жалобу
  async createComplaint(dealId: string, customerId: string, reason: string, description?: string) {
    try {
      const response = await this.client.post(`/api/deals/${dealId}/complaint`, {
        userId: customerId,
        reason,
        description: description || reason
      });
      return response.data.success || false;
    } catch (error) {
      console.error('Error creating complaint:', error);
      return false;
    }
  }

  // Создать сделку (отклик на заказ)
  async createDeal(orderId: string, freelancerId: string, amountCents: number) {
    try {
      const response = await this.client.post('/api/deals', {
        orderId,
        freelancerId,
        amountCents
      });
      if (response.data && response.data.deal) {
        return response.data.deal;
      }
      return null;
    } catch (error) {
      console.error('Error creating deal:', error);
      return null;
    }
  }

  // Получить заказ по ID
  async getOrder(orderId: string) {
    try {
      const response = await this.client.get(`/api/orders/${orderId}`);
      if (response.data && response.data.order) {
        return response.data.order;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // Получить все открытые заказы
  async getOpenOrders() {
    try {
      const response = await this.client.get('/api/orders?status=OPEN');
      if (response.data && response.data.orders) {
        return response.data.orders;
      }
      return [];
    } catch (error) {
      console.error('Error fetching open orders:', error);
      return [];
    }
  }
}
