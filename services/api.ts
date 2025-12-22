
// Base URL from environment variables or default to localhost for dev
const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  data?: any;
}

// --- MOCK DATABASE (LocalStorage) ---
// This ensures the app works even without the backend running
const STORAGE_KEY = 'hubsymples_mock_db_v1';

const getDb = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error("Mock DB corrupted", e); }
  
  // Default Mock Data
  return { 
    bots: [
      { id: 'b1', name: 'Atendimento Geral', phoneNumber: '5511999990001', status: 'ONLINE', stats: { conversations: 1240, sales: 45, revenue: 4500.00 } },
      { id: 'b2', name: 'Recuperação de Carrinho', phoneNumber: '5511999990002', status: 'PAUSADO', stats: { conversations: 85, sales: 12, revenue: 1200.00 } }
    ], 
    products: [
      { id: 'p1', name: 'E-book Master', description: 'Guia completo', price: 97.90, type: 'PRINCIPAL' },
      { id: 'p2', name: 'Mentoria Express', description: 'Call de 30min', price: 197.00, type: 'UPSELL' }
    ], 
    media: [], 
    flows: {} // Key: botId, Value: FlowNode[]
  };
};

const saveDb = (db: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

// --- MOCK API HANDLER ---
const mockRequest = async (method: string, endpoint: string, data?: any) => {
  console.warn(`[Mock API] Serving ${method} ${endpoint} (Backend Offline)`);
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency

  const db = getDb();
  const path = endpoint.replace(/^\//, '').split('/'); // ['bots', '123', 'status']

  // --- BOTS ---
  if (path[0] === 'bots') {
    // GET /bots
    if (path.length === 1 && method === 'GET') return db.bots;
    
    // POST /bots
    if (path.length === 1 && method === 'POST') {
      const newBot = { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9),
        status: 'OFFLINE',
        stats: { conversations: 0, sales: 0, revenue: 0 }
      };
      db.bots.push(newBot);
      saveDb(db);
      return newBot;
    }

    const botId = path[1];
    
    // GET /bots/:id
    if (path.length === 2 && method === 'GET') {
      return db.bots.find((b: any) => b.id === botId);
    }

    // PUT /bots/:id/status
    if (path.length === 3 && path[2] === 'status' && method === 'PUT') {
      const bot = db.bots.find((b: any) => b.id === botId);
      if (bot) {
        bot.status = data.status;
        saveDb(db);
      }
      return;
    }

    // PUT /bots/:id
    if (path.length === 2 && method === 'PUT') {
      const index = db.bots.findIndex((b: any) => b.id === botId);
      if (index !== -1) {
        db.bots[index] = { ...db.bots[index], ...data };
        saveDb(db);
        return db.bots[index];
      }
    }

    // DELETE /bots/:id
    if (path.length === 2 && method === 'DELETE') {
      db.bots = db.bots.filter((b: any) => b.id !== botId);
      saveDb(db);
      return;
    }

    // --- FLOWS (/bots/:id/flow) ---
    if (path.length === 3 && path[2] === 'flow') {
      if (method === 'GET') return db.flows[botId] || [];
      if (method === 'POST') {
        db.flows[botId] = data.nodes;
        saveDb(db);
        return;
      }
    }
  }

  // --- PRODUCTS ---
  if (path[0] === 'products') {
    if (path.length === 1 && method === 'GET') return db.products;
    
    if (path.length === 1 && method === 'POST') {
      const newProd = { ...data, id: Math.random().toString(36).substr(2, 9) };
      db.products.push(newProd);
      saveDb(db);
      return newProd;
    }

    if (path.length === 2 && method === 'PUT') {
       const idx = db.products.findIndex((p: any) => p.id === path[1]);
       if (idx !== -1) {
         db.products[idx] = { ...db.products[idx], ...data };
         saveDb(db);
         return db.products[idx];
       }
    }

    if (path.length === 2 && method === 'DELETE') {
      db.products = db.products.filter((p: any) => p.id !== path[1]);
      saveDb(db);
      return;
    }
  }

  // --- MEDIA ---
  if (path[0] === 'media') {
    if (path.length === 1 && method === 'GET') return db.media;
    
    if (path.length === 2 && path[1] === 'upload' && method === 'POST') {
      // Mock upload - extract file name from FormData if possible, or just fake it
      const newMedia = {
        id: Math.random().toString(36).substr(2, 9),
        url: 'https://via.placeholder.com/150', // Fake URL
        type: 'image', // Simplification
        name: 'Uploaded File'
      };
      db.media.push(newMedia);
      saveDb(db);
      return newMedia;
    }

    if (path.length === 2 && method === 'DELETE') {
      db.media = db.media.filter((m: any) => m.id !== path[1]);
      saveDb(db);
      return;
    }
  }

  return null;
};

// --- REAL API HANDLER ---
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  get: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      return await handleResponse(response);
    } catch (error) {
      return mockRequest('GET', endpoint) as Promise<T>;
    }
  },

  post: async <T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> => {
    try {
      const isFormData = data instanceof FormData;
      const headers: HeadersInit = isFormData 
        ? { ...options.headers }
        : { 'Content-Type': 'application/json', ...options.headers };

      const body = isFormData ? data : JSON.stringify(data);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers,
        body,
      });
      return await handleResponse(response);
    } catch (error) {
      return mockRequest('POST', endpoint, data) as Promise<T>;
    }
  },

  put: async <T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      return mockRequest('PUT', endpoint, data) as Promise<T>;
    }
  },

  delete: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      return await handleResponse(response);
    } catch (error) {
      return mockRequest('DELETE', endpoint) as Promise<T>;
    }
  }
};
