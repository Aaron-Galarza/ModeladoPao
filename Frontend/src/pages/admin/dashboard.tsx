import React, { useState } from 'react';
import { useAuthStore } from '../../components/admin/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiPackage, 
  FiUsers, 
  FiShoppingCart, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX,
  FiAlertCircle
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FiHome />, active: true },
    { path: '/admin/products', label: 'Productos', icon: <FiPackage />, active: false },
    { path: '/admin/categories', label: 'Categorías', icon: <FiBarChart2 />, active: false },
    { path: '/admin/customers', label: 'Clientes', icon: <FiUsers />, active: false },
    { path: '/admin/orders', label: 'Pedidos', icon: <FiShoppingCart />, active: false },
    { path: '/admin/settings', label: 'Configuración', icon: <FiSettings />, active: false },
  ];

  const statsData = [
    { title: 'Ventas Hoy', value: '$12,458', change: '+12%', color: '#4caf50' },
    { title: 'Pedidos', value: '184', change: '+8%', color: '#2196f3' },
    { title: 'Clientes Nuevos', value: '32', change: '+5%', color: '#ff9800' },
    { title: 'Productos', value: '156', change: '+3%', color: '#9c27b0' }
  ];

  const handleNavigation = (path: string, isActive: boolean) => {
    if (isActive) {
      navigate(path);
    } else {
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 3000);
    }
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 bg-white shadow-lg flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">ModeladoPao Admin</h1>
          <p className="text-sm text-gray-600">Panel de Administración</p>
        </div>
        
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.active)}
              className={`flex items-center w-full px-4 py-3 transition-colors text-left ${
                item.active 
                  ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-not-allowed'
              }`}
              disabled={!item.active}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
              {!item.active && (
                <span className="ml-2 text-xs text-orange-500">Próximamente</span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-800">Hola, Admin</p>
            <p className="text-xs text-gray-600">{user?.email || 'Administrador'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
          >
            <FiLogOut className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Botón de menú móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 md:hidden">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">ModeladoPao Admin</h1>
            </div>
            <nav className="mt-4">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path, item.active)}
                  className={`flex items-center w-full px-4 py-3 transition-colors text-left ${
                    item.active 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-not-allowed'
                  }`}
                  disabled={!item.active}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                  {!item.active && (
                    <span className="ml-2 text-xs text-orange-500">Próximamente</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded"
              >
                <FiLogOut className="mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
          
          {/* Notificación de "Próximamente" */}
          {showComingSoon && (
            <div className="fixed top-4 right-4 z-50 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-lg shadow-lg flex items-center animate-fadeIn">
              <FiAlertCircle className="mr-2" />
              <span>¡Esta funcionalidad estará disponible pronto!</span>
            </div>
          )}
          
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <span className="text-xs px-2 py-1 rounded-full mt-2 inline-block" 
                      style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Mensaje de bienvenida */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">¡Bienvenido al Panel de Administración!</h2>
            <p className="text-gray-600 mb-4">
              Desde aquí puedes gestionar productos, categorías, pedidos y configuraciones de tu tienda.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Nota:</strong> Por ahora solo el Dashboard está disponible. Las demás secciones 
                (Productos, Categorías, etc.) se habilitarán próximamente.
              </p>
            </div>
          </div>

          {/* Secciones de ejemplo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Pedidos Recientes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">#ORD-001</span>
                  <span className="text-green-600 text-sm font-medium">Completado</span>
                  <span className="text-gray-600">$45.90</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">#ORD-002</span>
                  <span className="text-yellow-600 text-sm font-medium">Pendiente</span>
                  <span className="text-gray-600">$89.50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">#ORD-003</span>
                  <span className="text-green-600 text-sm font-medium">Completado</span>
                  <span className="text-gray-600">$120.00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen General</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Productos activos:</span>
                  <span className="font-semibold text-gray-800">142</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Pedidos este mes:</span>
                  <span className="font-semibold text-gray-800">284</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Ingresos mensuales:</span>
                  <span className="font-semibold text-green-600">$8,742</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">Clientes registrados:</span>
                  <span className="font-semibold text-gray-800">1,248</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para la animación */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;