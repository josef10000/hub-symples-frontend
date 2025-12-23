
import React, { useEffect, useState, useCallback } from 'react';
import { mediaService, MediaItem } from '../services/media';
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Music, 
  FileText, 
  Loader2, 
  X,
  ZoomIn,
  Search,
  ServerCrash
} from 'lucide-react';
import Modal from '../components/Modal';

const Media: React.FC = () => {
  // --- STATE ---
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  
  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  // --- FETCH DATA ---
  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mediaService.getAll();
      setItems(data);
    } catch (err) {
      setError("Falha ao conectar com o servidor. Verifique se o backend está rodando na porta 3001.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // --- ACTIONS ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        // Upload real via POST
        const newItem = await mediaService.upload(e.target.files[0]);
        // Atualiza lista com o item devolvido pelo backend (URL real)
        setItems(prev => [...prev, newItem]);
      } catch (err) {
        alert("Erro no upload. O backend está conectado?");
      } finally {
        setUploading(false);
        // Reset input
        e.target.value = '';
      }
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (deleteModal.id) {
      try {
        await mediaService.delete(deleteModal.id);
        setItems(prev => prev.filter(i => i.id !== deleteModal.id));
      } catch (err) {
        alert("Erro ao excluir arquivo.");
      }
    }
  };

  // --- RENDER HELPERS ---
  const renderItem = (item: MediaItem) => {
    return (
      <div key={item.id} className="group bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative flex flex-col hover:border-slate-600 transition-all shadow-sm">
        
        {/* MEDIA PREVIEW AREA */}
        <div className="aspect-square bg-slate-950 relative flex items-center justify-center overflow-hidden">
          
          {item.type === 'image' && (
            <>
              <img 
                src={item.url} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay for Image */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => setLightboxUrl(item.url)}
                  className="p-2 bg-slate-800 text-white rounded-full hover:bg-emerald-600 transition-colors"
                  title="Ampliar"
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </>
          )}

          {item.type === 'audio' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-emerald-500 mb-3 border border-slate-700">
                <Music size={32} />
              </div>
              <audio 
                controls 
                className="w-full h-8 max-w-[180px]" 
                src={item.url} 
              />
            </div>
          )}

          {item.type === 'file' && (
            <div className="flex flex-col items-center text-slate-500">
              <FileText size={48} />
            </div>
          )}

          {/* Delete Button (Global) */}
          <button 
            onClick={() => confirmDelete(item.id)}
            className="absolute top-2 right-2 p-1.5 bg-rose-500/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 z-10"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* METADATA FOOTER */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 z-10">
          <p className="text-sm font-medium text-slate-200 truncate" title={item.name}>
            {item.name}
          </p>
          <div className="flex items-center gap-1 mt-1">
             {item.type === 'image' && <ImageIcon size={10} className="text-slate-500"/>}
             {item.type === 'audio' && <Music size={10} className="text-slate-500"/>}
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.type}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Biblioteca de Mídia</h1>
          <p className="text-slate-400 mt-1">Gerencie arquivos do servidor (Backend Conectado).</p>
        </div>
        
        <label className={`
          flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg 
          hover:bg-emerald-500 transition-all cursor-pointer shadow-lg shadow-emerald-900/20 active:scale-95
          ${uploading ? 'opacity-70 pointer-events-none' : ''}
        `}>
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          <span className="font-medium">{uploading ? 'Enviando ao Servidor...' : 'Upload Servidor'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,audio/*,video/*" 
            onChange={handleUpload} 
            disabled={uploading}
          />
        </label>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
           <ServerCrash size={40} className="text-rose-500 mb-3" />
           <h3 className="text-lg font-bold text-white mb-1">Backend Offline</h3>
           <p className="text-rose-300 mb-4">{error}</p>
           <button 
             onClick={loadLibrary}
             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
           >
             Tentar Reconectar
           </button>
        </div>
      )}

      {/* GRID CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
          <p>Buscando arquivos no servidor...</p>
        </div>
      ) : !error && items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center py-20 bg-slate-900/50">
           <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
             <Search size={32} />
           </div>
           <h3 className="text-lg font-bold text-white mb-1">Nenhum arquivo no servidor</h3>
           <p className="text-slate-500">Faça upload para salvar na nuvem/disco.</p>
        </div>
      ) : !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12 animate-fade-in">
          {items.map(renderItem)}
        </div>
      )}

      {/* LIGHTBOX OVERLAY (MODAL) */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={32} />
          </button>
          
          <img 
            src={lightboxUrl} 
            alt="Fullscreen" 
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, id: null})}
        title="Excluir do Servidor"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={executeDelete}
      >
        <p>Tem certeza que deseja remover este arquivo permanentemente do servidor?</p>
      </Modal>

    </div>
  );
};

export default Media;
