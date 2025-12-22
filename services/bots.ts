
import { api } from './api';
import { Bot, BotStatus } from '../types';

export const botService = {
  getAll: async (): Promise<Bot[]> => {
    return api.get<Bot[]>('/bots');
  },
  
  getById: async (botId: string): Promise<Bot> => {
    return api.get<Bot>(`/bots/${botId}`);
  },

  create: async (data: { name: string; phoneNumber: string }): Promise<Bot> => {
    return api.post<Bot>('/bots', data);
  },

  update: async (botId: string, data: Partial<Bot>): Promise<Bot> => {
    return api.put<Bot>(`/bots/${botId}`, data);
  },

  toggleStatus: async (botId: string, status: BotStatus): Promise<void> => {
    return api.put<void>(`/bots/${botId}/status`, { status });
  },

  delete: async (botId: string): Promise<void> => {
    return api.delete<void>(`/bots/${botId}`);
  }
};
