
import React, { useEffect, useState } from 'react';
import { mediaService, MediaItem } from '../services/media';
import { Music, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';

const Media: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  useEffect(() => {
    mediaService.getAll().then(data => {
      setItems(Array.isArray(data) ? data : []);
    }).catch(() => setItems([]));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const newItem = await mediaService.upload(e.target.files[0]);
       setItems(prev => [...prev, newItem]);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const executeDelete = () => {
    if (deleteModal.id) {
      setItems(prev => prev.filter(i => i.id !== deleteModal.id));
      // In real app: mediaService.delete(id);
    }
  };

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Biblioteca de Mídia</h1>
          <p className="text-slate-400 mt-1">Áudios e Imagens para respostas do robô.</p>
        </div>
        <label className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer shadow-lg shadow-emerald-900/20">
          <Upload size={18} />
          <span>Upload Mídia</span>
          <input type="file" className="hidden" accept="image/*,audio/*" onChange={handleUpload} />
        </label>
      </div>

      {safeItems.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <ImageIcon size={32} />
           </div>
           <p>Nenhuma mídia encontrada. Faça upload para usar nos fluxos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {safeItems.map((item) => (
            <div key={item.id} className="group relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden aspect-square flex flex-col hover:border-slate-600 transition-colors shadow-sm">
              <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden">
                 {item.type === 'image' ? (
                   <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                 ) : (
                   <Music size={40} className="text-slate-600" />
                 )}
                 {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button 
                     onClick={() => confirmDelete(item.id)}
                     className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                     title="Excluir"
                   >
                     <Trash2 size={18}/>
                   </button>
                 </div>
              </div>
              <div className="p-3 bg-slate-900">
                <div className="text-xs font-medium text-slate-200 truncate" title={item.name}>{item.name}</div>
                <div className="text-[10px] text-slate-500 uppercase mt-1 flex items-center gap-1">
                  {item.type === 'audio' ? <Music size={10} /> : <ImageIcon size={10} />}
                  {item.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, id: null})}
        title="Excluir Arquivo"
        type="danger"
        confirmLabel="Excluir"
        onConfirm={executeDelete}
      >
        <p>Este arquivo pode estar sendo usado em fluxos ativos. A exclusão é permanente.</p>
      </Modal>
    </div>
  );
};

export default Media;
