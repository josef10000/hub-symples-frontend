import { api } from "./api";

export type MediaItem = {
  name: string;
  type: "image" | "audio" | "file";
  url: string;
};

export const mediaService = {
  async getAll(): Promise<{
    images: MediaItem[];
    audio: MediaItem[];
    files: MediaItem[];
  }> {
    const res = await api.get("/media-api");
    return res.data;
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    await api.post("/media-api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

