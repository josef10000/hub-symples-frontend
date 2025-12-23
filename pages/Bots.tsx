
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { botService } from '../services/bots';
import { whatsappService } from '../services/whatsapp';
import { Bot as BotModel, BotStatus } from '../types';
import Modal from '../components/Modal';
import BackendOffline from '../components/BackendOffline';
import { 
  Bot, Play, Pause, Trash2, Plus, Smartphone, X, CheckCircle, Loader2, Copy, Clock, Wifi, ChevronRight
} from 'lucide-react';

const Bots: React.FC = () => {
  const [bots, setBots] = useState<BotModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [creationStep, setCreationStep] = useState<'form' | 'processing' | 'pairing' | 'success'>('form');
  const [formData, setFormData] = useState({ name: '', phoneNumber: '', connectNow: false });
  const [createdBot, setCreatedBot] = useState<BotModel | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const loadBots = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await botService.getAll();
      setBots(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(true);
      setBots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBots();
    return () => clearTimer();
  }, [loadBots]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleToggle = async (id: string, currentStatus: BotStatus) => {
    const newStatus = currentStatus === BotStatus.ONLINE ? BotStatus.PAUSED : BotStatus.ONLINE;
    try {
        await botService.toggleStatus(id, newStatus);
        setBots(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (e) {
        alert("Erro ao alterar status. Verifique a conexão.");
    }
  };

  const confirmDelete = (id: string) => setDeleteModal({ isOpen: true, id });

  const executeDelete = async () => {
    if (deleteModal.id) {
      try {
          await botService.delete(deleteModal.id);
          setBots(prev => prev.filter(b => b.id !== deleteModal.id));
      } catch (e) {
          alert("Erro ao excluir robô. Verifique a conexão.");
      }
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setCreationStep('processing');
    try {
      const newBot = await botService.create({ name: formData.name, phoneNumber: formData.phoneNumber });
      setCreatedBot(newBot);
      await loadBots();

      if (formData.connectNow) {
        const pairingResponse = await whatsappService.requestPairingCode(newBot.id);
        setPairingCode(pairingResponse.pairingCode);
        setTimeLeft(pairingResponse.expiresIn);
        
        timerRef.current = window.setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) { clearTimer(); return 0; }
            return prev - 1;
          });
        }, 1000);
        setCreationStep('pairing');
      } else {
        setCreationStep('success');
        setTimeout(() => closeModal(), 1500);
      }
    } catch (error) {
      alert("Falha ao criar robô. O backend está offline?");
      setCreationStep('form');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCreationStep('form');
    setFormData({ name: '', phoneNumber: '', connectNow: false });
    setPairingCode(null);
    setCreatedBot(null);
    clearTimer();
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (error) {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Orquestração de Robôs</h1>
             </div>
             <BackendOffline onRetry={loadBots} />
        </div>
    )
  }

  if (loading) return <div className="flex h-96 items-center justify-center text-emerald-500"><Loader2 size={40} className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Orquestração de Robôs</h1>
          <p className="text-slate-400 mt-1">Gerencie instâncias, status e atribuições.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Plus size={18} />
          <span>Novo Robô</span>
        </button>
      </div>

      {/* Grid */}
      {bots.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
              <Bot size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">Nenhum robô encontrado. Crie o primeiro para começar.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
            <div key={bot.id} className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${bot.status === BotStatus.ONLINE ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{bot.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Smartphone size={14} />
                        <span>{bot.phoneNumber || 'Sem Número'}</span>
                        </div>
                    </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${
                    bot.status === BotStatus.ONLINE 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                    {bot.status}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-800 mb-4">
                    <div className="text-center">
                    <div className="text-xs text-slate-500">Conversas</div>
                    <div className="font-semibold text-white">{bot.stats?.conversations || 0}</div>
                    </div>
                    <div className="text-center">
                    <div className="text-xs text-slate-500">Vendas</div>
                    <div className="font-semibold text-white">{bot.stats?.sales || 0}</div>
                    </div>
                    <div className="text-center">
                    <div className="text-xs text-slate-500">Receita</div>
                    <div className="font-semibold text-emerald-400">R$ {bot.stats?.revenue || 0}</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                    onClick={() => handleToggle(bot.id, bot.status)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        bot.status === BotStatus.ONLINE 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    >
                    {bot.status === BotStatus.ONLINE ? <Pause size={16} /> : <Play size={16} />}
                    {bot.status === BotStatus.ONLINE ? 'Pausar' : 'Ativar'}
                    </button>
                    <button 
                    onClick={() => confirmDelete(bot.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                    title="Excluir Robô"
                    >
                    <Trash2 size={18} />
                    </button>
                </div>
                </div>
                {bot.abTestGroup && (
                <div className="bg-slate-950/50 border-t border-slate-800 px-6 py-2 text-xs text-slate-500 flex justify-between items-center">
                    <span>Teste A/B Ativo</span>
                    <span className="font-mono bg-slate-800 text-slate-300 px-2 rounded">Grupo {bot.abTestGroup}</span>
                </div>
                )}
            </div>
            ))}
        </div>
      )}

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, id: null})}
        title="Excluir Robô"
        type="danger"
        confirmLabel="Sim, Excluir"
        onConfirm={executeDelete}
      >
        <p>Tem certeza que deseja excluir este robô? Todos os dados históricos e fluxos associados serão perdidos permanentemente.</p>
      </Modal>

      {/* CREATE BOT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg shadow-2xl relative overflow-hidden">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 {creationStep === 'pairing' ? <Wifi size={24} className="text-emerald-400"/> : <Bot size={24} className="text-emerald-400"/>}
                 {creationStep === 'pairing' ? 'Conectar WhatsApp' : 'Criar Novo Robô'}
               </h2>
               <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="p-8">
              {creationStep === 'form' && (
                <form onSubmit={handleCreateBot} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nome do Robô</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Assistente de Vendas 01"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Número WhatsApp (Opcional)</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: 5511999999999"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>
                  
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={formData.connectNow}
                          onChange={e => setFormData({...formData, connectNow: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-white">Associar WhatsApp Agora</span>
                        <span className="block text-xs text-slate-400">Gera um código de pareamento imediatamente após a criação.</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                      <span>Criar & Configurar</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </form>
              )}

              {creationStep === 'processing' && (
                <div className="py-10 text-center space-y-4">
                   <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto" />
                   <h3 className="text-white font-bold">Configurando seu robô...</h3>
                   <p className="text-slate-500 text-sm">Alocando recursos e gerando credenciais.</p>
                </div>
              )}

              {creationStep === 'pairing' && (
                <div className="text-center space-y-6 animate-fade-in">
                   <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg inline-block">
                     <span className="text-emerald-400 text-sm font-bold">Robô Criado: {createdBot?.name}</span>
                   </div>

                   <div>
                     <p className="text-slate-400 text-sm mb-4">Insira este código no seu celular para conectar:</p>
                     
                     <div className="relative group">
                       <div className="bg-slate-950 border border-slate-700 rounded-xl p-6 font-mono text-4xl tracking-widest text-white font-bold select-all">
                         {pairingCode}
                       </div>
                       <button 
                         onClick={handleCopyCode}
                         className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                       >
                         {copied ? <CheckCircle size={20} className="text-emerald-500"/> : <Copy size={20} />}
                       </button>
                     </div>
                   </div>

                   <div className="flex justify-center items-center gap-2 text-rose-400 font-mono font-bold bg-rose-500/5 py-1 px-3 rounded-full mx-auto w-fit">
                      <Clock size={16} />
                      <span>{timeLeft}s restantes</span>
                   </div>

                   <div className="bg-slate-800/50 text-left p-4 rounded-lg text-sm text-slate-400 space-y-1 border border-slate-700/50">
                      <p>1. Abra WhatsApp &gt; <strong className="text-slate-200">Aparelhos Conectados</strong></p>
                      <p>2. Toque em <strong className="text-slate-200">Conectar Aparelho</strong></p>
                      <p>3. Selecione <strong className="text-emerald-400">Conectar com número de telefone</strong></p>
                   </div>

                   <button 
                     onClick={closeModal}
                     className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold transition-colors border border-slate-700"
                   >
                     Já inseri o código
                   </button>
                </div>
              )}

              {creationStep === 'success' && (
                <div className="py-10 text-center space-y-4 animate-fade-in">
                   <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                     <CheckCircle size={32} />
                   </div>
                   <h3 className="text-white text-xl font-bold">Robô Criado com Sucesso!</h3>
                   <p className="text-slate-500 text-sm">Você pode configurar conexões depois na aba WhatsApp.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bots;
