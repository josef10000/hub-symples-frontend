import { Customer } from '../types';

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 'c1', phoneNumber: '5511900001111', name: 'John Doe', botId: 'bot-1', purchasedProductIds: ['1'], createdAt: '2023-10-25T10:00:00Z' },
      { id: 'c2', phoneNumber: '5511900002222', name: 'Jane Smith', botId: 'bot-2', purchasedProductIds: ['2', '3'], createdAt: '2023-10-25T11:30:00Z' },
    ]), 600));
  }
};
