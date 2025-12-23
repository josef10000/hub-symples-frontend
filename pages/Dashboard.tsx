
import React, { useEffect, useState, useCallback } from 'react';
import { metricsService } from '../services/metrics';
import { SalesMetric } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { DollarSign, Users, MessageCircle, Activity, Loader2 } from 'lucide-react';
import BackendOffline from '../components/BackendOffline';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SalesMetric[]>([]);
  const [summary, setSummary] = useState<any>({ revenue: 0, activeBots: 0, totalConversations: 0, conversionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [salesData, summaryData] = await Promise.all([
        metricsService.getSalesData(),
        metricsService.getSummary()
      ]);
      setData(salesData || []);
      setSummary(summaryData || { revenue: 0, activeBots: 0, totalConversations: 0, conversionRate: 0 });
    } catch (e) {
      setError(true);
      // Ensure data is zeroed on error
      setData([]);
      setSummary({ revenue: 0, activeBots: 0, totalConversations: 0, conversionRate: 0 });
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
        <h1 className="text-3xl font-bold text-white">Painel de Controle</h1>
        <BackendOffline onRetry={loadData} />
      </div>
    );
  }

  if (loading) return <div className="flex h-96 items-center justify-center text-emerald-500"><Loader2 size={40} className="animate-spin" /></div>;

  const Card = ({ title, value, icon: Icon, color }: any) => {
    const bgClass = {
      emerald: 'bg-emerald-500/10 text-emerald-400',
      blue: 'bg-blue-500/10 text-blue-400',
      indigo: 'bg-indigo-500/10 text-indigo-400',
      rose: 'bg-rose-500/10 text-rose-400'
    }[color as string] || 'bg-slate-800 text-slate-400';

    return (
      <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">{title}</h3>
          <div className={`p-2 rounded-lg ${bgClass}`}>
            <Icon size={20} />
          </div>
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Painel de Controle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Receita Total" value={`R$ ${summary.revenue.toLocaleString('pt-BR')}`} icon={DollarSign} color="emerald" />
        <Card title="Robôs Ativos" value={summary.activeBots} icon={Activity} color="blue" />
        <Card title="Conversas" value={summary.totalConversations} icon={MessageCircle} color="indigo" />
        <Card title="Taxa de Conversão" value={`${summary.conversionRate}%`} icon={Users} color="rose" />
      </div>

      <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-6">Visão Geral de Receita</h2>
        <div className="h-80">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }}/>
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="Vendas (R$)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
              <Activity size={32} className="mb-2 opacity-50" />
              <p>Sem dados de vendas registrados no período.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
