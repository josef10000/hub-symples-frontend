
import React, { useEffect, useState, useCallback } from 'react';
import { mediaService, MediaItem } from '../services/media';
import { 
  Music, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  Loader2, 
  X,
  ZoomIn,
  AlertTriangle
} from 'lucide-react';
import Modal from '../components/Modal';

const Media: React.FC = () => {
  // --- Estados ---
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do Modal de Visualização (Lightbox)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Estado do Modal de Exclusão
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  // --- Carregamento ---
  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mediaService.getAll();
      setItems(data);
    } catch (err) {
      setError("Falha ao carregar a biblioteca de mídia.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // --- Listeners de Teclado (ESC fecha modal) ---
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // --- Handlers ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       try {
         // Otimistic UI: Adiciona um placeholder enquanto carrega
         setLoading(true);
         const newItem = await mediaService.upload(e.target.files[0]);
         setItems(prev => [...prev, newItem]);
         setLoading(false);
       } catch (err) {
         setLoading(false);
         alert("Erro ao fazer upload.");
       }
    }
  };

  const handleDeleteRequest = (id: string) => {
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

  // --- Renderização de Cards Individuais ---
  const renderCard = (item: MediaItem) => {
    return (
      <div key={item.id} className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Área Visual (Topo) */}
        <div className="relative aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* TIPO: IMAGEM */}
          {item.type === 'image' && (
            item.url ? (
              <>
                <img 
                  src={item.url} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback se a imagem quebrar
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1e293b/475569?text=Erro+Imagem';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => setSelectedImage(item.url)}
                    className="p-2 bg-slate-800 rounded-full text-white hover:bg-emerald-600 transition-colors"
                    title="Visualizar"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-rose-500 gap-2">
                <AlertTriangle size={32} />
                <span className="text-[10px]">URL Inválida</span>
              </div>
            )
          )}

          {/* TIPO: AUDIO */}
          {item.type === 'audio' && (
            <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-emerald-500 transition-colors w-full px-4">
              <Music size={48} className="mb-2 opacity-50" />
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                <div className="bg-emerald-500 w-1/3 h-full"></div>
              </div>
              <audio 
                controls 
                className="absolute bottom-0 left-0 w-full h-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer" 
                src={item.url}
              />
            </div>
          )}

          {/* TIPO: ARQUIVO / OUTROS */}
          {item.type === 'file' && (
            <div className="text-slate-600 group-hover:text-blue-400 transition-colors">
              <FileText size={48} />
            </div>
          )}

          {/* Botão de Excluir */}
          <button 
            onClick={() => handleDeleteRequest(item.id)}
            className="absolute top-2 right-2 p-1.5 bg-slate-900/90 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white z-20"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Rodapé (Info) */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 z-10 relative">
          <div 
            className="text-sm font-medium text-slate-200 truncate" 
            title={item.name} 
          >
            {item.name || 'Sem Nome'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {item.type === 'image' && <ImageIcon size={10} />}
            {item.type === 'audio' && <Music size={10} />}
            {item.type === 'file' && <FileText size={10} />}
            <span>{item.type}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* --- Cabeçalho --- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Biblioteca de Mídia</h1>
          <p className="text-slate-400 mt-1">Gerencie imagens e áudios para uso nos robôs.</p>
        </div>
        <label className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer shadow-lg shadow-emerald-900/20 active:scale-95">
          <Upload size={18} />
          <span>Nova Mídia</span>
          <input type="file" className="hidden" accept="image/*,audio/*" onChange={handleUpload} />
        </label>
      </div>

      {/* --- Conteúdo --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
          <p>Carregando arquivos...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-xl text-center">
          <p>{error}</p>
          <button onClick={loadMedia} className="mt-4 text-sm underline hover:text-rose-300">Tentar Novamente</button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <ImageIcon size={32} />
           </div>
           <p>Sua galeria está vazia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
          {items.map(item => renderCard(item))}
        </div>
      )}

      {/* --- Modal de Visualização de Imagem (Lightbox) --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)} 
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Visualização" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain border border-slate-700"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* --- Modal de Confirmação de Exclusão --- */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, id: null})}
        title="Excluir Arquivo"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={executeDelete}
      >
        <p>Tem certeza que deseja apagar este arquivo? Se ele estiver sendo usado por algum bot, o fluxo pode quebrar.</p>
      </Modal>
    </div>
  );
};

export default Media;
