import React, { useEffect, useState } from 'react';
import { settingsService } from '../services/settings';
import { Save, Shield, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await settingsService.updateSettings(settings);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setSuccessModalOpen(true);
    }, 800);
  };

  const updateField = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (!settings) return <div className="p-8 text-white">Carregando configurações...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações do Sistema</h1>
        <p className="text-slate-400 mt-1">Parâmetros de configuração global.</p>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Mensagem de Fallback Global</label>
          <textarea 
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
            value={settings.globalFallbackMessage}
            onChange={(e) => updateField('globalFallbackMessage', e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">Enviada quando o robô entra em um estado desconhecido.</p>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-400 mb-2">Número de Notificação Admin</label>
           <input 
              type="text" 
              value={settings.adminPhone}
              onChange={(e) => updateField('adminPhone', e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
           />
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg flex items-start gap-3">
           <Shield className="text-rose-500 mt-1" size={20} />
           <div>
             <h4 className="font-bold text-rose-400 text-sm">Botão de Pânico (Kill Switch)</h4>
             <p className="text-xs text-rose-300/70 mt-1">Parar todos os robôs ativos imediatamente. Use apenas em situações críticas.</p>
             <button className="mt-2 bg-slate-900 border border-rose-500/30 text-rose-400 px-3 py-1 rounded text-xs font-bold hover:bg-rose-500/20 transition-colors">Parar Todos os Robôs</button>
           </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
           <button 
             onClick={handleSave}
             disabled={loading}
             className="flex items-center gap-2 bg-slate-100 text-slate-900 px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors font-semibold disabled:opacity-50"
           >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
           </button>
        </div>
      </div>

      <Modal 
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Sucesso"
        type="success"
        showCancel={false}
        confirmLabel="OK"
        onConfirm={() => setSuccessModalOpen(false)}
      >
        <p>As configurações do sistema foram atualizadas com sucesso.</p>
      </Modal>
    </div>
  );
};

export default Settings;
