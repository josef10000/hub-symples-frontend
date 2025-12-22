import { api } from './api';
import { WhatsAppConnectionStatus, PairingResponse } from '../types';

export const whatsappService = {
  // Simulate fetching the current detailed connection status
  getStatus: async (botId: string): Promise<WhatsAppConnectionStatus> => {
    // In a real app: return api.get(`/api/bot/status/${botId}`);
    
    // Simulating random states for UI testing
    return new Promise(resolve => setTimeout(() => {
      // Return 'disconnected' by default for flow testing
      // Change this to 'cooldown' or 'blocked' to test error states
      resolve('disconnected'); 
    }, 500));
  },

  // Request a new Pairing Code
  requestPairingCode: async (botId: string): Promise<PairingResponse> => {
    // In a real app: return api.post(`/api/bot/pairing`, { botId });

    console.log(`Requesting pairing code for ${botId}`);
    return new Promise(resolve => setTimeout(() => {
      // Simulate generating a code format like WhatsApp (4 sets of 2 chars or similar)
      const code = `${generateRandomString(4)}-${generateRandomString(4)}`;
      resolve({
        pairingCode: code.toUpperCase(),
        expiresIn: 60 // 60 seconds validity
      });
    }, 1500));
  },

  disconnect: async (botId: string) => {
    console.log(`Disconnecting bot ${botId}`);
    // api.post('/api/bot/disconnect', { botId })
  }
};

function generateRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 to avoid confusion
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
