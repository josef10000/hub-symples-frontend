
import { api } from './api';
import { WhatsAppConnectionStatus, PairingResponse } from '../types';

export const whatsappService = {
  // Fetch real status from backend
  getStatus: async (botId: string): Promise<WhatsAppConnectionStatus> => {
    return api.get<WhatsAppConnectionStatus>(`/bots/${botId}/whatsapp/status`);
  },

  // Request a real Pairing Code from backend
  requestPairingCode: async (botId: string): Promise<PairingResponse> => {
    return api.post<PairingResponse>(`/bots/${botId}/whatsapp/pair`, {});
  },

  disconnect: async (botId: string): Promise<void> => {
    return api.post<void>(`/bots/${botId}/whatsapp/disconnect`, {});
  }
};
