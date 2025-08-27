import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/design/header'
import Footer from './components/design/footer';
import HomePage from './pages/home';
import CatalogPage from './pages/catalog/catalog';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* El Header se renderiza aquí y siempre será visible */}
      <Header />
      
      <main className="flex-grow">
        {/* Este div resuelve el problema del contenido cortado */}
        <div className="pt-16 md:pt-20">
          <Routes>
            {/* La ruta principal "/" muestra el HomePage */}
            <Route path="/" element={<HomePage />} />
            
            {/* La ruta "/catalogo" muestra el CatalogPage */}
            <Route path="/catalogo" element={<CatalogPage />} />
          </Routes>
        </div>
      </main>
      
      {/* El Footer se renderiza aquí y siempre será visible */}
      <Footer />
    </div>
  );
}

export default App;