
import { api } from './api';
import { AIConfig, KnowledgeItem, TrainingExample } from '../types';

export const aiService = {
  getConfig: async (botId: string): Promise<AIConfig> => {
    return api.get<AIConfig>(`/bots/${botId}/ai/config`);
  },

  updateConfig: async (botId: string, config: AIConfig): Promise<void> => {
    return api.put<void>(`/bots/${botId}/ai/config`, config);
  },

  getKnowledge: async (botId: string): Promise<KnowledgeItem[]> => {
    return api.get<KnowledgeItem[]>(`/bots/${botId}/ai/knowledge`);
  },

  addKnowledge: async (item: Omit<KnowledgeItem, 'id'>): Promise<KnowledgeItem> => {
    return api.post<KnowledgeItem>(`/bots/${item.botId}/ai/knowledge`, item);
  },

  deleteKnowledge: async (id: string): Promise<void> => {
    return api.delete<void>(`/ai/knowledge/${id}`);
  },

  getExamples: async (botId: string): Promise<TrainingExample[]> => {
    return api.get<TrainingExample[]>(`/bots/${botId}/ai/examples`);
  },

  addExample: async (item: Omit<TrainingExample, 'id'>): Promise<TrainingExample> => {
    return api.post<TrainingExample>(`/bots/${item.botId}/ai/examples`, item);
  },

  deleteExample: async (id: string): Promise<void> => {
    return api.delete<void>(`/ai/examples/${id}`);
  },

  preview: async (botId: string, message: string): Promise<string> => {
    const res = await api.post<{response: string}>(`/bots/${botId}/ai/preview`, { message });
    return res.response;
  }
};
