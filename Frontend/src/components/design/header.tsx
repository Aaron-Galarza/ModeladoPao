import React, { useState } from 'react';
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-[var(--pastel-pink)] shadow-md fixed top-0 w-full z-50">
            {/* Header de Escritorio */}
            <div className="hidden md:flex justify-between items-center h-20 px-12">
                {/* Sección del Logo */}
                <Link to="/" className="flex flex-col text-center leading-none">
                    <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
                    <span className="text-[1.3rem] font-normal text-gray-600 font-poppins">PAO</span>
                </Link>

                {/* Sección de Navegación */}
                <nav className="flex flex-1 justify-center">
                    <ul className="flex list-none m-0 p-0 space-x-7">
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Animales
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Fondo del mar
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Flores y hojas
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Apliques
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Princesas
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Personajes
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Kawaii
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogo" className="nav-link text-[var(--text-color)] px-1 py-1 block rounded-lg hover:bg-[var(--pastel-menta)] transition-colors duration-300">
                                Souvenirs
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Sección de Íconos de Usuario y Carrito */}
                <div className="flex items-center space-x-6">
                    <Link to="/user" className="flex items-center text-[var(--text-color)] font-bold hover:text-gray-600 transition-colors duration-300">
                        <FaUserCircle className="text-[1.6rem] text-gray-600" />
                    </Link>
                    <Link to="/cart" className="flex items-center text-[var(--text-color)] font-bold hover:text-gray-600 transition-colors duration-300">
                        <CartIcon />
                    </Link>
                </div>
            </div>

            {/* Header Móvil */}
            <div className="md:hidden flex justify-between items-center h-16 px-4">
                <button onClick={toggleMenu}>
                    <FaBars className="text-[1.6rem] text-gray-700" />
                </button>
                <div className="flex-grow flex justify-center">
                    <Link to="/" className="flex flex-col text-center leading-none">
                        <span className="text-[1.5rem] font-semibold text-gray-800 font-poppins">MODELADO</span>
                        <span className="text-[1.2rem] font-normal text-gray-600 font-poppins">PAO</span>
                    </Link>
                </div>
                <div className="flex items-center space-x-2">
                    <Link to="/user">
                        <FaUserCircle className="text-[1.6rem] text-gray-700" />
                    </Link>
                    <Link to="/cart">
                        <CartIcon />
                    </Link>
                </div>
            </div>

            {/* Menú Móvil */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-transparent"
                    onClick={toggleMenu}
                >
                    <div
                        className="w-full max-w-xs h-auto bg-[var(--pastel-pink)] shadow-lg transform transition-transform border-[var(--pastel-menta)] border-2 rounded-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 shadow-md sticky top-0 bg-[var(--pastel-menta)] rounded-t-lg">
                            <div className="flex w-full">
                                <button
                                    className="flex-1 text-center py-2 border-b-2 border-[var(--pastel-pink)] text-[1.3rem] font-mobile-nav font-semibold"
                                >
                                    CATEGORÍAS
                                </button>
                            </div>
                            <button onClick={toggleMenu} className="text-gray-500">
                                <FaTimes className="text-[1.6rem]" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-2 text-xl">
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-4 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Animales
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-3 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Fondo del mar
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-3 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Flores y hojas
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-3 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Apliques
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-3 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Princesas
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-3 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Kawaii
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" onClick={toggleMenu} className="nav-link block text-lg px-4 py-3 rounded-lg hover:bg-[var(--pastel-menta)]">
                                        Souvenirs
                                    </Link>
                                </li>
                            </ul>
                            <div className="w-full pt-6">
                                <button className="w-full bg-[var(--pastel-menta)] text-[var(--background-color)] font-xl py-2 rounded-full text-xl font-nav">
                                    Pedido personalizado
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;