import React, { useEffect, useState, useMemo } from 'react';
import { getProducts } from '../../services/products.service';
import type { Product } from '../../services/products.service'; 
import { getCategories, type Category } from '../../services/category.service'; 
import ProductList from '../../components/productos/productlist';
import CategoryGrid from '../../components/productos/categoryGrid'; 

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADOS DE FILTROS Y VISTA ---
  const [searchTerm, setSearchTerm] = useState('');
  // 'Todas las categorías' indica la vista de cuadrícula.
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas las categorías');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  // --- FIN ESTADOS ---


  // 1. Lista de nombres de categorías para los Select/Dropdowns
  const categoryNames = useMemo(() => {
    const names = categories.map(c => c.nombre); 
    return ['Todas las categorías', ...names];
  }, [categories]);

  // 2. Categorías Únicas con su primera imagen (Para CategoryGrid)
  const categoriesWithImages = useMemo(() => {
    const categoryImageMap = new Map<string, string>();

    // Recorre todos los productos para encontrar la primera imagen para cada categoría
    products.forEach(p => {
        if (p.data.categoria && !categoryImageMap.has(p.data.categoria)) {
            categoryImageMap.set(p.data.categoria, p.data.imagenURL); 
        }
    });

    // Filtra las categorías maestras para incluir solo aquellas que tienen productos
    // y les adjunta la URL de imagen.
    return categories
        .map(cat => ({
            name: cat.nombre,
            // Proporciona la imagen del producto o un placeholder
            imageUrl: categoryImageMap.get(cat.nombre) || '/images/default-placeholder.png' 
        }))
        // Se mantiene el filtro para mostrar solo categorías que realmente tienen productos:
        .filter(cat => categoryImageMap.has(cat.name)); 
  }, [products, categories]);


  // Aplicar filtros (La lógica se mantiene igual, usando selectedCategory)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.data.nombre.toLowerCase().includes(term));
    }

    // 2. Filtrar por categoría
    if (selectedCategory !== 'Todas las categorías') {
      result = result.filter(p => p.data.categoria === selectedCategory);
    }

    // 3. Ordenar
    if (sortOrder === 'price-high') result.sort((a, b) => b.data.precio - a.data.precio);
    else if (sortOrder === 'price-low') result.sort((a, b) => a.data.precio - b.data.precio);
    else if (sortOrder === 'name') result.sort((a, b) => a.data.nombre.localeCompare(b.data.nombre));

    return result;
  }, [products, searchTerm, selectedCategory, sortOrder]);


  // Carga inicial de productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Cargar la lista maestra de categorías
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

        // 2. Cargar los productos
        const fetchedProducts = await getProducts();
        const active = fetchedProducts.filter(p => p.data.isActive !== false);
        setProducts(active);

      } catch (err) {
        console.error('Error al obtener datos:', err);
        setError('Error al cargar los productos o categorías');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Lógica para limpiar todos los filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas las categorías');
    setSortOrder('default');
  };

  // Función para volver a la cuadrícula de categorías
  const goBackToCategories = () => {
    setSelectedCategory('Todas las categorías');
    setSearchTerm(''); 
    setSortOrder('default');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(240,236,238)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400" />
          <p className="mt-4 text-teal-600">Cargando nuestras creaciones...</p>
        </div>
        <div className="sr-only">Cargando productos y categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(240,236,238)]">
        <div className="text-center p-6 bg-white rounded-lg border border-gray-200 max-w-md">
          <div className="text-pink-400 text-5xl mb-4">😢</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Algo salió mal</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Determinar si estamos en la vista inicial de categorías
  const isCategoryView = selectedCategory === 'Todas las categorías' && !searchTerm;


  return (
    <div className="min-h-screen flex flex-col bg-[rgb(240,236,238)]">
      {/* HEADER DEL CATÁLOGO */}
      <header className="bg-[#83cfbc] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-2">Nuestras Creaciones</h1>
          <p className="text-center text-white text-opacity-90 max-w-2xl mx-auto">
            Descubre nuestra colección de porcelana fría hecha con amor y dedicación.
          </p>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="sticky top-0 z-30 bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Botón para volver a Categorías (visible solo cuando NO estamos en la vista de categorías) */}
            {!isCategoryView && (
              <button
                onClick={goBackToCategories}
                className="w-full md:w-auto flex items-center gap-1 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors font-semibold order-last md:order-first"
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Ver categorías
              </button>
            )}

            {/* Búsqueda */}
            <div className={`relative ${isCategoryView ? 'w-full md:w-full' : 'w-full md:w-2/5'}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Toggle móvil para filtros */}
            <div className="md:hidden w-full">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </button>
            </div>

            {/* Filtros desktop */}
            <div className="hidden md:flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {categoryNames.map(c => ( 
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Panel móvil */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 md:hidden">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {categoryNames.map(c => ( 
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                  <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
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

      {/* CONTENIDO PRINCIPAL: CATEGORÍAS O PRODUCTOS */}
      <main className="flex-1 bg-[rgb(240,236,238)]">
        {isCategoryView ? (
            // VISTA DE CUADRÍCULA DE CATEGORÍAS
            <CategoryGrid categories={categoriesWithImages} onSelectCategory={setSelectedCategory} />
        ) : (
            // VISTA DE LISTA DE PRODUCTOS FILTRADOS
            <div className="container mx-auto px-4 py-6">
                {/* Título y estado de los filtros */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <p className="text-gray-600">
                        {selectedCategory !== 'Todas las categorías' ? 
                            <span className="text-xl font-bold text-teal-600">Colección: {selectedCategory}</span> 
                            : 'Mostrando'}
                        <span className="font-semibold text-teal-600 ml-2">{filteredProducts.length}</span> de {products.length} productos
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                        {searchTerm && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Búsqueda: "{searchTerm}"
                                <button onClick={() => setSearchTerm('')} className="ml-2 rounded-full hover:bg-blue-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
                            onClick={goBackToCategories}
                            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                        >
                            Ver todas las categorías
                        </button>
                    </div>
                ) : (
                    <ProductList products={filteredProducts} />
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default CatalogPage;