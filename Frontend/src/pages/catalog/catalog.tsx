import React, { useEffect, useState, useMemo } from 'react';
import { getProducts } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import ProductList from '../../components/productos/productlist';

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Todas las categorías');
    const [sortOrder, setSortOrder] = useState<string>('default');
    const [showFilters, setShowFilters] = useState(false);
    
    // Obtener categorías únicas
    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.flatMap(product => 
            product.data.categoria ? [product.data.categoria] : []
        )));
        return ['Todas las categorías', ...cats];
    }, [products]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProducts();
                const activeProducts = fetchedProducts.filter(product => 
                    product.data.isActive !== false
                );
                setProducts(activeProducts);
                setFilteredProducts(activeProducts);
            } catch (error) {
                console.error("Error al obtener productos:", error);
                setError("Error al cargar los productos");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Aplicar filtros y ordenamiento
    useEffect(() => {
        let result = [...products];
        
        // Filtrar por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(product => 
                product.data.nombre.toLowerCase().includes(term)
            );
        }
        
        // Filtrar por categoría (solo si no es "Todas las categorías")
        if (selectedCategory !== 'Todas las categorías') {
            result = result.filter(product => 
                product.data.categoria === selectedCategory
            );
        }
        
        // Ordenar productos
        if (sortOrder === 'price-high') {
            result.sort((a, b) => b.data.precio - a.data.precio);
        } else if (sortOrder === 'price-low') {
            result.sort((a, b) => a.data.precio - b.data.precio);
        } else if (sortOrder === 'name') {
            result.sort((a, b) => a.data.nombre.localeCompare(b.data.nombre));
        }
        
        setFilteredProducts(result);
    }, [products, searchTerm, selectedCategory, sortOrder]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('Todas las categorías');
        setSortOrder('default');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-rose-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
                    <p className="mt-4 text-teal-600">Cargando nuestras creaciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-rose-50">
                <div className="text-center p-6 bg-white rounded-lg border border-gray-200 max-w-md">
                    <div className="text-pink-400 text-5xl mb-4">😢</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Algo salió mal</h2>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-rose-50">
            {/* Header del catálogo */}
            <div className="bg-[#83cfbc] text-white">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-center mb-2">
                        Nuestras Creaciones
                    </h1>
                    <p className="text-center text-white text-opacity-90 max-w-2xl mx-auto">
                        Descubre nuestra colección de porcelana fría hecha con amor y dedicación. Cada pieza es única y especial.
                    </p>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="sticky top-0 z-20 bg-white shadow-md py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Búsqueda */}
                        <div className="relative w-full md:w-2/5">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        {/* Filtros para móvil - Botón toggle */}
                        <div className="md:hidden w-full">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
                                </svg>
                                {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                            </button>
                        </div>

                        {/* Filtros para desktop */}
                        <div className="hidden md:flex items-center gap-4">
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={sortOrder}
                                onChange={handleSortChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="default">Ordenar por</option>
                                <option value="price-high">Precio: Mayor a menor</option>
                                <option value="price-low">Precio: Menor a mayor</option>
                                <option value="name">Nombre: A-Z</option>
                            </select>

                            {(searchTerm || selectedCategory !== 'Todas las categorías' || sortOrder !== 'default') && (
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Panel de filtros móvil - Colapsable */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 md:hidden">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                                    <select
                                        value={sortOrder}
                                        onChange={handleSortChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="default">Por defecto</option>
                                        <option value="price-high">Precio: Mayor a menor</option>
                                        <option value="price-low">Precio: Menor a mayor</option>
                                        <option value="name">Nombre: A-Z</option>
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowFilters(false)}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Cerrar
                                    </button>
                                    {(searchTerm || selectedCategory !== 'Todas las categorías' || sortOrder !== 'default') && (
                                        <button
                                            onClick={resetFilters}
                                            className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="container mx-auto px-4 py-6">
                {/* Información de resultados */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <p className="text-gray-600">
                        Mostrando <span className="font-semibold text-teal-600">{filteredProducts.length}</span> de {products.length} productos
                    </p>

                    {/* Filtros activos */}
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                        {searchTerm && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Búsqueda: "{searchTerm}"
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="ml-2 rounded-full hover:bg-blue-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </span>
                        )}
                        {selectedCategory !== 'Todas las categorías' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Categoría: {selectedCategory}
                                <button 
                                    onClick={() => setSelectedCategory('Todas las categorías')}
                                    className="ml-2 rounded-full hover:bg-green-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Lista de productos */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="text-gray-400 text-5xl mb-4">🎨</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No encontramos productos</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            No hay productos que coincidan con tu búsqueda. Intenta ajustar los filtros o términos de búsqueda.
                        </p>
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                        >
                            Ver todos los productos
                        </button>
                    </div>
                ) : (
                    <ProductList products={filteredProducts} />
                )}
            </div>
        </div>
    );
};

export default CatalogPage;