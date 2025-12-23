
import { api } from './api';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'file';
  url: string;
}

interface MediaApiResponse {
  images: any[];
  audio: any[];
  files: any[];
}

// Helper to sanitize backend data
const normalizeItem = (item: any, forcedType?: 'image' | 'audio' | 'file'): MediaItem => {
  const rawName = item.name || item.fileName || item.filename || item.title || 'Untitled';
  
  // Ensure we have a full URL. If backend sends relative path, prepend API URL.
  let url = item.url || item.uri || item.src || item.path || '';
  if (url && url.startsWith('/')) {
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
    url = `${baseUrl}${url}`;
  }

  // Determine type from backend context or fallback to string check
  let finalType: 'image' | 'audio' | 'file' = forcedType || 'file';
  
  if (!forcedType) {
    const typeStr = String(item.type || '').toLowerCase();
    if (typeStr.includes('image')) finalType = 'image';
    else if (typeStr.includes('audio')) finalType = 'audio';
  }

  return {
    id: String(item.id),
    name: rawName,
    type: finalType,
    url: url
  };
};

export const mediaService = {
  // 1. GET /media-api/list - Fetch strictly from backend
  getAll: async (): Promise<MediaItem[]> => {
    try {
      // The backend MUST return { images: [], audio: [], files: [] }
      const response = await api.get<MediaApiResponse>('/media-api/list');
      
      const images = (response.images || []).map(i => normalizeItem(i, 'image'));
      const audio = (response.audio || []).map(i => normalizeItem(i, 'audio'));
      const files = (response.files || []).map(i => normalizeItem(i, 'file'));

      // Flatten for UI
      return [...images, ...audio, ...files];
    } catch (error) {
      console.error("Error fetching media list (Is backend running?):", error);
      throw error; // Let UI handle the error state
    }
  },

  // 2. POST /media-api/upload - Upload real file
  upload: async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Send to backend, wait for real response with final URL
    const response = await api.post<any>('/media-api/upload', formData);
    return normalizeItem(response);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/media/${id}`);
  }
};
