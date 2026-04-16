import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EscalaProvider } from './contexts/EscalaContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { DashboardSaldos } from './components/DashboardSaldos';
import { GerenciadorBombeiros } from './components/GerenciadorBombeiros';
import { CalendarioDinamico } from './components/CalendarioDinamico';
import { ImportadorExcel } from './components/ImportadorExcel';
import { Toaster } from 'sonner';

function App() {
  return (
    <LayoutProvider>
      <EscalaProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardSaldos />} />
              <Route path="/bombeiros" element={<GerenciadorBombeiros />} />
              <Route path="/escalas" element={<CalendarioDinamico />} />
              <Route path="/importar" element={<ImportadorExcel />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </Router>
      </EscalaProvider>
    </LayoutProvider>
  );
}

export default App;