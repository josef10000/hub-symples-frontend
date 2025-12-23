
import { api } from './api';
import { ABTestConfig } from '../types';

export const abTestService = {
  getConfig: async (): Promise<ABTestConfig> => {
    return api.get<ABTestConfig>('/abtest');
  },

  updateConfig: async (config: ABTestConfig): Promise<void> => {
    return api.put<void>('/abtest', config);
  }
};
