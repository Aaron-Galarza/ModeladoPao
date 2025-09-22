import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaChevronRight, FaHome, FaTh, FaInfoCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useCartCount } from '../../hooks/useCartCount';
import '../../App.css';

const CartIcon = () => {
  const itemCount = useCartCount();

  return (
    <div className="relative cursor-pointer">
      <FaShoppingCart className="text-[1.6rem] text-gray-700" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 rounded-full text-[0.75rem] px-1.5 py-0.5
          bg-[var(--pastel-menta)] text-white">
          {itemCount}
        </span>
      )}
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsAnimating(false);
      setTimeout(() => setIsMenuOpen(false), 300);
    } else {
      setIsMenuOpen(true);
      setTimeout(() => setIsAnimating(true), 10);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-menu');
      const menuButton = document.querySelector('button[aria-label="Abrir menú"]');

      if (isMenuOpen && menu && !menu.contains(event.target as Node) &&
          menuButton && !menuButton.contains(event.target as Node)) {
        toggleMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin/login');
  };

  const mainCategories = [
    { name: "Inicio", path: "/", icon: <FaHome className="text-lg" /> },
    { name: "Catálogo", path: "/catalogo", icon: <FaTh className="text-lg" /> },
    { name: "Acerca de", path: "/info", icon: <FaInfoCircle className="text-lg" /> }
  ];

  return (
    <header className="bg-[var(--pastel-pink)] shadow-sm fixed top-0 w-full z-50 border-b border-gray-100">
      {/* Header escritorio */}
      <div className="hidden md:flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
        <Link to="/" className="flex flex-col text-center leading-none">
          <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
          <span className="text-[1.3rem] font-normal text-gray-600 font-poppins">PAO</span>
        </Link>

        <nav className="flex flex-1 justify-center">
          <ul className="flex list-none m-0 p-0 space-x-10">
            {mainCategories.map((category, index) => (
              <li key={index}>
                <Link 
                  to={category.path} 
                  className="nav-link text-gray-700 px-4 py-2 block rounded-lg hover:bg-[var(--pastel-menta)] transition-all duration-300 font-medium flex items-center space-x-2" // Cambiado aquí
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center space-x-6">
          <button 
            onClick={handleUserClick}
            className="flex items-center text-gray-700 font-bold hover:text-gray-900 transition-colors duration-300"
            aria-label="Iniciar sesión administrador"
          >
            <FaUserCircle className="text-[1.6rem]" />
          </button>
          <Link to="/cart" className="flex items-center text-gray-700 font-bold hover:text-gray-900 transition-colors duration-300">
            <CartIcon />
          </Link>
        </div>
      </div>

      {/* Header móvil */}
      <div className="md:hidden flex justify-between items-center h-16 px-4">
        <button onClick={toggleMenu} aria-label="Abrir menú" className="p-2">
          <FaBars className="text-[1.6rem] text-gray-700" />
        </button>
        <div className="flex-grow flex justify-center">
          <Link to="/" className="flex flex-col text-center leading-none">
            <span className="text-[1.4rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
            <span className="text-[1.1rem] font-normal text-gray-600 font-poppins">PAO</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleUserClick}
            aria-label="Iniciar sesión administrador"
            className="p-2"
          >
            <FaUserCircle className="text-[1.6rem] text-gray-700" />
          </button>
          <Link to="/cart" aria-label="Carrito de compras" className="p-2">
            <CartIcon />
          </Link>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={toggleMenu}
          />

          <div 
            id="mobile-menu"
            className={`fixed left-0 top-0 h-full w-72 max-w-[80vw] z-50 bg-white shadow-xl
                      transform transition-transform duration-300 ease-out
                      ${isAnimating ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex justify-between items-center p-5 bg-[var(--pastel-pink)] border-b border-gray-200"> {/* Cambiado aquí */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm border border-gray-200">
                  <span className="text-xl">🎨</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 font-cursive">Menú</h2>
              </div>
              <button onClick={toggleMenu} className="p-1">
                <FaTimes className="text-xl text-gray-700" />
              </button>
            </div>

            <div className="p-5 h-[calc(100%-140px)] overflow-y-auto">
              <ul className="space-y-4">
                {mainCategories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      to={category.path} 
                      onClick={toggleMenu}
                      className="flex items-center justify-between py-4 px-5 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group shadow-sm border border-gray-100" 
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-[var(--pastel-menta)]"> {/* Cambiado aquí */}
                          {category.icon}
                        </span>
                        <span className="text-gray-800 font-medium font-sans group-hover:text-[var(--pastel-menta)]"> {/* Cambiado aquí */}
                          {category.name}
                        </span>
                      </div>
                      <FaChevronRight className="text-gray-400 group-hover:text-[var(--pastel-menta)]" /> {/* Cambiado aquí */}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Sección adicional para destacar el pedido personalizado */}
              <div className="mt-8 p-5 bg-[var(--pastel-pink)] rounded-xl border border-[var(--pastel-menta)]"> {/* Cambiado aquí */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 font-cursive text-center">
                  ¿Necesitas algo especial?
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Crea tu pedido personalizado con tus diseños favoritos
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
              <button className="w-full bg-[var(--pastel-menta)] text-white font-bold py-3 px-4 rounded-full text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-sans"> {/* Cambiado aquí */}
                Pedido personalizado
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;