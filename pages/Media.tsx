import React, { useEffect, useState } from "react";
import { Upload, Trash2, Music, Image as ImageIcon } from "lucide-react";
import { mediaService } from "../services/media";

export type MediaItem = {
  name: string;
  type: "image" | "audio" | "file";
  url: string;
};

const Media: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    mediaService.getAll().then((data) => {
      const merged: MediaItem[] = [
        ...(data.images || []),
        ...(data.audio || []),
        ...(data.files || []),
      ];
      setItems(merged);
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    await mediaService.upload(e.target.files[0]);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Biblioteca de Mídia</h1>

        <label className="cursor-pointer flex gap-2 bg-emerald-600 px-4 py-2 rounded-lg text-white">
          <Upload size={18} />
          Upload
          <input
            type="file"
            hidden
            accept="image/*,audio/*"
            onChange={handleUpload}
          />
        </label>
      </div>

      {items.length === 0 && (
        <div className="text-slate-400 text-center mt-20">
          Nenhuma mídia enviada ainda.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {items.map((item) => (
          <div
            key={item.url}
            className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
          >
            <div className="h-32 bg-slate-950 flex items-center justify-center">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={36} className="text-slate-500" />
              )}
            </div>

            <div className="p-2 text-xs text-slate-300 truncate">
              {item.name}
            </div>

            <div className="px-2 pb-2 text-[10px] text-slate-500 uppercase">
              {item.type === "image" && "🖼️ Imagem"}
              {item.type === "audio" && "🎧 Áudio"}
              {item.type === "file" && "📄 Arquivo"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;


