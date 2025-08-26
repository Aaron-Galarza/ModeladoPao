import React, { useState } from 'react';
import { FaUserCircle, FaShoppingCart, FaSearch, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

// Componente para el ícono del carrito con el contador
const CartIcon = () => {
    const [itemCount] = useState(0);

    return (
        <div className="relative cursor-pointer">
            <FaShoppingCart className="text-[1.6rem] text-gray-700" />
            {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full text-[0.75rem] px-1.5 py-0.5">
                    {itemCount}
                </span>
            )}
            {itemCount === 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full text-[0.75rem] px-1.5 py-0.5">
                    {itemCount}
                </span>
            )}
        </div>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState(null);
    const [activeMobileCategory, setActiveMobileCategory] = useState(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleCategory = (categoryName) => {
        if (openCategory === categoryName) {
            setOpenCategory(null);
        } else {
            setOpenCategory(categoryName);
        }
        
        setActiveMobileCategory(categoryName);
    };

    return (
        <header className="bg-[var(--pastel-pink)] shadow-md">
            {/* Header de Escritorio */}
            <div className="hidden md:flex justify-between items-center h-20 px-12">
                {/* Sección del Logo */}
                <div className="flex flex-col text-center leading-none">
                    <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
                    <span className="text-[1.2rem] font-normal text-gray-600 font-poppins">PAO</span>
                </div>

                {/* Sección de Navegación */}
                <nav className="flex flex-1 justify-center">
                    <ul className="flex list-none m-0 p-0 space-x-4" style={{ fontFamily: 'var(--font-nav)' }}>
                        <li className="relative group">
                            <a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Animales
                            </a>
                            <ul className="hidden group-hover:block absolute top-full left-0 bg-[var(--background-color)] min-w-[100px] shadow-lg z-10 list-none p-0 rounded-lg text-[0.9rem]">
                                <li><a href="#" className="block px-4 py-3 rounded-t-lg hover:bg-gray-200">Granja</a></li>
                                <li><a href="#" className="block px-4 py-3 hover:bg-gray-200">Selva</a></li>
                                <li><a href="#" className="block px-4 py-3 rounded-b-lg hover:bg-gray-200">Bosque</a></li>
                            </ul>
                        </li>
                        <li><a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">Fondo del mar</a></li>
                        <li><a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">Flores y hojas</a></li>
                        <li><a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">Apliques</a></li>
                        <li><a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">Princesas</a></li>
                        <li><a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">Personajes</a></li>
                        <li><a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">Kawaii</a></li>
                        <li className="relative group">
                            <a href="#" className="text-[var(--text-color)] font-bold px-1 py-1 block text-sm rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Souvenirs
                            </a>
                            <ul className="hidden group-hover:block absolute top-full left-0 bg-[var(--background-color)] min-w-[110px] shadow-lg z-10 list-none p-0 rounded-lg text-[0.9rem]">
                                <li><a href="#" className="block px-4 py-3 rounded-t-lg hover:bg-gray-200">Bautismo</a></li>
                                <li><a href="#" className="block px-4 py-3 rounded-b-lg hover:bg-gray-200">Comunión</a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>

                {/* Sección de Íconos de Usuario y Carrito */}
                <div className="flex items-center space-x-6">
                    <a href="#" className="flex items-center text-[var(--text-color)] font-bold hover:text-gray-600 transition-colors duration-300">
                        <FaUserCircle className="text-[1.6rem] text-gray-600" />
                    </a>
                    <a href="#" className="flex items-center text-[var(--text-color)] font-bold hover:text-gray-600 transition-colors duration-300">
                        <CartIcon />
                    </a>
                </div>
            </div>

            {/* Header Móvil */}
            <div className="md:hidden flex justify-between items-center h-16 px-4">
                <button onClick={toggleMenu}>
                    <FaBars className="text-[1.6rem] text-gray-700" />
                </button>
                <div className="flex flex-col text-center leading-none">
                    <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
                    <span className="text-[1.2rem] font-normal text-gray-600 font-poppins">PAO</span>
                </div>
                <div className="flex items-center space-x-4">
                    <FaSearch className="text-xl text-gray-700" />
                    <CartIcon />
                </div>
            </div>

            {/* Menú Móvil */}
            {isMenuOpen && (
                <div className="fixed top-0 left-0 w-full z-50 overflow-y-auto bg-[var(--pastel-pink)]">
                    <div className="flex justify-between items-center p-4 shadow-md sticky top-0 bg-[var(--pastel-menta)]">
                        <div className="flex w-full">
                            <button className="flex-1 text-center font-bold py-2 border-b-2 border-[var(--pastel-pink)] text-[1.3rem]" style={{ fontFamily: 'var(--font-nav)' }}>
                                CATEGORÍAS
                            </button>
                        </div>
                        <button onClick={toggleMenu} className="text-gray-500">
                            <FaTimes className="text-[1.6rem]" />
                        </button>
                    </div>

                    <div className="px-6 py-4">
                        <ul className="space-y-4" style={{ fontFamily: 'var(--font-nav)' }}>
                            <li>
                                <div
                                    className={`flex justify-between items-center w-full font-bold text-lg cursor-pointer px-4 py-3 rounded-lg ${activeMobileCategory === 'Animales' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Animales')}
                                >
                                    Animales
                                    <FaChevronDown className={`transform transition-transform duration-300 ${openCategory === 'Animales' ? 'rotate-180' : ''}`} />
                                </div>
                                {openCategory === 'Animales' && (
                                    <ul className="mt-2 pl-4 space-y-2">
                                        <li><a href="#" className="block text-gray-600 hover:text-gray-800">Granja</a></li>
                                        <li><a href="#" className="block text-gray-600 hover:text-gray-800">Selva</a></li>
                                        <li><a href="#" className="block text-gray-600 hover:text-gray-800">Bosque</a></li>
                                    </ul>
                                )}
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`block text-lg font-bold px-4 py-3 rounded-lg ${activeMobileCategory === 'Fondo del mar' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Fondo del mar')}
                                >
                                    Fondo del mar
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`block text-lg font-bold px-4 py-3 rounded-lg ${activeMobileCategory === 'Flores y hojas' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Flores y hojas')}
                                >
                                    Flores y hojas
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`block text-lg font-bold px-4 py-3 rounded-lg ${activeMobileCategory === 'Apliques' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Apliques')}
                                >
                                    Apliques
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`block text-lg font-bold px-4 py-3 rounded-lg ${activeMobileCategory === 'Princesas' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Princesas')}
                                >
                                    Princesas
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`block text-lg font-bold px-4 py-3 rounded-lg ${activeMobileCategory === 'Personajes' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Personajes')}
                                >
                                    Personajes
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className={`block text-lg font-bold px-4 py-3 rounded-lg ${activeMobileCategory === 'Kawaii' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Kawaii')}
                                >
                                    Kawaii
                                </a>
                            </li>
                            <li>
                                <div
                                    className={`flex justify-between items-center w-full font-bold text-lg cursor-pointer px-4 py-3 rounded-lg ${activeMobileCategory === 'Souvenirs' ? 'bg-[var(--pastel-menta)]' : ''}`}
                                    onClick={() => toggleCategory('Souvenirs')}
                                >
                                    Souvenirs
                                    <FaChevronDown className={`transform transition-transform duration-300 ${openCategory === 'Souvenirs' ? 'rotate-180' : ''}`} />
                                </div>
                                {openCategory === 'Souvenirs' && (
                                    <ul className="mt-2 pl-4 space-y-2">
                                        <li><a href="#" className="block text-gray-600 hover:text-gray-800">Bautismo</a></li>
                                        <li><a href="#" className="block text-gray-600 hover:text-gray-800">Comunión</a></li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </div>

                    <div className="sticky bottom-0 w-full p-4 shadow-lg bg-[var(--background-color)]">
                        <button className="w-full bg-[var(--pastel-menta)] text-[var(--background-color)] font-bold py-3 rounded-full text-xl" style={{ fontFamily: 'var(--font-nav)' }}>
                            Pedido personalizado
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;