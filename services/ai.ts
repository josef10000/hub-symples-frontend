import { AIConfig, AIMode, KnowledgeItem, TrainingExample } from '../types';

// Mock data storage
let mockConfig: Record<string, AIConfig> = {
  'bot-1': {
    botId: 'bot-1',
    mode: AIMode.FALLBACK,
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: "You are a helpful sales assistant for HubSymples. Your goal is to sell digital products politely and concisely. Do not hallucinate prices."
  },
  'bot-2': {
    botId: 'bot-2',
    mode: AIMode.OFF,
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    maxTokens: 300,
    systemPrompt: "You are a customer support agent. Help with login issues and refund requests."
  }
};

let mockKnowledge: KnowledgeItem[] = [
  { id: 'k1', botId: 'bot-1', title: 'Refund Policy', content: 'Refunds are available within 7 days of purchase.' },
  { id: 'k2', botId: 'bot-1', title: 'Pricing', content: 'The main product costs $99.90.' }
];

let mockExamples: TrainingExample[] = [
  { id: 'e1', botId: 'bot-1', userMessage: 'Is it expensive?', idealResponse: 'It is an investment of only $99.90 for lifetime access.' }
];

export const aiService = {
  getConfig: async (botId: string): Promise<AIConfig> => {
    return new Promise(resolve => setTimeout(() => {
      resolve(mockConfig[botId] || {
        botId,
        mode: AIMode.OFF,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 250,
        systemPrompt: ''
      });
    }, 400));
  },

  updateConfig: async (botId: string, config: AIConfig): Promise<void> => {
    mockConfig[botId] = config;
    console.log(`Updated AI Config for ${botId}`, config);
    return new Promise(resolve => setTimeout(resolve, 300));
  },

  getKnowledge: async (botId: string): Promise<KnowledgeItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockKnowledge.filter(k => k.botId === botId)), 400));
  },

  addKnowledge: async (item: Omit<KnowledgeItem, 'id'>): Promise<KnowledgeItem> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    mockKnowledge.push(newItem);
    return newItem;
  },

  deleteKnowledge: async (id: string): Promise<void> => {
    mockKnowledge = mockKnowledge.filter(k => k.id !== id);
  },

  getExamples: async (botId: string): Promise<TrainingExample[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockExamples.filter(e => e.botId === botId)), 400));
  },

  addExample: async (item: Omit<TrainingExample, 'id'>): Promise<TrainingExample> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    mockExamples.push(newItem);
    return newItem;
  },

  deleteExample: async (id: string): Promise<void> => {
    mockExamples = mockExamples.filter(e => e.id !== id);
  },

  preview: async (botId: string, message: string): Promise<string> => {
    // Simulation of AI response
    return new Promise(resolve => setTimeout(() => {
      resolve(`[AI Simulation for ${botId}]: Based on your input "${message}", I would respond with a polite answer using the context provided.`);
    }, 1500));
  }
};
