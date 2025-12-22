import { api } from "./api";

export type MediaItem = {
  id: string;
  name: string;
  type: "images" | "audio" | "files";
  url: string;
};

export const mediaService = {
  async getAll(): Promise<{ data: MediaItem[] }> {
    const res = await api.get("/media");
    return res.data;
  },

  async upload(file: File): Promise<{ data: MediaItem }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  },
};
