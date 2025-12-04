import React, { useState } from 'react';
import { 
  FaClipboardList, FaCashRegister, FaBoxOpen, FaSignOutAlt, 
  FaThLarge, FaBars, FaTimes, FaTags 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../components/admin/authStore';

// Importa los componentes de gestión
import ProductsManagement from './../managements/productsmanagement';
import OrdersManagement from './../managements/ordersmanagement';
import VentasManagement from './../managements/ventasmanagement';
import CuponesManagement from './../managements/cuponesmanagement';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { /* user, isAdmin, */ logout } = useAuthStore();
  const [activeSection, setActiveSection] = useState<string>('welcome');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return <OrdersManagement />;
      case 'sales':
        return <VentasManagement />;
      case 'products':
        return <ProductsManagement />;
      case 'coupons':
        return <CuponesManagement />;
      default:
        return (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bienvenido al Panel</h1>
            <p className="text-gray-600 mb-6 md:mb-8">
              Resumen general de tu negocio.
            </p>
            
            {/* CORRECCIÓN GRILLA: grid-cols-1 para móvil, md:grid-cols-2 para tablet, xl:grid-cols-4 para monitor grande */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              
              {/* Pedidos Card */}
              <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaClipboardList className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 ml-4">Pedidos</h3>
                </div>
                <button 
                  onClick={() => handleNavigation('orders')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Gestionar
                </button>
              </div>
              
              {/* Ventas Card */}
              <div className="bg-white p-6 rounded-xl shadow border-t-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaCashRegister className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 ml-4">Ventas</h3>
                </div>
                <button 
                  onClick={() => handleNavigation('sales')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Ver Reportes
                </button>
              </div>
              
              {/* Productos Card */}
              <div className="bg-white p-6 rounded-xl shadow border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaBoxOpen className="text-purple-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 ml-4">Productos</h3>
                </div>
                <button 
                  onClick={() => handleNavigation('products')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Administrar
                </button>
              </div>

              {/* NUEVO: Cupones Card (Bloquesito) */}
              <div className="bg-white p-6 rounded-xl shadow border-t-4 border-pink-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 p-3 rounded-full">
                    <FaTags className="text-pink-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 ml-4">Cupones</h3>
                </div>
                <button 
                  onClick={() => handleNavigation('coupons')}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Configurar
                </button>
              </div>

            </div>
          </>
        );
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative"> 
      
      {/* Overlay Oscuro Transparente */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-80 bg-gray-900 text-white flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header del Sidebar */}
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
            MODELADO <span className="font-light text-blue-400">PAO</span>
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          <MenuButton 
            active={activeSection === 'welcome'}
            onClick={() => handleNavigation('welcome')}
            icon={<FaThLarge />}
            label="Inicio"
          />
          <MenuButton 
            active={activeSection === 'orders'}
            onClick={() => handleNavigation('orders')}
            icon={<FaClipboardList />}
            label="Pedidos"
          />
          <MenuButton 
            active={activeSection === 'sales'}
            onClick={() => handleNavigation('sales')}
            icon={<FaCashRegister />}
            label="Ventas"
          />
          <MenuButton 
            active={activeSection === 'products'}
            onClick={() => handleNavigation('products')}
            icon={<FaBoxOpen />}
            label="Productos"
          />
          <MenuButton 
            active={activeSection === 'coupons'}
            onClick={() => handleNavigation('coupons')}
            icon={<FaTags />}
            label="Cupones"
          />
        </nav>
        
        {/* Footer Sidebar (Logout) */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-6 py-4 text-lg font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform active:scale-95"
          >
            <FaSignOutAlt className="mr-3 text-xl" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* CORRECCIÓN: Mobile Header ahora es OSCURO (bg-gray-900 y text-white) */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center shadow-md z-30">
          <span className="font-bold text-lg tracking-wide">Panel de Control</span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-800 text-white"
          >
            <FaBars className="text-2xl" />
          </button>
        </div>

        {/* Contenido Scrollable */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Componente de Botón de Menú
interface MenuButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-6 py-4 text-lg font-medium rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg translate-x-1' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:pl-7'
    }`}
  >
    <span className={`mr-4 text-2xl ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

export default Dashboard;