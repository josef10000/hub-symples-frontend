
import React, { useEffect, useState } from 'react';
import { timingService } from '../services/timing';
import { Clock, Save } from 'lucide-react';

const Timing: React.FC = () => {
  const [timing, setTiming] = useState<any>(null);

  useEffect(() => {
    timingService.getTiming().then(setTiming).catch(() => setTiming({}));
  }, []);

  if (!timing) return <div>Carregando...</div>;

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
