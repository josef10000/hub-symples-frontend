import { api } from "./api";

export type MediaItem = {
  name: string;
  type: "image" | "audio" | "file";
  url: string;
};

type MediaResponse = {
  images: MediaItem[];
  audio: MediaItem[];
  files: MediaItem[];
};

export const mediaService = {
  async getAll(): Promise<MediaItem[]> {
    const { data } = await api.get<MediaResponse>("/media-api");

    return [
      ...(data.images || []),
      ...(data.audio || []),
      ...(data.files || []),
    ];
  },

  async upload(file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/media-api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  async delete(name: string) {
    await api.delete(`/media-api/${name}`);
  },
};
