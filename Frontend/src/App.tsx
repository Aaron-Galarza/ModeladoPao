import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/design/header';
import Footer from './components/design/footer';
import HomePage from './pages/home';
import CatalogPage from './pages/catalog/catalog';
import AdminLogin from './pages/admin/login';
import AdminDashboard from './pages/admin/dashboard';
import ProductsManagement from './pages/managements/productsmanagement';
import VentasManagement from './pages/managements/ventasmanagement'; // Importación añadida
import { useAuthStore } from './components/admin/authStore';
import CartPage from './pages/checkout/cart';
import CheckoutPage from './pages/checkout/checkout';
import OrderConfirmationPage from './pages/checkout/orderconfirmation';
import { FaSpinner } from 'react-icons/fa';
import Info from './pages/info/info'
// Componente de layout para rutas públicas
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow pt-16 md:pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Componente de layout para rutas de administración (ahora con Header y padding)
const AdminLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow pt-16 md:pt-20">
      <Outlet />
    </main>
  </div>
);

// Componente de ruta protegida
const ProtectedRoute = () => {
  const { user, isAdmin, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-bold">
        <FaSpinner className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  }

  return user && isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

function App() {
  const { loading, user, isAdmin } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-bold">
        <FaSpinner className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas con el layout público */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/admin/login" element={user && isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
            <Route path="/info" element={<Info />} />

</Route>

          {/* Rutas de administración con su propio layout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductsManagement />} />
              <Route path="/admin/ventas" element={<VentasManagement />} /> {/* Nueva ruta para VentasManagement */}
            </Route>
          </Route>
          
          {/* Si ninguna ruta coincide, redirige a la página principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;