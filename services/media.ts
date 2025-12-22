
import { api } from './api';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'audio';
  name: string;
}

export const mediaService = {
  getAll: async (): Promise<MediaItem[]> => {
    return api.get<MediaItem[]>('/media');
  },

  upload: async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    // The api wrapper handles FormData automatically by not setting Content-Type json
    return api.post<MediaItem>('/media/upload', formData);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/media/${id}`);
  }
};
