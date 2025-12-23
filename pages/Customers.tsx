
import React, { useEffect, useState, useCallback } from 'react';
import { customerService } from '../services/customers';
import { Customer } from '../types';
import { Search, User, Loader2 } from 'lucide-react';
import BackendOffline from '../components/BackendOffline';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await customerService.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(true);
      setCustomers([]);
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
        <h1 className="text-3xl font-bold text-white">Clientes</h1>
        <BackendOffline onRetry={loadData} />
      </div>
    );
  }

  if (loading) return <div className="flex h-96 items-center justify-center text-emerald-500"><Loader2 size={40} className="animate-spin" /></div>;

  const safeCustomers = Array.isArray(customers) ? customers : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 mt-1">Banco de dados de leads e compradores.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar nome ou telefone..." 
            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-sm border-b border-slate-800">
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Telefone</th>
              <th className="px-6 py-4 font-medium">Robô Origem</th>
              <th className="px-6 py-4 font-medium">Compras</th>
              <th className="px-6 py-4 font-medium">Data Entrada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {safeCustomers.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                   Nenhum cliente registrado.
                 </td>
               </tr>
            ) : (
                safeCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                        <User size={14} />
                        </div>
                        <span className="font-medium text-white">{customer.name || 'Desconhecido'}</span>
                    </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-sm">{customer.phoneNumber}</td>
                    <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {customer.botId}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                    {(Array.isArray(customer.purchasedProductIds) ? customer.purchasedProductIds : []).length} Itens
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
