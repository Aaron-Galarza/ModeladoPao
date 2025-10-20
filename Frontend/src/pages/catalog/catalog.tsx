import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import { getCategories, type Category } from '../../services/category.service';
import ProductList from '../../components/productos/productlist';
import CategoryGrid from '../../components/productos/categoryGrid';

// --- Helpers ---
// Alternativa compatible si tu toolchain no soporta \p{Diacritic}:
const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const norm = (s?: string) => stripAccents((s ?? '').trim().toLowerCase());

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas las categorías');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  // Query params
  const [searchParams, setSearchParams] = useSearchParams();

  // Carga inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);

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

  // Nombres de categorías para los selects (con opción temporal si la seleccionada no está)
  const categoryNames = useMemo(() => {
    const names = categories.map(c => c.nombre);
    const base = ['Todas las categorías', ...names];

    if (
      selectedCategory &&
      selectedCategory !== 'Todas las categorías' &&
      !base.some(n => norm(n) === norm(selectedCategory))
    ) {
      base.push(selectedCategory); // opción temporal para que el select no "pierda" valor
    }

    return base;
  }, [categories, selectedCategory]);

  // Mapa de imágenes por categoría (normalizado)
  const categoriesWithImages = useMemo(() => {
    const categoryImageMap = new Map<string, string>();

    products.forEach(p => {
      if (p.data.categoria) {
        const key = norm(p.data.categoria);
        if (!categoryImageMap.has(key)) {
          categoryImageMap.set(key, p.data.imagenURL);
        }
      }
    });

    return categories
      .map(cat => ({
        name: cat.nombre,
        imageUrl: categoryImageMap.get(norm(cat.nombre)) || '/images/default-placeholder.png',
      }))
      .filter(cat => categoryImageMap.has(norm(cat.name)));
  }, [products, categories]);

  // Filtros aplicados en memoria (case/acentos-insensible)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const term = norm(searchTerm);
      result = result.filter(p => norm(p.data.nombre).includes(term));
    }

    if (selectedCategory !== 'Todas las categorías') {
      const catN = norm(selectedCategory);
      result = result.filter(p => norm(p.data.categoria) === catN);
    }

    if (sortOrder === 'price-high') result.sort((a, b) => b.data.precio - a.data.precio);
    else if (sortOrder === 'price-low') result.sort((a, b) => a.data.precio - b.data.precio);
    else if (sortOrder === 'name') result.sort((a, b) => a.data.nombre.localeCompare(b.data.nombre));

    return result;
  }, [products, searchTerm, selectedCategory, sortOrder]);

  // Lee ?category= cuando ya tenemos categorías (con fallback)
  useEffect(() => {
    if (loading) return;

    const catFromUrl = searchParams.get('category');
    if (!catFromUrl) return;

    const match = categories.find(c => norm(c.nombre) === norm(catFromUrl));
    if (match) {
      setSelectedCategory(match.nombre); // nombre canónico
    } else {
      // Fallback: usar lo que vino en la URL para que el filtro funcione igual
      setSelectedCategory(catFromUrl);
    }
  }, [loading, categories, searchParams, setSearchParams]);

  // Sincroniza la URL cuando cambia la categoría en UI
  useEffect(() => {
    if (loading) return;
    const next = new URLSearchParams(searchParams);
    if (selectedCategory && selectedCategory !== 'Todas las categorías') {
      next.set('category', selectedCategory);
    } else {
      next.delete('category');
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Helpers
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas las categorías');
    setSortOrder('default');
  };

  const goBackToCategories = () => {
    setSelectedCategory('Todas las categorías');
    setSearchTerm('');
    setSortOrder('default');
  };

  const isCategoryView = selectedCategory === 'Todas las categorías' && !searchTerm;

  // UI estados
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

  // Render
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(240,236,238)]">
      {/* HEADER */}
      <header className="bg-teal-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-cursive font-bold text-center mb-2">Mis Creaciones</h1>
          <p className="text-center text-white text-opacity-90 max-w-2xl mx-auto">
            Descubri las colecciones de porcelana fría hecha con amor y dedicación.
          </p>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="sticky top-0 z-30 bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
                <button onClick={resetFilters} className="flex items-center gap-1 text-teal-600 hover:text-teal-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Toggle móvil */}
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
                  <button onClick={() => setShowFilters(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    Cerrar
                  </button>
                  {(searchTerm || selectedCategory !== 'Todas las categorías' || sortOrder !== 'default') && (
                    <button onClick={resetFilters} className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 bg-[rgb(240,236,238)]">
        {isCategoryView ? (
          <CategoryGrid categories={categoriesWithImages} onSelectCategory={setSelectedCategory} />
        ) : (
          <div className="container mx-auto px-4 py-6">
            {/* 🔽 Título de la categoría (centrado y cursive) */}
            {selectedCategory !== 'Todas las categorías' && (
              <div className="text-center mb-8">
                <h1 className="font-cursive font-bold text-3xl md:text-5xl text-gray-800">
                  {selectedCategory}
                </h1>
              </div>
            )}

            {/* Estado de filtros / conteo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <p className="text-gray-600">
                {selectedCategory !== 'Todas las categorías' ? (
                  <span className="text-xl font-bold text-teal-600">Colección: {selectedCategory}</span>
                ) : (
                  'Mostrando'
                )}
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

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-400 text-5xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No encontramos productos</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  No hay productos que coincidan con esta categoria. Proximamente habran productos.
                </p>
                <button onClick={goBackToCategories} className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors">
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
