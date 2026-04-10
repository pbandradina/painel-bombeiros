import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
// Importe outras páginas aqui se existirem, ex:
// import Escalas from './pages/Escalas';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Se você tiver uma página de escalas, adicione a linha abaixo: */}
          {/* <Route path="/escalas" element={<Escalas />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;