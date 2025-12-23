
import React, { useEffect, useState, useCallback } from 'react';
import { timingService } from '../services/timing';
import { Clock, Save, Loader2 } from 'lucide-react';
import BackendOffline from '../components/BackendOffline';

const Timing: React.FC = () => {
  const [timing, setTiming] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await timingService.getTiming();
      setTiming(data || {});
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Configuração de Timing</h1>
        <BackendOffline onRetry={loadData} />
      </div>
    );
  }

  if (loading) return <div className="flex h-96 items-center justify-center text-emerald-500"><Loader2 size={40} className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Configuração de Timing</h1>
        <p className="text-slate-400 mt-1">Controle delays de mensagens para simular comportamento humano.</p>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
           <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
             <Clock size={24} />
           </div>
           <div>
             <h3 className="font-bold text-white">Regras Globais de Tempo</h3>
             <p className="text-sm text-slate-400">Aplica-se a todos os robôs ativos.</p>
           </div>
        </div>

        <div className="grid gap-6">
          {Object.keys(timing || {}).length === 0 && <div className="text-slate-500">Sem configurações definidas.</div>}
          {Object.keys(timing || {}).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue={timing[key]}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">ms</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 py-3 rounded-lg hover:bg-slate-200 transition-colors font-semibold">
            <Save size={20} />
            <span>Atualizar Timing</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timing;
