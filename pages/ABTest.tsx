import React, { useEffect, useState } from 'react';
import { abTestService } from '../services/abtest';
import { ABTestConfig } from '../types';
import { Split, Save, AlertCircle } from 'lucide-react';

const ABTest: React.FC = () => {
  const [config, setConfig] = useState<ABTestConfig | null>(null);

  useEffect(() => {
    abTestService.getConfig().then(setConfig);
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!config) return;
    const val = parseInt(e.target.value);
    setConfig({
      ...config,
      distributionA: val,
      distributionB: 100 - val
    });
  };

  const handleSave = () => {
    if (config) abTestService.updateConfig(config);
  };

  if (!config) return <div>Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <div>
        <h1 className="text-3xl font-bold text-white">Teste A/B</h1>
        <p className="text-slate-400 mt-1">Distribua tráfego entre robôs para testar fluxos e produtos.</p>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              <Split size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">Teste de Tráfego</h3>
              <p className="text-sm text-slate-400">{config.isEnabled ? 'Teste rodando atualmente' : 'Teste pausado'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-slate-400">Status:</span>
             <button 
                onClick={() => setConfig({...config, isEnabled: !config.isEnabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.isEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 text-amber-200 text-sm">
          <AlertCircle size={20} className="shrink-0 text-amber-400" />
          <p>Alterar a distribuição reseta as métricas da sessão atual. Certifique-se que ambos os robôs estão ONLINE antes de ativar.</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-indigo-400">Bot A: {config.botA_Id} ({config.distributionA}%)</span>
            <span className="text-rose-400">Bot B: {config.botB_Id} ({config.distributionB}%)</span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={config.distributionA} 
            onChange={handleSliderChange}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex gap-4">
             <div className="flex-1 bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20 text-center">
                <div className="text-indigo-400 font-bold text-lg">{config.distributionA}%</div>
                <div className="text-indigo-400/70 text-xs uppercase tracking-wide">Tráfego para Bot A</div>
             </div>
             <div className="flex-1 bg-rose-500/10 p-4 rounded-lg border border-rose-500/20 text-center">
                <div className="text-rose-400 font-bold text-lg">{config.distributionB}%</div>
                <div className="text-rose-400/70 text-xs uppercase tracking-wide">Tráfego para Bot B</div>
             </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 py-3 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
          >
            <Save size={20} />
            <span>Salvar Configuração</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ABTest;
