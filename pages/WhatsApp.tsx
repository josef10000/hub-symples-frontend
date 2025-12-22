
import React, { useState, useEffect, useRef } from 'react';
import { whatsappService } from '../services/whatsapp';
import { botService } from '../services/bots';
import { Bot, WhatsAppConnectionStatus } from '../types';
import { 
  Smartphone, 
  Link2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Ban, 
  Clock, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  ShieldAlert
} from 'lucide-react';

const WhatsApp: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  
  // State for the flow
  const [status, setStatus] = useState<WhatsAppConnectionStatus>('disconnected');
  const [loading, setLoading] = useState(false);
  
  // Pairing Code Data
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    botService.getAll().then((data) => {
      // Robust check
      const safeData = Array.isArray(data) ? data : [];
      setBots(safeData);
      if (safeData.length > 0) setSelectedBotId(safeData[0].id);
    }).catch(err => {
      console.error(err);
      setBots([]);
    });
  }, []);

  // Fetch status when bot selection changes
  useEffect(() => {
    if (selectedBotId) {
      checkStatus();
    }
    return () => clearTimer();
  }, [selectedBotId]);

  // Countdown logic
  useEffect(() => {
    if (expiresAt) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((expiresAt - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          setPairingCode(null); // Expire code visually
          clearTimer();
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    }
    return () => clearTimer();
  }, [expiresAt]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const checkStatus = async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const currentStatus = await whatsappService.getStatus(selectedBotId);
      setStatus(currentStatus);
      // Reset pairing state if status changed externally
      if (currentStatus === 'connected') {
        setPairingCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const response = await whatsappService.requestPairingCode(selectedBotId);
      setPairingCode(response.pairingCode);
      setExpiresAt(Date.now() + (response.expiresIn * 1000));
      setTimeLeft(response.expiresIn);
      setStatus('pairing');
    } catch (e) {
      console.error(e);
      // Handle error (e.g., set status to cooldown if API says so)
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedBotId) return;
    if (window.confirm('Tem certeza que deseja desconectar?')) {
      await whatsappService.disconnect(selectedBotId);
      setStatus('disconnected');
    }
  };

  // Helper to render status badge
  const renderStatusBadge = () => {
    const styles = {
      connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      disconnected: 'bg-slate-800 text-slate-400 border-slate-700',
      pairing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      cooldown: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      blocked: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    
    const labels = {
      connected: 'Conectado',
      disconnected: 'Desconectado',
      pairing: 'Aguardando Pareamento',
      cooldown: 'Em Cooldown',
      blocked: 'Sessão Bloqueada',
    };

    const icons = {
      connected: <Wifi size={14} />,
      disconnected: <WifiOff size={14} />,
      pairing: <Clock size={14} />,
      cooldown: <AlertTriangle size={14} />,
      blocked: <Ban size={14} />,
    };

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${styles[status]}`}>
        {icons[status]}
        <span>{labels[status]}</span>
      </div>
    );
  };

  // Defensive copy for render
  const safeBots = Array.isArray(bots) ? bots : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Conexão WhatsApp</h1>
          <p className="text-slate-400 mt-1">Gerencie a conexão usando Código de Pareamento.</p>
        </div>
        {renderStatusBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel: Bot Selection */}
        <div className="md:col-span-1 space-y-4">
          <label className="block text-sm font-medium text-slate-400">Selecionar Instância</label>
          <div className="space-y-2">
            {safeBots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedBotId(bot.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  selectedBotId === bot.id 
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                }`}
              >
                <div className="font-medium text-slate-200">{bot.name}</div>
                <div className="text-xs text-slate-500">{bot.phoneNumber}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Content Area */}
        <div className="md:col-span-2">
          <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
            
            {/* --- LOADING STATE --- */}
            {loading && (
              <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-emerald-500" size={32} />
                  <span className="text-sm font-medium text-slate-300">Processando...</span>
                </div>
              </div>
            )}

            {/* --- STATE: CONNECTED --- */}
            {status === 'connected' && (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Wifi size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sistema Online</h3>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Este robô está conectado com sucesso ao WhatsApp Web via WebSocket seguro.
                  </p>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="px-6 py-2.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all text-sm font-medium"
                >
                  Desconectar Sessão
                </button>
              </div>
            )}

            {/* --- STATE: PAIRING CODE DISPLAY --- */}
            {status === 'pairing' && pairingCode && timeLeft > 0 && (
              <div className="w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Parear Dispositivo</h3>
                  <p className="text-slate-400 text-sm">Insira o código abaixo no seu celular.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center relative group">
                  <div className="font-mono text-4xl md:text-5xl tracking-widest text-emerald-400 font-bold select-all">
                    {pairingCode}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                    title="Copiar Código"
                  >
                    {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20} />}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Expira em</div>
                  <div className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-rose-500' : 'text-slate-200'}`}>
                    {timeLeft}s
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 text-left text-sm text-slate-300 border border-slate-700/50">
                   <div className="font-bold mb-2 text-slate-200 flex items-center gap-2">
                     <Smartphone size={16} /> 
                     Instruções:
                   </div>
                   <ol className="list-decimal list-inside space-y-1 text-slate-400 ml-1">
                     <li>Abra o WhatsApp no celular</li>
                     <li>Vá em <span className="text-white font-medium">Aparelhos Conectados</span> &gt; <span className="text-white font-medium">Conectar um Aparelho</span></li>
                     <li>Toque em <span className="text-emerald-400 font-medium">Conectar com número de telefone</span></li>
                     <li>Insira o código exibido acima</li>
                   </ol>
                </div>
              </div>
            )}

            {/* --- STATE: DISCONNECTED / INITIAL --- */}
            {status === 'disconnected' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                  <Link2 size={40} />
                </div>
                <div className="max-w-xs mx-auto">
                  <h3 className="text-lg font-bold text-white mb-2">Sem Sessão Ativa</h3>
                  <p className="text-slate-500 text-sm">
                    Gere um código de pareamento para vincular esta instância ao WhatsApp.
                  </p>
                </div>
                <button 
                  onClick={handleConnect}
                  disabled={!selectedBotId || loading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Link2 size={20} />
                  Conectar WhatsApp
                </button>
              </div>
            )}

            {/* --- STATE: EXPIRED CODE --- */}
            {(status === 'pairing' && (!pairingCode || timeLeft === 0)) && (
               <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                    <Clock size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Código Expirado</h3>
                    <p className="text-slate-500 text-sm">O código expirou por segurança.</p>
                  </div>
                  <button 
                    onClick={handleConnect} 
                    className="text-emerald-400 font-medium hover:text-emerald-300 hover:underline flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Gerar Novo Código
                  </button>
               </div>
            )}

            {/* --- STATE: COOLDOWN --- */}
            {status === 'cooldown' && (
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cooldown Ativo</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    O WhatsApp limitou temporariamente as tentativas de conexão para este número.
                  </p>
                  <p className="text-slate-500 text-xs mt-4 bg-slate-950 py-2 rounded">
                    Tente novamente em algumas horas.
                  </p>
                </div>
              </div>
            )}

            {/* --- STATE: BLOCKED --- */}
            {status === 'blocked' && (
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Sessão Bloqueada</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    A conexão foi recusada pelos servidores. Isso acontece por tentativas rápidas de reconexão ou atividade suspeita.
                  </p>
                  <div className="mt-4 p-3 bg-rose-950/30 border border-rose-500/20 rounded text-xs text-rose-300">
                    Recomendação: Aguarde 24-48 horas ou use outro IP.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
