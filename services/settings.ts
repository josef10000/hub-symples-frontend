
import { api } from './api';

export const settingsService = {
  getSettings: async () => {
    return api.get<any>('/settings');
  },
  
  updateSettings: async (settings: any) => {
    return api.put<void>('/settings', settings);
  }
};
