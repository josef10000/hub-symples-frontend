
import React, { useEffect, useState, useCallback } from 'react';
import { aiService } from '../services/ai';
import { botService } from '../services/bots';
import { Bot, AIConfig, AIMode, KnowledgeItem, TrainingExample } from '../types';
import Modal from '../components/Modal';
import BackendOffline from '../components/BackendOffline';
import { 
  BrainCircuit, Save, BookOpen, Terminal, Zap, Plus, Trash2, Play, Loader2
} from 'lucide-react';

const AI: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge' | 'examples' | 'preview'>('config');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Preview State
  const [previewMsg, setPreviewMsg] = useState('');
  const [previewResponse, setPreviewResponse] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form States
  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '' });
  const [newExample, setNewExample] = useState({ userMessage: '', idealResponse: '' });

  // Modal State
  const [successModal, setSuccessModal] = useState(false);

  const init = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await botService.getAll();
      const safeData = Array.isArray(data) ? data : [];
      setBots(safeData);
      if (safeData.length > 0) setSelectedBotId(safeData[0].id);
      else {
          // If no bots, we can't load AI config, but it's not an API error per se, just empty state
          setLoading(false);
      }
    } catch (e) {
      setError(true);
      setBots([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (selectedBotId) {
      loadBotData(selectedBotId);
    }
  }, [selectedBotId]);

  const loadBotData = async (botId: string) => {
    setLoading(true);
    try {
      const [cfg, kb, ex] = await Promise.all([
         aiService.getConfig(botId),
         aiService.getKnowledge(botId),
         aiService.getExamples(botId)
      ]);
      setConfig(cfg || { botId, mode: AIMode.OFF, model: 'gpt-3.5-turbo', temperature: 0.7, maxTokens: 250, systemPrompt: '' });
      setKnowledge(Array.isArray(kb) ? kb : []);
      setExamples(Array.isArray(ex) ? ex : []);
      setPreviewResponse('');
      setPreviewMsg('');
    } catch (e) {
      // Trigger global error to show Backend Offline
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (selectedBotId && config) {
      try {
        await aiService.updateConfig(selectedBotId, config);
        setSuccessModal(true);
      } catch (e) {
        alert("Erro ao salvar. Backend offline?");
      }
    }
  };

  const handleAddKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.content) return;
    try {
      const item = await aiService.addKnowledge({ ...newKnowledge, botId: selectedBotId });
      setKnowledge([...knowledge, item]);
      setNewKnowledge({ title: '', content: '' });
    } catch (e) { alert("Erro ao adicionar."); }
  };

  const handleDeleteKnowledge = async (id: string) => {
    try {
        await aiService.deleteKnowledge(id);
        setKnowledge(knowledge.filter(k => k.id !== id));
    } catch (e) { alert("Erro ao deletar."); }
  };

  const handleAddExample = async () => {
    if (!newExample.userMessage || !newExample.idealResponse) return;
    try {
        const item = await aiService.addExample({ ...newExample, botId: selectedBotId });
        setExamples([...examples, item]);
        setNewExample({ userMessage: '', idealResponse: '' });
    } catch (e) { alert("Erro ao adicionar."); }
  };

  const handleDeleteExample = async (id: string) => {
    try {
        await aiService.deleteExample(id);
        setExamples(examples.filter(e => e.id !== id));
    } catch (e) { alert("Erro ao deletar."); }
  };

  const handlePreview = async () => {
    if (!previewMsg) return;
    setPreviewLoading(true);
    try {
        const res = await aiService.preview(selectedBotId, previewMsg);
        setPreviewResponse(res);
    } catch (e) {
        setPreviewResponse("Erro: Falha ao obter resposta da IA (Backend Offline?)");
    } finally {
        setPreviewLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">IA & Comportamento</h1>
        <BackendOffline onRetry={init} />
      </div>
    );
  }

  const safeBots = Array.isArray(bots) ? bots : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-emerald-400" />
            IA & Comportamento
          </h1>
          <p className="text-slate-400 mt-1">Configure integração OpenAI, personalidade e base de conhecimento.</p>
        </div>
        
        {safeBots.length > 0 && (
            <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-sm text-slate-400 px-2">Gerenciando:</span>
            <select 
                value={selectedBotId} 
                onChange={(e) => setSelectedBotId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
                {safeBots.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
            </div>
        )}
      </div>

      {loading ? (
          <div className="flex h-96 items-center justify-center text-emerald-500"><Loader2 size={40} className="animate-spin" /></div>
      ) : safeBots.length === 0 ? (
          <div className="bg-slate-900 p-10 rounded-xl text-center text-slate-500">
              Você precisa criar um robô antes de configurar a IA.
          </div>
      ) : !config ? (
           <div className="bg-slate-900 p-10 rounded-xl text-center text-slate-500">
              Carregando configuração...
           </div>
      ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button onClick={() => setActiveTab('config')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Configuração</button>
                <button onClick={() => setActiveTab('knowledge')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'knowledge' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Base de Conhecimento</button>
                <button onClick={() => setActiveTab('examples')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'examples' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Exemplos (Few-Shot)</button>
                <button onClick={() => setActiveTab('preview')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Simulador</button>
            </div>

            <div className="bg-slate-900 rounded-b-xl rounded-tr-xl border border-slate-800 p-8 min-h-[500px]">
                
                {/* CONFIGURATION TAB */}
                {activeTab === 'config' && (
                <div className="space-y-8 max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Modo de Operação IA</label>
                            <div className="grid grid-cols-3 gap-2">
                            {[AIMode.OFF, AIMode.FALLBACK, AIMode.ALWAYS_ACTIVE].map((mode) => (
                                <button
                                key={mode}
                                onClick={() => setConfig({...config, mode})}
                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                                    config.mode === mode 
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                                }`}
                                >
                                {mode.replace('_', ' ')}
                                </button>
                            ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                            {config.mode === AIMode.FALLBACK && "IA só responde quando os fluxos definidos não correspondem."}
                            {config.mode === AIMode.ALWAYS_ACTIVE && "IA lida com todas as respostas (Use com cuidado)."}
                            {config.mode === AIMode.OFF && "IA completamente desativada."}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Modelo OpenAI</label>
                            <select 
                            value={config.model}
                            onChange={(e) => setConfig({...config, model: e.target.value as any})}
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none"
                            >
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Rápido/Barato)</option>
                            <option value="gpt-4">GPT-4 (Alta Qualidade)</option>
                            <option value="gpt-4o">GPT-4o (Omni - Melhor)</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-400">Temperatura (Criatividade)</label>
                            <span className="text-sm text-emerald-400 font-mono">{config.temperature}</span>
                            </div>
                            <input 
                            type="range" min="0" max="1" step="0.1"
                            value={config.temperature}
                            onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-400">Max Tokens</label>
                            <span className="text-sm text-emerald-400 font-mono">{config.maxTokens}</span>
                            </div>
                            <input 
                            type="range" min="100" max="2000" step="50"
                            value={config.maxTokens}
                            onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Terminal size={18} className="text-purple-400" />
                            <label className="text-sm font-medium text-white">System Prompt (Contexto Global)</label>
                        </div>
                        <p className="text-xs text-slate-500">Defina a persona, regras estritas e limites. Este é o "cérebro" do bot.</p>
                        <textarea 
                            value={config.systemPrompt}
                            onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                            className="w-full h-[320px] bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm leading-relaxed focus:border-purple-500 outline-none resize-none"
                            placeholder="Você é um assistente útil..."
                        />
                    </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button onClick={handleSaveConfig} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                        <Save size={18} />
                        Salvar Configuração
                    </button>
                    </div>
                </div>
                )}

                {/* KNOWLEDGE BASE TAB */}
                {activeTab === 'knowledge' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List */}
                        <div className="lg:col-span-2 space-y-4">
                            {(Array.isArray(knowledge) ? knowledge : []).length === 0 && <div className="text-slate-500 text-center py-10">Nenhum item de conhecimento ainda.</div>}
                            {(Array.isArray(knowledge) ? knowledge : []).map((item) => (
                            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 group hover:border-slate-700 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                                        <BookOpen size={16} />
                                        {item.title}
                                    </h3>
                                    <button onClick={() => handleDeleteKnowledge(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-slate-400 text-sm line-clamp-2">{item.content}</p>
                            </div>
                            ))}
                        </div>

                        {/* Form */}
                        <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl h-fit">
                            <h3 className="text-white font-bold mb-4">Adicionar Conhecimento</h3>
                            <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Título (ex: Política de Reembolso)"
                                value={newKnowledge.title}
                                onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                            />
                            <textarea 
                                placeholder="Conteúdo..."
                                value={newKnowledge.content}
                                onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none h-32"
                            />
                            <button onClick={handleAddKnowledge} className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium">
                                <Plus size={18} />
                                Adicionar Item
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* EXAMPLES TAB */}
                {activeTab === 'examples' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List */}
                        <div className="lg:col-span-2 space-y-4">
                            {(Array.isArray(examples) ? examples : []).length === 0 && <div className="text-slate-500 text-center py-10">Nenhum exemplo ainda.</div>}
                            {(Array.isArray(examples) ? examples : []).map((item) => (
                            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 group hover:border-slate-700 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 w-full">
                                        <div className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mt-1 w-12 shrink-0">Usuário</span>
                                        <p className="bg-slate-800/50 px-2 py-1 rounded">{item.userMessage}</p>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-emerald-300">
                                        <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider mt-1 w-12 shrink-0">Bot</span>
                                        <p className="bg-emerald-900/10 px-2 py-1 rounded w-full">{item.idealResponse}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteExample(item.id)} className="text-slate-600 hover:text-rose-500 transition-colors ml-4">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Form */}
                        <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl h-fit">
                            <h3 className="text-white font-bold mb-4">Adicionar Exemplo</h3>
                            <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Mensagem do Usuário"
                                value={newExample.userMessage}
                                onChange={(e) => setNewExample({...newExample, userMessage: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none"
                            />
                            <textarea 
                                placeholder="Resposta Ideal da IA"
                                value={newExample.idealResponse}
                                onChange={(e) => setNewExample({...newExample, idealResponse: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none h-32"
                            />
                            <button onClick={handleAddExample} className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium">
                                <Plus size={18} />
                                Adicionar Exemplo
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* PREVIEW TAB */}
                {activeTab === 'preview' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 h-[400px] p-6 overflow-y-auto flex flex-col gap-4">
                        <div className="self-end bg-emerald-600 text-white px-4 py-2 rounded-l-xl rounded-tr-xl max-w-[80%] text-sm">
                        Pode simular uma mensagem de usuário aqui?
                        </div>
                        <div className="self-start bg-slate-800 text-slate-200 px-4 py-2 rounded-r-xl rounded-tl-xl max-w-[80%] text-sm">
                        Sim! Use o campo abaixo para testar sua configuração de IA sem enviar mensagens para clientes reais.
                        </div>
                        {previewResponse && (
                        <div className="self-start bg-slate-800 text-slate-200 px-4 py-2 rounded-r-xl rounded-tl-xl max-w-[80%] text-sm animate-fade-in border border-indigo-500/30">
                            <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Saída da IA</span>
                            {previewResponse}
                        </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input 
                        type="text" 
                        value={previewMsg}
                        onChange={(e) => setPreviewMsg(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
                        placeholder="Digite uma mensagem para testar..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                        />
                        <button 
                        onClick={handlePreview}
                        disabled={previewLoading || !previewMsg}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                        {previewLoading ? <Zap className="animate-spin" size={20} /> : <Play size={20} />}
                        Testar
                        </button>
                    </div>
                </div>
                )}

            </div>
          </>
      )}

      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="Configuração Salva"
        type="success"
        confirmLabel="OK"
        showCancel={false}
        onConfirm={() => setSuccessModal(false)}
      >
        <p>A configuração da IA foi atualizada com sucesso.</p>
      </Modal>
    </div>
  );
};

export default AI;
