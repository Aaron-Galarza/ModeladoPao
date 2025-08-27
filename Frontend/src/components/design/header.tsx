import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Componente para el ícono del carrito con el contador
const CartIcon = () => {
  const [itemCount] = useState(0);

  return (
    <div className="relative cursor-pointer">
      <FaShoppingCart className="text-[1.6rem] text-gray-700" />
      <span className={`absolute -top-2 -right-2 rounded-full text-[0.75rem] px-1.5 py-0.5
        ${itemCount > 0 ? 'bg-orange-500 text-white' : 'bg-gray-500 text-white'}`}>
        {itemCount}
      </span>
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
const toggleMenu = () => {
  if (isMenuOpen) {
    // Iniciar animación de cierre (rápida)
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
      setIsAnimating(false); // Reiniciar animación al cerrar
    }, 300);
  } else {
    // Reiniciar animación antes de abrir
    setIsAnimating(false);
    setIsMenuOpen(true);
    setTimeout(() => {
      setIsAnimating(true); // Activar animación después de un pequeño retraso
    }, 10);
  }
};
  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        toggleMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Bloquear scroll
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-[var(--pastel-pink)] shadow-md fixed top-0 w-full z-50">
      {/* Header escritorio */}
      <div className="hidden md:flex justify-between items-center h-20 px-12">
        <Link to="/" className="flex flex-col text-center leading-none">
          <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
          <span className="text-[1.3rem] font-normal text-gray-600 font-poppins">PAO</span>
        </Link>

        <nav className="flex flex-1 justify-center">
          <ul className="flex list-none m-0 p-0 space-x-7">
            {[
              "Animales",
              "Fondo del mar",
              "Flores y hojas",
              "Apliques",
              "Princesas",
              "Personajes",
              "Kawaii",
              "Souvenirs"
            ].map((category, index) => (
              <li key={index}>
                <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center space-x-6">
          <Link to="/user">
            <FaUserCircle className="text-[1.6rem] text-gray-600" />
          </Link>
          <Link to="/cart">
            <CartIcon />
          </Link>
        </div>
      </div>

      {/* Header móvil */}
      <div className="md:hidden flex justify-between items-center h-16 px-4">
        <button ref={menuButtonRef} onClick={toggleMenu} aria-label="Abrir menú">
          <FaBars className="text-[1.6rem] text-gray-700" />
        </button>
        <div className="flex-grow flex justify-center">
          <Link to="/" className="flex flex-col text-center leading-none">
            <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
            <span className="text-[1.2rem] font-normal text-gray-600 font-poppins">PAO</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/user"><FaUserCircle className="text-[1.6rem] text-gray-700" /></Link>
          <Link to="/cart"><CartIcon /></Link>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <>
          <div 
            className={`fixed inset-0 z-40 bg-black transition-opacity ${
              isClosing ? 'duration-300 opacity-0' : 'duration-700 opacity-40'
            }`}
            onClick={toggleMenu}
          />
          
          <div 
            ref={menuRef}
            id="mobile-menu"
            className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-gradient-to-b from-[var(--pastel-pink)] to-[#fadde9]
              shadow-xl transform transition-transform duration-500 ease-out
              ${isClosing ? '-translate-x-full' : isAnimating ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{ 
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <div className="flex justify-between items-center p-5 bg-[var(--pastel-menta)] bg-opacity-90 shadow-sm">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm">
                  <span className="text-xl">💢</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 font-lora">CATEGORÍAS</h2>
              </div>
              <button onClick={toggleMenu}>
                <FaTimes className="text-2xl text-gray-700" />
              </button>
            </div>

            <div className="p-5 h-[calc(100%-140px)] overflow-y-auto">
              <ul className="space-y-3">
                {[
                  "Animales", "Fondo del mar", "Flores y hojas", "Apliques",
                  "Princesas", "Personajes", "Kawaii", "Souvenirs"
                ].map((category, index) => (
                  <li key={index}>
                    <Link 
                      to="/catalogo" 
                      onClick={toggleMenu}
                      className="flex items-center justify-between py-4 px-5 rounded-xl bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200 group shadow-sm"
                    >
                      <span className="text-gray-800 font-medium font-quicksand group-hover:text-[#d64d83]">
                        {category}
                      </span>
                      <FaChevronRight className="text-gray-400 group-hover:text-[var(--pastel-menta)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white bg-opacity-80 border-t border-gray-100">
              <button className="w-full bg-gradient-to-r from-[var(--pastel-menta)] to-[#6ab7a4] text-white font-bold py-3 px-4 rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-quicksand">
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
