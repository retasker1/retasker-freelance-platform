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
      
      if (response.data.data && response.data.data.users && response.data.data.users.length > 0) {
        console.log('API: User found:', response.data.data.users[0]);
        return response.data.data.users[0];
      }
      console.log('API: No user found');
      return null;
    } catch (error) {
      console.error('API: Error fetching user by telegram ID:', error);
      return null;
    }
  }

  // Получить сделки пользователя
  async getUserDeals(userId: string): Promise<Deal[]> {
    try {
      const response = await this.client.get<ApiResponse<Deal[]>>(
        `/api/deals?userId=${userId}`
      );
      
      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user deals:', error);
      return [];
    }
  }

  // Получить сделку по ID
  async getDeal(dealId: string): Promise<Deal | null> {
    try {
      const response = await this.client.get<ApiResponse<Deal>>(
        `/api/deals/${dealId}`
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

  // Создать сообщение
  async createMessage(dealId: string, senderId: string, content: string, isFromCustomer: boolean): Promise<Message | null> {
    try {
      const response = await this.client.post<ApiResponse<Message>>(
        `/api/deals/${dealId}/messages`,
        { senderId, content, isFromCustomer }
      );
      
      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating message:', error);
      return null;
    }
  }

  // Получить сообщения
  async getMessages(dealId: string): Promise<Message[]> {
    try {
      const response = await this.client.get<ApiResponse<Message[]>>(
        `/api/deals/${dealId}/messages`
      );
      
      if (response.data.ok && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Доставить результат
  async deliverDeal(dealId: string, freelancerId: string): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/deliver`,
        { userId: freelancerId }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error delivering deal:', error);
      return false;
    }
  }

  // Подтвердить сделку
  async confirmDeal(dealId: string, customerId: string): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/confirm`,
        { userId: customerId }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error confirming deal:', error);
      return false;
    }
  }

  // Создать жалобу
  async createComplaint(dealId: string, customerId: string, reason: string): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse>(
        `/api/deals/${dealId}/complaint`,
        { userId: customerId, reason, description: reason }
      );
      
      return response.data.ok;
    } catch (error) {
      console.error('Error creating complaint:', error);
      return false;
    }
  }


}
