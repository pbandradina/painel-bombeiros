import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Escalas from './pages/Escalas'; // <--- Importe a nova página

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bombeiros" element={<Home />} />
          <Route path="/escalas" element={<Escalas />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;