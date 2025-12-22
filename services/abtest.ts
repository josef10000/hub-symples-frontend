import { ABTestConfig } from '../types';

const mockConfig: ABTestConfig = {
  id: 'test-1',
  isEnabled: true,
  name: 'Offer Copy Variation',
  botA_Id: 'bot-1',
  botB_Id: 'bot-2',
  distributionA: 50,
  distributionB: 50,
};

export const abTestService = {
  getConfig: async (): Promise<ABTestConfig> => {
    return new Promise(resolve => setTimeout(() => resolve(mockConfig), 400));
  },

  updateConfig: async (config: ABTestConfig): Promise<void> => {
    console.log('Updated AB Test', config);
  }
};
