import React, { useState } from 'react';
import { 
  FaClipboardList, FaCashRegister, FaBoxOpen, FaSignOutAlt, 
  FaThLarge, FaPlusCircle, FaChartLine, FaBox, FaBars, FaTimes 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../components/admin/authStore';
// Importa los componentes de gestión
import ProductsManagement from './../managements/productsmanagement';
import OrdersManagement from './../managements/ordersmanagement';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();
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
        return (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Gestión de Ventas</h2>
            <p className="text-gray-600">Aquí podrás gestionar y analizar tus ventas.</p>
          </div>
        );
      case 'products':
        return <ProductsManagement />;
      default:
        return (
          <>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bienvenido al Panel de Administración</h1>
            <p className="text-gray-600 mb-6 md:mb-8">
              Desde aquí puedes gestionar pedidos, ventas y productos de tu negocio.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
              {/* Pedidos Card */}
              <div className="dashboard-card bg-white p-4 md:p-6 rounded-xl shadow border-t-4 border-blue-500">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                    <FaClipboardList className="text-blue-600 text-lg md:text-xl" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 ml-3 md:ml-4">Pedidos</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  Gestiona y realiza seguimiento a los pedidos de tus clientes.
                </p>
                <button 
                  onClick={() => handleNavigation('orders')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 md:py-2 md:px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
                >
                  Gestionar Pedidos
                </button>
              </div>
              
              {/* Ventas Card */}
              <div className="dashboard-card bg-white p-4 md:p-6 rounded-xl shadow border-t-4 border-green-500">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="bg-green-100 p-2 md:p-3 rounded-full">
                    <FaCashRegister className="text-green-600 text-lg md:text-xl" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 ml-3 md:ml-4">Ventas</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  Controla y analiza el rendimiento de tus ventas.
                </p>
                <button 
                  onClick={() => handleNavigation('sales')}
                  className="w-full bg-green-500 hover:green-600 text-white py-2 px-3 md:py-2 md:px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
                >
                  Ver Reportes
                </button>
              </div>
              
              {/* Productos Card */}
              <div className="dashboard-card bg-white p-4 md:p-6 rounded-xl shadow border-t-4 border-purple-500">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="bg-purple-100 p-2 md:p-3 rounded-full">
                    <FaBoxOpen className="text-purple-600 text-lg md:text-xl" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 ml-3 md:ml-4">Productos</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  Administra tu inventario y catálogo de productos.
                </p>
                <button 
                  onClick={() => handleNavigation('products')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 md:py-2 md:px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
                >
                  Administrar Productos
                </button>
              </div>
            </div>
            
            {/* Sección de Acciones Rápidas */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <button className="flex flex-col items-center justify-center p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                  <FaPlusCircle className="text-blue-500 text-xl md:text-2xl mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">Nuevo Pedido</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <FaChartLine className="text-green-500 text-xl md:text-2xl mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">Reporte de Ventas</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors duration-200">
                  <FaBox className="text-purple-500 text-xl md:text-2xl mb-1 md:mb-2" />
                  <span className="text-xs md:text-sm font-medium">Agregar Producto</span>
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          MODELADO <span className="font-light text-gray-400">PAO</span>
        </h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>

      {/* Sidebar Responsive */}
      <aside className={`
        w-full md:w-72 bg-gray-900 text-white flex flex-col p-4 md:p-5 shadow-xl
        fixed md:static inset-0 z-48 transform transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <div className="flex justify-between items-center md:hidden mb-6">
          <h2 className="text-xl font-bold">
            MODELADO <span className="font-light text-gray-400">PAO</span>
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <h2 className="hidden md:block text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 mt-2 md:mt-6">
          MODELADO <span className="font-light text-gray-400">PAO</span>
        </h2>
        
        <nav className="flex-1 space-y-2 md:space-y-3">
          <button
            onClick={() => handleNavigation('welcome')}
            className={`flex items-center w-full px-4 md:px-5 py-4 text-base md:text-lg font-medium rounded-lg md:rounded-xl transition-all duration-200 ${
              activeSection === 'welcome' 
                ? 'bg-blue-600 shadow-lg md:transform md:scale-105' 
                : 'hover:bg-gray-700 md:hover:transform md:hover:scale-105'
            }`}
          >
            <FaThLarge className="mr-4 text-2xl" />
            <span className="text-lg">Inicio</span>
          </button>
          
          <button
            onClick={() => handleNavigation('orders')}
            className={`flex items-center w-full px-4 md:px-5 py-4 text-base md:text-lg font-medium rounded-lg md:rounded-xl transition-all duration-200 ${
              activeSection === 'orders' 
                ? 'bg-blue-600 shadow-lg md:transform md:scale-105' 
                : 'hover:bg-gray-700 md:hover:transform md:hover:scale-105'
            }`}
          >
            <FaClipboardList className="mr-4 text-2xl" />
            <span className="text-lg">Pedidos</span>
          </button>
          
          <button
            onClick={() => handleNavigation('sales')}
            className={`flex items-center w-full px-4 md:px-5 py-4 text-base md:text-lg font-medium rounded-lg md:rounded-xl transition-all duration-200 ${
              activeSection === 'sales' 
                ? 'bg-blue-600 shadow-lg md:transform md:scale-105' 
                : 'hover:bg-gray-700 md:hover:transform md:hover:scale-105'
            }`}
          >
            <FaCashRegister className="mr-4 text-2xl" />
            <span className="text-lg">Ventas</span>
          </button>
          
          <button
            onClick={() => handleNavigation('products')}
            className={`flex items-center w-full px-4 md:px-5 py-4 text-base md:text-lg font-medium rounded-lg md:rounded-xl transition-all duration-200 ${
              activeSection === 'products' 
                ? 'bg-blue-600 shadow-lg md:transform md:scale-105' 
                : 'hover:bg-gray-700 md:hover:transform md:hover:scale-105'
            }`}
          >
            <FaBoxOpen className="mr-4 text-2xl" />
            <span className="text-lg">Productos</span>
          </button>
        </nav>
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-center mt-6 md:mt-8 px-4 md:px-5 py-4 text-base md:text-lg font-medium rounded-lg md:rounded-xl text-white bg-red-500 hover:bg-red-600 transition-all duration-200 md:hover:transform md:hover:scale-105"
        >
          <FaSignOutAlt className="mr-3 text-xl" />
          <span className="text-lg">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;