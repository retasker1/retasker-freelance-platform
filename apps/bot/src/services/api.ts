import axios, { AxiosInstance } from 'axios';
import { Deal, User, Message, ApiResponse } from '../types';

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
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      console.log('API: Fetching user with telegramId:', telegramId);
      console.log('API: Base URL:', this.client.defaults.baseURL);
      
      const response = await this.client.get<ApiResponse<{ users: User[] }>>(
        `/api/users?telegramId=${telegramId}`
      );
      
      console.log('API: Response status:', response.status);
      console.log('API: Response data:', response.data);
      
      if (response.data.users && response.data.users.length > 0) {
        console.log('API: User found:', response.data.users[0]);
        return response.data.users[0];
      }
      console.log('API: No user found');
      return null;
    } catch (error) {
      console.error('API: Error fetching user by telegram ID:', error);
      return null;
    }
  }

  // Получить сделки пользователя
  async getUserDeals(userId: string, status?: string): Promise<Deal[]> {
    try {
      const url = status 
        ? `/api/deals?userId=${userId}&status=${status}`
        : `/api/deals?userId=${userId}`;
      
      const response = await this.client.get<ApiResponse<{ deals: Deal[] }>>(url);
      
      if (response.data.ok && response.data.data) {
        return response.data.data.deals;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user deals:', error);
      return [];
    }
  }

  // Получить сделку по ID
  async getDeal(dealId: string, userId: string): Promise<Deal | null> {
    try {
      const response = await this.client.get<ApiResponse<Deal>>(
        `/api/deals/${dealId}?userId=${userId}`
      );
      
      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  }

  // Отправить результат (для исполнителя)
  async deliverResult(dealId: string, userId: string): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/deliver`,
        { userId }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error delivering result:', error);
      return false;
    }
  }

  // Подтвердить завершение (для заказчика)
  async confirmCompletion(dealId: string, userId: string): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/confirm`,
        { userId }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error confirming completion:', error);
      return false;
    }
  }

  // Подать жалобу
  async submitComplaint(
    dealId: string, 
    userId: string, 
    reason: string, 
    description: string
  ): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/complaint`,
        { userId, reason, description }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      return false;
    }
  }

  // Получить сообщения чата
  async getChatMessages(dealId: string): Promise<Message[]> {
    try {
      const response = await this.client.get<ApiResponse<{ messages: Message[] }>>(
        `/api/deals/${dealId}/messages`
      );
      
      if (response.data.ok && response.data.data) {
        return response.data.data.messages;
      }
      return [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  // Отправить сообщение в чат
  async sendMessage(
    dealId: string, 
    senderId: string, 
    content: string, 
    isFromCustomer: boolean
  ): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/messages`,
        { senderId, content, isFromCustomer }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}
