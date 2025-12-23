
import React from 'react';
import { ServerCrash, RefreshCw } from 'lucide-react';

interface Props {
  onRetry: () => void;
  message?: string;
}

const BackendOffline: React.FC<Props> = ({ onRetry, message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed animate-fade-in">
      <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 text-rose-500 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
        <ServerCrash size={40} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Backend Offline</h2>
      <p className="text-slate-400 max-w-md mb-8">
        {message || "Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta correta (3001) e tente novamente."}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold transition-all border border-slate-700 hover:border-slate-500 shadow-lg active:scale-95"
      >
        <RefreshCw size={20} />
        Tentar Reconectar
      </button>
    </div>
  );
};

export default BackendOffline;
