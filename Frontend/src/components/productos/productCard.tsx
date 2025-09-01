import React from 'react';
import { useCartStore } from '../../components/checkout/cartStore'; 

// Props del componente. No se incluye el stock en las props.
interface ProductCardProps {
    id: string; // <-- ID del producto, necesario para el carrito
    nombre: string;
    precio: number;
    descripcionCorta: string;
    imagen: string;
    
}

const ProductCard: React.FC<ProductCardProps> = ({ id, nombre, precio, descripcionCorta, imagen }) => {
    // Obtenemos la función addItem y openCart de tu store de Zustand
    const addItem = useCartStore(state => state.addItem);
    const openCart = useCartStore(state => state.openCart);

    // Lógica para manejar el clic en el botón
    const handleAddToCart = () => {
        // Creamos un objeto con las propiedades que la función addItem necesita
        const productToAdd = {
            id,
            name: nombre,
            price: precio,
            image: imagen,
        };
        
        addItem(productToAdd);
        openCart(); // Abrimos el carrito al añadir un producto
        console.log(`Producto "${nombre}" añadido al carrito.`);
    };

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
                    onClick={handleAddToCart}
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