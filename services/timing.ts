import { api } from './api';
import { TimingConfig } from '../types';

export const timingService = {
  getTiming: async (): Promise<TimingConfig> => {
    try {
      return await api.get<TimingConfig>('/api/timing');
    } catch (e) {
      return {
        typingDelay: 1500,
        messageGap: 1000,
        timeoutMinutes: 30
      };
    }
  }
};
