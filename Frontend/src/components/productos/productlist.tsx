import React from 'react';
import ProductCard from './productCard';

interface Product {
    id: string;
    data: {
        nombre: string;
        precio: number;
        descripcion: string;
        categoria: string;
        imagenURL: string;
        stock?: number;
        isStockeable?: boolean;
    };
}

interface ProductListProps {
    products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
                products.map(product => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        nombre={product.data.nombre}
                        precio={product.data.precio}
                        descripcionCorta={product.data.descripcion}
                        imagenURL={product.data.imagenURL}
                        stock={product.data.stock}
                        isStockeable={product.data.isStockeable}
                    />
                ))
            ) : (
                <p className="text-xl text-gray-700 col-span-full text-center">No se encontraron productos.</p>
            )}
        </div>
    );
};

export default ProductList;