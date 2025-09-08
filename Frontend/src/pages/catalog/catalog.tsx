import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import ProductList from '../../components/productos/productlist';
import '../../App.css';

const CatalogPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await getProducts();
                // Filtra adicionalmente por si algún producto no tiene el campo isActive
                const activeProducts = fetchedProducts.filter(product => 
                    product.data.isActive !== false
                );
                setProducts(activeProducts);
            } catch (error) {
                console.error("Error al obtener productos:", error);
                setError("Error al cargar los productos");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="catalog-loading text-center font-poppins text-gray-700 mt-10">Cargando productos...</div>;
    }

    if (error) {
        return <div className="catalog-error text-center font-poppins text-red-600 mt-10">{error}</div>;
    }

    return (
        <div className="catalog-page">
            <div className="container mx-auto p-4">
                <h1 className="text-4xl md:text-4xl font-poppins font-extrabold text-center mb-10
                              text-[var(--text-color)] mt-4
                              drop-shadow-md">
                    CATÁLOGO
                </h1>
                {products.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-600 font-poppins">No hay productos disponibles en este momento.</p>
                    </div>
                ) : (
                    <ProductList products={products} />
                )}
            </div>
        </div>
    );
};

export default CatalogPage;