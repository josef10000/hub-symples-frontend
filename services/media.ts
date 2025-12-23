
import { api } from './api';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'file';
  url: string;
}

// Helper para normalizar dados "sujos" do backend
const normalizeItem = (item: any): MediaItem => {
  // 1. Tenta encontrar o nome em várias propriedades comuns
  const rawName = item.name || item.fileName || item.filename || item.originalName || item.title || 'Sem Nome';
  
  // 2. Tenta encontrar a URL
  let url = item.url || item.uri || item.src || item.path || '';
  
  // CORREÇÃO DE URL RELATIVA: Se vier apenas "/uploads/...", adiciona o domínio da API
  // (Ajuste a URL base conforme seu ambiente real se necessário)
  if (url && url.startsWith('/')) {
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
    url = `${baseUrl}${url}`;
  }

  // 3. Normalização INTELIGENTE do Tipo
  // Converte para minúsculo e remove espaços
  let typeString = String(item.type || item.mime_type || '').toLowerCase();
  let normalizedType: 'image' | 'audio' | 'file' = 'file';

  // Detecção por extensão (caso o type venha vazio ou errado)
  const isImageExt = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(rawName) || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url);
  const isAudioExt = /\.(mp3|wav|ogg|m4a|aac|wma)$/i.test(rawName) || /\.(mp3|wav|ogg|m4a|aac|wma)$/i.test(url);

  if (typeString.includes('image') || isImageExt) {
    normalizedType = 'image';
  } else if (typeString.includes('audio') || isAudioExt) {
    normalizedType = 'audio';
  }

  return {
    id: String(item.id || Math.random()), // Garante que sempre tem ID
    name: rawName,
    type: normalizedType,
    url: url
  };
};

export const mediaService = {
  getAll: async (): Promise<MediaItem[]> => {
    try {
      // Usamos 'any' aqui para aceitar qualquer estrutura que o backend mandar
      const response = await api.get<any>('/media-api');
      
      let rawList: any[] = [];

      // Cenário 1: Backend retorna objeto separado { images: [], audio: [] }
      if (response && !Array.isArray(response)) {
        const images = Array.isArray(response.images) ? response.images : [];
        const audio = Array.isArray(response.audio) ? response.audio : [];
        const files = Array.isArray(response.files) ? response.files : [];
        rawList = [...images, ...audio, ...files];
      } 
      // Cenário 2: Backend retorna array direto [...]
      else if (Array.isArray(response)) {
        rawList = response;
      }

      // Aplica a normalização em CADA item
      return rawList.map(normalizeItem);

    } catch (error) {
      console.error("Erro ao processar mídia:", error);
      return [];
    }
  },

  upload: async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<any>('/media/upload', formData);
    return normalizeItem(response);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/media/${id}`);
  }
};
