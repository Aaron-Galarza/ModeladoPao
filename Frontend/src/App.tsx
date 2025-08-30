import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/design/header';
import Footer from './components/design/footer';
import HomePage from './pages/home';
import CatalogPage from './pages/catalog/catalog';
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/dashboard';
import { useAuthStore } from './components/admin/authStore';

// Componente de ruta protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuthStore();
  return user && isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas CON header y footer */}
          <Route path="/" element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow pt-16 md:pt-20">
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
          
          <Route path="/catalogo" element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow pt-16 md:pt-20">
                <CatalogPage />
              </main>
              <Footer />
            </div>
          } />
          
          <Route path="/admin/login" element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow pt-16 md:pt-20">
                <AdminLogin />
              </main>
              <Footer />
            </div>
          } />

          {/* Ruta de dashboard SIN header y footer público */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Redirecciones */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;