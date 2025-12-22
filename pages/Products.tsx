
import React, { useEffect, useState } from 'react';
import { productService } from '../services/products';
import { Product, ProductType } from '../types';
import { Plus, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modals state
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});
  const [editModal, setEditModal] = useState<{isOpen: boolean, product: Product | null, newName: string}>({isOpen: false, product: null, newName: ''});

  useEffect(() => {
    productService.getAll().then(data => {
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => setProducts([]));
  }, []);

  const getTypeColor = (type: ProductType) => {
    switch(type) {
      case ProductType.MAIN: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case ProductType.ORDER_BUMP: return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case ProductType.UPSELL: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case ProductType.DOWNSELL: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const executeDelete = () => {
    if (deleteModal.id) {
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
      // In real app: await productService.delete(deleteModal.id);
    }
  };

  const openEdit = (product: Product) => {
    setEditModal({ isOpen: true, product, newName: product.name });
  };

  const executeEdit = () => {
    if (editModal.product && editModal.newName) {
       setProducts(prev => prev.map(p => p.id === editModal.product!.id ? { ...p, name: editModal.newName } : p));
       // In real app: await productService.update(id, { name: newName });
    }
  };

  // Safe iterations
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Produtos</h1>
          <p className="text-slate-400 mt-1">Gerencie produtos digitais, upsells e cross-sells.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors">
          <Plus size={18} />
          <span>Adicionar Produto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeProducts.map((product) => (
          <div key={product.id} className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 flex flex-col group hover:border-slate-700 transition-all">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getTypeColor(product.type)}`}>
                  {product.type}
                </div>
                <div className="font-bold text-white text-lg flex items-center">
                  <span className="text-sm text-slate-500 mr-1">R$</span>
                  {product.price.toFixed(2)}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                 <ArrowRight size={12} />
                 <span>Etapa do Fluxo: </span>
                 <span className="font-mono text-emerald-400">{product.flowStep || 'N/A'}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-b-xl">
               <button 
                 onClick={() => openEdit(product)}
                 className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                 title="Editar"
               >
                 <Edit2 size={14} /> Editar
               </button>
               <button 
                 onClick={() => confirmDelete(product.id)}
                 className="flex items-center gap-2 text-rose-500 hover:text-rose-400 text-sm font-medium transition-colors"
                 title="Excluir"
               >
                 <Trash2 size={14} /> Excluir
               </button>
            </div>
          </div>
        ))}
        
        {/* Empty State / Add New Card */}
        <button className="border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 hover:border-slate-700 hover:bg-slate-800/50 transition-all group">
           <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 mb-3 transition-colors">
             <Plus size={24} />
           </div>
           <span className="font-medium text-slate-500 group-hover:text-slate-300">Criar Novo Produto</span>
        </button>
      </div>

      {/* Delete Modal */}
      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({isOpen: false, id: null})}
        title="Excluir Produto"
        type="danger"
        confirmLabel="Excluir"
        onConfirm={executeDelete}
      >
        <p>Você tem certeza que deseja excluir este produto? Isso pode quebrar fluxos de venda ativos.</p>
      </Modal>

      {/* Edit Modal (Custom Content) */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({isOpen: false, product: null, newName: ''})}
        title="Editar Produto"
        type="info"
        confirmLabel="Salvar"
        onConfirm={executeEdit}
      >
        <div className="space-y-4">
          <p>Atualize as informações do produto abaixo.</p>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Produto</label>
            <input 
              type="text" 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              value={editModal.newName}
              onChange={(e) => setEditModal({...editModal, newName: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
