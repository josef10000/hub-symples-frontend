import React from 'react';
import { X, Check, AlertTriangle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'success' | 'danger' | 'info' | 'warning';
  children: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  type = 'info', 
  children, 
  confirmLabel = 'Confirmar', 
  onConfirm,
  showCancel = true
}) => {
  if (!isOpen) return null;

  const colors = {
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    danger: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  const icons = {
    success: <Check size={20} />,
    danger: <AlertTriangle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl relative overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
           <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg border ${colors[type]} flex items-center justify-center`}>
               {icons[type]}
             </div>
             <h3 className="text-lg font-bold text-white">{title}</h3>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-300 text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/30">
          {showCancel && (
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
          )}
          {onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`px-6 py-2 rounded-lg text-white font-bold text-sm shadow-lg transition-all transform hover:scale-105 ${
                type === 'danger' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/20' : 
                type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' :
                'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
