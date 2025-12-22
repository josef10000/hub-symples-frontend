import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import WhatsApp from './pages/WhatsApp';
import ABTest from './pages/ABTest';
import Products from './pages/Products';
import Flows from './pages/Flows';
import Media from './pages/Media';
import Customers from './pages/Customers';
import Timing from './pages/Timing';
import Settings from './pages/Settings';
import AI from './pages/AI';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="bots" element={<Bots />} />
          <Route path="ai" element={<AI />} />
          <Route path="whatsapp" element={<WhatsApp />} />
          <Route path="abtest" element={<ABTest />} />
          <Route path="products" element={<Products />} />
          <Route path="flows" element={<Flows />} />
          <Route path="media" element={<Media />} />
          <Route path="customers" element={<Customers />} />
          <Route path="timing" element={<Timing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
