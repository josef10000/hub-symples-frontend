
import { api } from './api';
import { FlowNode } from '../types';

export const flowService = {
  // Get flow configuration for a specific bot
  getFlow: async (botId: string): Promise<FlowNode[]> => {
    // Let errors bubble up so the UI can show "Backend Offline"
    return api.get<FlowNode[]>(`/bots/${botId}/flow`);
  },

  // Save the entire flow layout and configuration
  saveFlow: async (botId: string, nodes: FlowNode[]): Promise<void> => {
    return api.post<void>(`/bots/${botId}/flow`, { nodes });
  },

  // Update a single node (optional optimization)
  updateNode: async (botId: string, nodeId: string, data: Partial<FlowNode>): Promise<void> => {
    return api.put<void>(`/bots/${botId}/flow/nodes/${nodeId}`, data);
  }
};
