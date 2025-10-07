import React from 'react';

interface CategoryItem {
  name: string;
  imageUrl: string;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  onSelectCategory: (categoryName: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con el mismo estilo del catálogo */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Explora Nuestras Colecciones</h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Descubre nuestras categorías especiales, cada una con su estilo único y encanto particular.
        </p>
      </div>

      {/* Grid de categorías con diseño mejorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {categories.map((category) => (
          <div
            key={category.name}
            // Implementación de accesibilidad (tabIndex y role)
            role="button"
            tabIndex={0} 
            aria-label={`Explorar categoría ${category.name}`}
            onKeyPress={(e) => e.key === 'Enter' && onSelectCategory(category.name)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => onSelectCategory(category.name)}
          >
            {/* Card con diseño similar a ProductList */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl hover:border-teal-300 transition-all duration-300">
              
              {/* Imagen container */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  // Efecto zoom y fallback de imagen (placeholder)
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-placeholder.png'; // Usar un placeholder si falla
                  }}
                />
                {/* Overlay sutil al hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                
                {/* Badge de categoría */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-teal-500 text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm">
                    {category.name}
                  </span>
                </div>
              </div>

              {/* Footer de la card */}
              <div className="p-5 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  {/* Icono de flecha con transición */}
                  <div className="transform transition-transform duration-300 group-hover:translate-x-1">
                    <svg 
                      className="w-5 h-5 text-teal-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M14 5l7 7m0 0l-7 7m7-7H3" 
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Botón de acción */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(category.name);
                  }}
                  className="w-full mt-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <span>Explorar Colección</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state con diseño consistente */}
      {categories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 max-w-2xl mx-auto">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">No hay categorías disponibles</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Próximamente agregaremos más categorías a nuestra colección especial.
          </p>
          <div className="text-sm text-gray-500">
            Las categorías aparecerán aquí cuando estén disponibles
          </div>
        </div>
      )}

      {/* Sección adicional informativa */}
      {categories.length > 0 && (
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-6">
            ¿No encuentras lo que buscas? Prueba nuestra búsqueda avanzada
          </p>
          <button
            onClick={() => onSelectCategory('Todas las categorías')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;