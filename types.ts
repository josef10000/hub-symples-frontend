export enum BotStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  PAUSED = 'PAUSADO', // Manually turned off
}

export interface Bot {
  id: string;
  name: string;
  phoneNumber: string;
  status: BotStatus;
  abTestGroup?: 'A' | 'B';
  stats: {
    conversations: number;
    sales: number;
    revenue: number;
  };
}

export enum ProductType {
  MAIN = 'PRINCIPAL',
  ORDER_BUMP = 'ORDER_BUMP',
  UPSELL = 'UPSELL',
  DOWNSELL = 'DOWNSELL',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  botId?: string; // Associated bot
  flowStep?: string; // Where it appears
}

export interface FlowNode {
  id: string; 
  type: 'message' | 'input' | 'menu'; // Removido 'ai'
  label: string;
  content: string;
  trigger: string; // O que o usuário precisa falar para ativar este bloco
  x: number;
  y: number;
  next?: string[]; // IDs dos nós conectados
}

export interface FlowData {
  botId: string;
  nodes: FlowNode[];
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name?: string;
  botId: string; // Which bot served them
  purchasedProductIds: string[];
  createdAt: string;
}

export interface ABTestConfig {
  id: string;
  isEnabled: boolean;
  name: string;
  botA_Id: string;
  botB_Id: string;
  distributionA: number; // e.g., 50
  distributionB: number; // e.g., 50
}

export interface TimingConfig {
  [key: string]: any; // Structure based on API response
}

export interface SalesMetric {
  date: string;
  amount: number;
  botName: string;
}

// --- AI Module Types ---

export enum AIMode {
  OFF = 'DESLIGADO',
  FALLBACK = 'FALLBACK', // Only responds if flow doesn't match
  ALWAYS_ACTIVE = 'SEMPRE_ATIVO', // Responds to everything
}

export interface AIConfig {
  botId: string;
  mode: AIMode;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface KnowledgeItem {
  id: string;
  botId: string;
  title: string;
  content: string;
}

export interface TrainingExample {
  id: string;
  botId: string;
  userMessage: string;
  idealResponse: string;
}

// --- WhatsApp Pairing Types ---

export type WhatsAppConnectionStatus = 'connected' | 'disconnected' | 'pairing' | 'cooldown' | 'blocked';

export interface PairingResponse {
  pairingCode: string;
  expiresIn: number; // seconds
}
