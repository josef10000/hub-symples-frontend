
import { api } from './api';
import { TimingConfig } from '../types';

export const timingService = {
  getTiming: async (): Promise<TimingConfig> => {
    // Strictly fetch from backend. No mocks.
    return api.get<TimingConfig>('/api/timing');
  }
};
