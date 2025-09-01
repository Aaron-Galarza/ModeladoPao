import React from 'react';
import ProductCard from './productCard';

// Definimos la interfaz del producto para asegurar la tipificación correcta
interface Product {
    id: string;
    data: {
        nombre: string;
        precio: number;
        descripcion: string;
        categoria: string;
        imagenURL: string; // <-- Cambiado para coincidir con la base de datos
    };
}

// Definimos las props que recibirá ProductList
interface ProductListProps {
    products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
    return (
        // Cuadrícula de productos: el único estilo que debe tener ProductList
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
                products.map(product => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        nombre={product.data.nombre}
                        precio={product.data.precio}
                        descripcionCorta={product.data.descripcion}
                        imagen={product.data.imagenURL} // <-- Corregido para usar la propiedad 'imagenURL'
                    />
                ))
            ) : (
                <p className="text-xl text-gray-700 font-poppins col-span-full text-center">No se encontraron productos.</p>
            )}
        </div>
    );
};

export default ProductList;