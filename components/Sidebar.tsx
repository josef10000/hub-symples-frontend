import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Smartphone, 
  Split, 
  ShoppingBag, 
  GitFork, 
  Image, 
  Users, 
  Clock, 
  Settings,
  BrainCircuit
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/' },
    { icon: Bot, label: 'Robôs', path: '/bots' },
    { icon: BrainCircuit, label: 'IA & Comportamento', path: '/ai' },
    { icon: Smartphone, label: 'WhatsApp', path: '/whatsapp' },
    { icon: Split, label: 'Teste A/B', path: '/abtest' },
    { icon: ShoppingBag, label: 'Produtos', path: '/products' },
    { icon: GitFork, label: 'Fluxos', path: '/flows' },
    { icon: Image, label: 'Mídia', path: '/media' },
    { icon: Users, label: 'Clientes', path: '/customers' },
    { icon: Clock, label: 'Timing', path: '/timing' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 min-h-screen flex flex-col fixed left-0 top-0 z-20 overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-emerald-400">HubSymples</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Admin Stage</p>
      </div>
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-slate-800 text-emerald-400 font-medium border border-slate-700' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v0.5.1 (PT-BR)
      </div>
    </aside>
  );
};

export default Sidebar;
