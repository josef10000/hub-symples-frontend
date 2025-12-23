
import { api } from './api';
import { SalesMetric } from '../types';

export const metricsService = {
  getSalesData: async (): Promise<SalesMetric[]> => {
    return api.get<SalesMetric[]>('/metrics/sales');
  },
  
  getSummary: async () => {
    return api.get<any>('/metrics/summary');
  }
};
