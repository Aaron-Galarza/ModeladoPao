// src/pages/CatalogPage.tsx
import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/products.service'; // Mantén esta importación para la función
import type { Product } from '../../services/products.service'; // Usa 'type' para importar el tipo de dato
import ProductList from '../../components/productos/productlist';

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error al obtener productos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="text-center font-poppins text-gray-700 mt-10">Cargando productos...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl md:text-4xl font-poppins font-extrabold text-center mb-10
                                                                      text-[var(--text-color)]
                                                                      drop-shadow-md">
                CATÁLOGO
            </h1>
            <ProductList products={products} />
        </div>
    );
};

export default CatalogPage;