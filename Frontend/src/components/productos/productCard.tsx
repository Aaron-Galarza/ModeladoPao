import React from 'react';

// Props del componente. Define los datos que cada tarjeta de producto recibirá.
interface ProductCardProps {
  nombre: string;
  precio: number;
  descripcionCorta: string;
  imagen: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ nombre, precio, descripcionCorta, imagen }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl group">
      {/* Imagen del producto */}
      <img
        src={imagen}
        alt={nombre}
        className="w-full h-68 object-cover object-center"
      />
      
      {/* Contenido de la tarjeta */}
      <div className="p-4 flex flex-col items-center text-center">
        {/* Nombre del producto */}
        <h3 className="text-xl font-poppins font-semibold text-gray-800 mb-1">{nombre}</h3>
        
        {/* Descripción corta */}
        <p className="text-sm text-gray-600 font-poppins italic mb-3 opacity-85">{descripcionCorta}</p>
        
        {/* Precio */}
        <p className="text-xl font-bold text-gray-800 font-poppins mb-4">${precio.toFixed(2)}</p>
        
        {/* Botón "Agregar al carrito" */}
        <button 
          className="w-full py-1 rounded-lg text-lg font-bold font-poppins transition-all duration-300 
                     bg-[var(--link-hover)] text-white 
                     hover:bg-[var(--pastel-menta)] hover:text-gray-800 
                     shadow-md group-hover:shadow-lg filter drop-shadow-sm" 
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;