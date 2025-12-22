
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { flowService } from '../services/flow';
import { botService } from '../services/bots';
import { FlowNode, Bot } from '../types';
import Modal from '../components/Modal';
import { 
  GitFork, 
  MessageSquare, 
  Type, 
  Menu, 
  Save,
  Trash2,
  X,
  MousePointer2,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize,
  Move
} from 'lucide-react';

const Flows: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // --- TRANSFORM STATE (Zoom & Pan) ---
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging Node Logic
  const [draggingNode, setDraggingNode] = useState<{id: string, startX: number, startY: number} | null>(null);
  
  // Connecting Logic
  const [connectingStart, setConnectingStart] = useState<{nodeId: string, x: number, y: number} | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number}>({x:0, y:0});

  // Modals State
  const [deleteNodeModal, setDeleteNodeModal] = useState<{isOpen: boolean, nodeId: string | null}>({isOpen: false, nodeId: null});
  const [deleteConnModal, setDeleteConnModal] = useState<{isOpen: boolean, source: string | null, target: string | null}>({isOpen: false, source: null, target: null});
  const [saveSuccessModal, setSaveSuccessModal] = useState(false);

  // Load Bots
  useEffect(() => {
    botService.getAll().then(data => {
      const safeData = Array.isArray(data) ? data : [];
      setBots(safeData);
      if (safeData.length > 0) setSelectedBotId(safeData[0].id);
    });
  }, []);

  // Load Flow when Bot changes
  useEffect(() => {
    if (selectedBotId) {
      loadFlow(selectedBotId);
    }
  }, [selectedBotId]);

  const loadFlow = async (botId: string) => {
    try {
      const data = await flowService.getFlow(botId);
      setNodes(Array.isArray(data) ? data : []);
      setSelectedNodeId(null);
      // Reset view on load (optional)
      setTransform({ x: 0, y: 0, scale: 1 });
    } catch (e) {
      setNodes([]);
    }
  };

  // --- ZOOM & PAN LOGIC ---
  const handleWheel = (e: React.WheelEvent) => {
    // Zoom on wheel
    if (e.ctrlKey || e.metaKey || true) { // Always zoom on wheel inside canvas
      e.stopPropagation(); // Prevent page scroll
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, transform.scale + delta), 3); // Limit zoom 0.1x to 3x
      
      setTransform(prev => ({ ...prev, scale: newScale }));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle mouse or Space+Click or just click on background starts Panning
    if (e.button === 0 || e.button === 1) { 
       setIsPanning(true);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
    setConnectingStart(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Calculate raw mouse position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Calculate "Virtual" coordinates (accounting for zoom/pan)
    const virtualX = (rawX - transform.x) / transform.scale;
    const virtualY = (rawY - transform.y) / transform.scale;

    setMousePos({ x: virtualX, y: virtualY });

    // Handle Panning (Background move)
    if (isPanning && !draggingNode) {
      setTransform(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
      return;
    }

    // Handle Node Dragging
    if (draggingNode) {
      // Delta needs to be divided by scale to move correctly relative to cursor
      const deltaX = e.movementX / transform.scale;
      const deltaY = e.movementY / transform.scale;

      setNodes(prev => prev.map(n => 
        n.id === draggingNode.id 
          ? { ...n, x: n.x + deltaX, y: n.y + deltaY } 
          : n
      ));
    }
  };

  // --- NODE HANDLERS ---
  const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop canvas panning
    setDraggingNode({ id, startX: e.clientX, startY: e.clientY });
    setSelectedNodeId(id);
  };

  // --- CONNECTION HANDLERS ---
  const startConnection = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Start from the right handle position (Fixed relative to node)
    const startX = node.x + 208; 
    const startY = node.y + 45; 

    setConnectingStart({ nodeId, x: startX, y: startY });
  };

  const completeConnection = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingStart && connectingStart.nodeId !== targetNodeId) {
      // Prevent duplicates
      const sourceNode = nodes.find(n => n.id === connectingStart.nodeId);
      if (sourceNode && !sourceNode.next?.includes(targetNodeId)) {
        const newNext = [...(sourceNode.next || []), targetNodeId];
        setNodes(prev => prev.map(n => n.id === connectingStart.nodeId ? { ...n, next: newNext } : n));
      }
    }
    setConnectingStart(null);
  };

  const confirmDeleteConnection = (sourceId: string, targetId: string) => {
    setDeleteConnModal({ isOpen: true, source: sourceId, target: targetId });
  };

  const executeDeleteConnection = () => {
    const { source, target } = deleteConnModal;
    if (source && target) {
      setNodes(prev => prev.map(n => {
        if (n.id === source) {
          return { ...n, next: n.next?.filter(id => id !== target) };
        }
        return n;
      }));
    }
  };

  // --- CRUD HANDLERS ---
  const addNode = (type: FlowNode['type']) => {
    if (!selectedBotId) return;
    
    // Add node to the center of the current view
    const viewCenterX = (-transform.x + (containerRef.current?.clientWidth || 800) / 2) / transform.scale;
    const viewCenterY = (-transform.y + (containerRef.current?.clientHeight || 600) / 2) / transform.scale;

    const newNode: FlowNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'message' ? 'Mensagem' : type === 'input' ? 'Entrada Usuário' : 'Menu Opções',
      content: '',
      trigger: '',
      x: viewCenterX - 100, // Center roughly
      y: viewCenterY - 50,
      next: []
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const updateNode = (field: keyof FlowNode, value: string) => {
    if (selectedNodeId) {
      setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, [field]: value } : n));
    }
  };
  
  const confirmDeleteNode = () => {
    if (selectedNodeId) {
      setDeleteNodeModal({ isOpen: true, nodeId: selectedNodeId });
    }
  };

  const executeDeleteNode = () => {
    const { nodeId } = deleteNodeModal;
    if (nodeId) {
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      setNodes(prev => prev.map(n => ({
        ...n,
        next: n.next?.filter(id => id !== nodeId)
      })));
      setSelectedNodeId(null);
    }
  };

  const handleSave = async () => {
    if (!selectedBotId) return;
    await flowService.saveFlow(selectedBotId, nodes);
    setSaveSuccessModal(true);
  };

  // --- ZOOM CONTROLS ---
  const zoomIn = () => setTransform(p => ({...p, scale: Math.min(p.scale + 0.2, 3)}));
  const zoomOut = () => setTransform(p => ({...p, scale: Math.max(p.scale - 0.2, 0.1)}));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // --- RENDER HELPERS ---
  const getPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dist = Math.abs(x2 - x1);
    const controlOffset = Math.max(dist * 0.5, 50); 
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
  };

  const renderConnections = () => {
    const paths = [];
    const safeNodes = Array.isArray(nodes) ? nodes : [];

    safeNodes.forEach(source => {
      // Robust check for next array
      if (Array.isArray(source.next)) {
        source.next.forEach(targetId => {
          const target = safeNodes.find(n => n.id === targetId);
          if (target) {
            const startX = source.x + 208; 
            const startY = source.y + 42;  
            const endX = target.x;
            const endY = target.y + 42;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            paths.push(
              <g key={`${source.id}-${target.id}`} className="group">
                <path d={getPath(startX, startY, endX, endY)} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer" />
                <path d={getPath(startX, startY, endX, endY)} stroke="#64748b" strokeWidth="2" fill="none" className="group-hover:stroke-emerald-500 transition-colors pointer-events-none" />
                <circle cx={endX} cy={endY} r="3" fill="#64748b" className="group-hover:fill-emerald-500"/>
                
                {target.trigger && (
                  <g className="pointer-events-none">
                    <rect x={midX - (target.trigger.length * 4) - 8} y={midY - 12} width={(target.trigger.length * 8) + 16} height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" className="opacity-90" />
                    <text x={midX} y={midY + 4} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">{target.trigger}</text>
                  </g>
                )}

                <foreignObject x={midX - 10} y={midY - 10} width="20" height="20" className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); confirmDeleteConnection(source.id, target.id); }} className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 cursor-pointer pointer-events-auto" title="Excluir Conexão">
                     <X size={12} />
                   </button>
                </foreignObject>
              </g>
            );
          }
        });
      }
    });

    if (connectingStart) {
      paths.push(
        <path key="dragging" d={getPath(connectingStart.x, connectingStart.y, mousePos.x, mousePos.y)} stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" fill="none" />
      );
    }
    return paths;
  };

  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const selectedNode = safeNodes.find(n => n.id === selectedNodeId);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitFork className="text-emerald-400" />
            Editor de Fluxos
          </h1>
          <p className="text-slate-400 text-sm">Arraste para mover o fundo. Scroll para Zoom. Sem match = IA Automática.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
             <span className="text-xs font-bold text-slate-500 uppercase">Robô:</span>
             <select value={selectedBotId} onChange={(e) => setSelectedBotId(e.target.value)} className="bg-transparent text-white text-sm outline-none cursor-pointer">
               {(Array.isArray(bots) ? bots : []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>
           </div>
           <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors font-medium text-sm shadow-lg shadow-emerald-900/20">
               <Save size={16} /> Salvar Fluxo
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 h-[calc(100vh-220px)] overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 bg-slate-900 border border-slate-800 rounded-xl flex flex-col z-20 shadow-xl">
           <div className="p-4 border-b border-slate-800">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Adicionar Bloco</div>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => addNode('message')} className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition-colors border border-slate-700 hover:border-blue-500/50 group">
                 <MessageSquare size={20} className="text-blue-400 group-hover:scale-110 transition-transform" /> 
                 <span className="text-[10px] text-slate-300">Mensagem</span>
               </button>
               <button onClick={() => addNode('input')} className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition-colors border border-slate-700 hover:border-amber-500/50 group">
                 <Type size={20} className="text-amber-400 group-hover:scale-110 transition-transform" /> 
                 <span className="text-[10px] text-slate-300">Entrada</span>
               </button>
               <button onClick={() => addNode('menu')} className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 p-3 rounded-lg transition-colors border border-slate-700 hover:border-emerald-500/50 group">
                 <Menu size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" /> 
                 <span className="text-[10px] text-slate-300">Menu</span>
               </button>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4">
              {selectedNode ? (
                 <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-emerald-400 uppercase">Editando Bloco</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {selectedNode.id}</span>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Título Interno</label>
                      <input type="text" value={selectedNode.label} onChange={(e) => updateNode('label', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500 outline-none" />
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 relative">
                       <label className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1"><Zap size={12} /> Condição de Entrada</label>
                       <p className="text-[10px] text-slate-500 mb-2 leading-tight">O que o cliente deve dizer no passo anterior?</p>
                       <input type="text" placeholder="Ex: 'Preço', 'Sim'" value={selectedNode.trigger} onChange={(e) => updateNode('trigger', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-amber-500 outline-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Conteúdo</label>
                      <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white h-40 focus:border-emerald-500 outline-none resize-none leading-relaxed" value={selectedNode.content} onChange={(e) => updateNode('content', e.target.value)} placeholder="Digite o que o robô deve falar..." />
                    </div>

                    <button onClick={confirmDeleteNode} className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/20 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors mt-4">
                        <Trash2 size={14}/> Excluir Bloco
                    </button>
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                    <MousePointer2 size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Selecione um bloco para editar.</p>
                 </div>
              )}
           </div>
        </div>

        {/* Canvas Container */}
        <div 
           className="flex-1 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden cursor-move"
           ref={containerRef}
           onWheel={handleWheel}
           onMouseDown={handleCanvasMouseDown}
           onMouseMove={handleCanvasMouseMove}
           onMouseUp={handleCanvasMouseUp}
           onMouseLeave={handleCanvasMouseUp}
        >
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-xl">
               <button onClick={zoomIn} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><ZoomIn size={18}/></button>
               <button onClick={resetView} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><Maximize size={18}/></button>
               <button onClick={zoomOut} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><ZoomOut size={18}/></button>
               <div className="border-t border-slate-800 my-1"></div>
               <div className="text-[10px] text-center text-slate-500 font-mono py-1">{Math.round(transform.scale * 100)}%</div>
            </div>

            {/* Transform Layer */}
            <div 
               style={{ 
                 transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                 transformOrigin: '0 0',
                 width: '100%',
                 height: '100%'
               }}
               className="w-full h-full"
            >
                {/* Infinite Grid */}
                <div className="absolute -inset-[5000px] opacity-10 pointer-events-none" 
                    style={{backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
                </div>

                {/* SVG Lines Layer */}
                <svg className="absolute -inset-[5000px] w-[10000px] h-[10000px] pointer-events-none z-0" style={{ transform: 'translate(5000px, 5000px)' }}>
                    {renderConnections()}
                </svg>

                {/* Nodes Layer */}
                {safeNodes.map(node => (
                    <div
                        key={node.id}
                        onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                        className={`absolute w-52 bg-slate-900 border rounded-lg shadow-xl z-10 select-none group transition-shadow cursor-default ${
                            selectedNodeId === node.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10' : 'border-slate-700 hover:border-slate-600'
                        }`}
                        style={{ left: node.x, top: node.y }}
                    >
                        {/* Header */}
                        <div className={`px-3 py-2 rounded-t-lg flex items-center justify-between border-b border-slate-800 ${
                            node.type === 'menu' ? 'bg-emerald-500/10' : node.type === 'input' ? 'bg-amber-500/10' : 'bg-slate-800'
                        }`}>
                            <div className="flex items-center gap-2">
                               {node.type === 'menu' ? <Menu size={14} className="text-emerald-400"/> : node.type === 'input' ? <Type size={14} className="text-amber-400"/> : <MessageSquare size={14} className="text-blue-400"/>}
                               <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{node.label}</span>
                            </div>
                        </div>
                        {node.trigger && (
                          <div className="px-3 py-1 bg-slate-950 border-b border-slate-800">
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-mono bg-amber-500/10 w-fit px-1.5 rounded" title={`Ativado se o usuário disser: ${node.trigger}`}>
                               <Zap size={10} /> IF: "{node.trigger}"
                            </div>
                          </div>
                        )}
                        <div className="p-3 text-xs text-slate-400 line-clamp-3 min-h-[40px] bg-slate-900">{node.content}</div>
                        
                        {/* Connectors */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair" onMouseUp={(e) => completeConnection(e, node.id)}>
                          <div className={`w-3 h-3 rounded-full border-2 ${connectingStart && connectingStart.nodeId !== node.id ? 'bg-emerald-500 border-white animate-pulse scale-125' : 'bg-slate-800 border-slate-500'}`}></div>
                        </div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair" onMouseDown={(e) => startConnection(e, node.id)}>
                          <div className="w-3 h-3 bg-slate-800 border-2 border-slate-500 rounded-full hover:bg-emerald-500 hover:border-emerald-300 transition-colors"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* MODALS (Same as before) */}
      <Modal isOpen={deleteNodeModal.isOpen} onClose={() => setDeleteNodeModal({isOpen: false, nodeId: null})} title="Excluir Bloco" type="danger" confirmLabel="Sim, Excluir" onConfirm={executeDeleteNode}>
        <p>Tem certeza que deseja excluir este bloco? Todas as conexões associadas a ele serão perdidas permanentemente.</p>
      </Modal>
      <Modal isOpen={deleteConnModal.isOpen} onClose={() => setDeleteConnModal({isOpen: false, source: null, target: null})} title="Remover Conexão" type="warning" confirmLabel="Remover" onConfirm={executeDeleteConnection}>
        <p>Deseja remover a ligação entre estes blocos?</p>
      </Modal>
      <Modal isOpen={saveSuccessModal} onClose={() => setSaveSuccessModal(false)} title="Fluxo Salvo" type="success" confirmLabel="OK" showCancel={false} onConfirm={() => setSaveSuccessModal(false)}>
        <p>O fluxo de conversa foi atualizado com sucesso no servidor.</p>
      </Modal>
    </div>
  );
};

export default Flows;
