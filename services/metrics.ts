import { SalesMetric } from '../types';

export const metricsService = {
  getSalesData: async (): Promise<SalesMetric[]> => {
    // Mock data for charts
    return [
      { date: 'Mon', amount: 1200, botName: 'Bot A' },
      { date: 'Tue', amount: 1500, botName: 'Bot A' },
      { date: 'Wed', amount: 1800, botName: 'Bot A' },
      { date: 'Thu', amount: 1400, botName: 'Bot A' },
      { date: 'Fri', amount: 2200, botName: 'Bot A' },
      { date: 'Mon', amount: 900, botName: 'Bot B' },
      { date: 'Tue', amount: 1100, botName: 'Bot B' },
      { date: 'Wed', amount: 1300, botName: 'Bot B' },
      { date: 'Thu', amount: 1000, botName: 'Bot B' },
      { date: 'Fri', amount: 1600, botName: 'Bot B' },
    ];
  },
  
  getSummary: async () => {
    return {
      revenue: 25430.00,
      activeBots: 2,
      totalConversations: 1450,
      conversionRate: 4.5
    };
  }
};
