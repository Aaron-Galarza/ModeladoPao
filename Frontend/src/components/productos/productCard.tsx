import React from 'react';
import { useCartStore } from '../../components/checkout/cartStore'; 

interface ProductCardProps {
    id: string;
    nombre: string;
    precio: number;
    descripcionCorta: string;
    imagenURL: string;
    stock?: number;
    isStockeable?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, nombre, precio, descripcionCorta, imagenURL, stock, isStockeable }) => {
    const addItem = useCartStore(state => state.addItem);
    const openCart = useCartStore(state => state.openCart);

    // Lógica de bloqueo
    const isOutOfStock = isStockeable === true && (stock ?? 0) <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addItem({ id, name: nombre, price: precio, image: imagenURL });
        openCart();
    };

    return (
        <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group ${isOutOfStock ? 'opacity-75' : 'hover:scale-105 hover:shadow-xl'}`}>
            
            {/* Cartel Sin Stock */}
            {isOutOfStock && (
                <div className="absolute top-4 right-4 z-10">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-md">
                        Sin Stock
                    </span>
                </div>
            )}

            <div className={`h-64 overflow-hidden ${isOutOfStock ? 'grayscale' : ''}`}>
                <img src={imagenURL} alt={nombre} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" />
            </div>
            
            <div className="p-4 flex flex-col items-center text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{nombre}</h3>
                <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">{descripcionCorta}</p>
                <p className="text-xl font-bold text-gray-800 mb-4">${precio.toFixed(2)}</p>
                
                <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-md
                        ${isOutOfStock 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[var(--link-hover)] text-white hover:bg-[var(--pastel-menta)] hover:text-gray-800'}`}
                >
                    {isOutOfStock ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;