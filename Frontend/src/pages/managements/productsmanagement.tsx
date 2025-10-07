// Frontend\src\pages\managements\productsmanagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, setDoc, updateDoc, deleteDoc, doc, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';

export interface Product {
  id: string;
  data: {
    nombre: string;
    precio: number;
    descripcion: string;
    categoria: string;
    imagenURL: string;
    isActive?: boolean;
  };
}

// =========================================================================
// CORRECCIÓN 1: MODAL EXTRAÍDA PARA EVITAR BUGS DE RE-RENDERIZADO EN EL INPUT
// =========================================================================

// Componente Modal para crear una nueva categoría
const CategoryModal = ({ isCategoryModalOpen, setIsCategoryModalOpen, newCategoryName, setNewCategoryName, handleCreateCategory }: any) => {
    if (!isCategoryModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Crear Nueva Categoría</h3>
                
                <form onSubmit={handleCreateCategory}>
                    <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Categoría
                    </label>
                    <input
                        type="text"
                        id="newCategory"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                        placeholder="Ej: Personajes de Bodas"
                    />

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCategoryModalOpen(false);
                                setNewCategoryName('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            Guardar Categoría
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProductsManagement: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]); 
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // ESTADOS para la Modal de Categoría
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        imagenURL: '',
        isActive: true
    });

    // Scroll al formulario cuando se edita
    const scrollToForm = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Cargar productos y categorías desde Firebase (onSnapshot)
    useEffect(() => {
        setLoading(true);

        // 1. Suscripción a PRODUCTOS
        const unsubscribeProducts = onSnapshot(collection(db, "Productos"), (snapshot) => {
            const productosList = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data() as Product['data']
            }));
            setProducts(productosList);
            setLoading(false);
        });

        // 2. Suscripción a CATEGORÍAS
        const unsubscribeCategories = onSnapshot(collection(db, "Categorias"), (snapshot) => {
            const categoryList = snapshot.docs.map(doc => doc.data().nombre as string);
            setCategories(categoryList.filter(Boolean).sort());
        });

        // Función de limpieza para ambas suscripciones
        return () => {
            unsubscribeProducts();
            unsubscribeCategories();
        };
    }, []);

    // Manejar cambios en el formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    // =========================================================================
    // CORRECCIÓN 2: USAR SETDOC PARA ASIGNAR EL NOMBRE ESTANDARIZADO COMO ID
    // =========================================================================
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedName = newCategoryName.trim();

        if (!trimmedName) {
            alert('El nombre de la categoría no puede estar vacío.');
            return;
        }
        
        // Estandarizar el nombre para usarlo como ID del documento (minúsculas y guiones)
        const categoryId = trimmedName.toLowerCase().replace(/\s+/g, '-'); 
        
        try {
            // Crea una referencia al documento, especificando la colección y el ID
            const categoryRef = doc(db, "Categorias", categoryId); 

            // Usa setDoc para crear o sobrescribir el documento con ese ID
            await setDoc(categoryRef, {
                nombre: trimmedName,
            }, { merge: true });

            alert(`Categoría "${trimmedName}" creada correctamente con ID: ${categoryId}.`);

            // Cierra la modal y limpia el estado
            setIsCategoryModalOpen(false);
            setNewCategoryName('');

        } catch (error: any) {
            console.error('Error al crear categoría:', error);
            alert('Error al crear la categoría. Por favor, intenta de nuevo.');
        }
    };

    // Enviar formulario (Crear o Editar Producto)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const productData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precio: parseFloat(formData.precio),
                categoria: formData.categoria,
                imagenURL: formData.imagenURL,
                isActive: formData.isActive
            };

            if (editingProduct && editingProduct.id) {
                // Editar producto existente
                const productRef = doc(db, "Productos", editingProduct.id);
                await updateDoc(productRef, productData);
                alert('Producto actualizado correctamente');
            } else {
                // Crear nuevo producto (usando addDoc para ID automático en Productos)
                await addDoc(collection(db, "Productos"), productData);
                alert('Producto creado correctamente');
            }

            // Limpiar formulario
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                categoria: '',
                imagenURL: '',
                isActive: true
            });
            setEditingProduct(null);

        } catch (error: any) {
            console.error('Error al guardar producto:', error);
            alert(error.message || 'Error al guardar el producto');
        }
    };

    // Editar producto
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            nombre: product.data.nombre,
            descripcion: product.data.descripcion,
            precio: product.data.precio.toString(),
            categoria: product.data.categoria,
            imagenURL: product.data.imagenURL,
            isActive: product.data.isActive !== false
        });
        scrollToForm(); // Scroll al formulario
    };

    // Eliminar producto
    const handleDelete = async (productId: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

        try {
            await deleteDoc(doc(db, "Productos", productId));
            alert('Producto eliminado correctamente');
        } catch (error: any) {
            console.error('Error al eliminar producto:', error);
            alert(error.message || 'Error al eliminar el producto');
        }
    };

    // Activar/Desactivar producto
    const handleToggleActive = async (product: Product) => {
        try {
            const productRef = doc(db, "Productos", product.id);
            const newActiveState = !(product.data.isActive !== false);

            await updateDoc(productRef, {
                isActive: newActiveState
            });

            alert(`Producto ${newActiveState ? 'activado' : 'desactivado'} correctamente`);
        } catch (error: any) {
            console.error('Error al cambiar estado del producto:', error);
            alert(error.message || 'Error al cambiar estado del producto');
        }
    };

    // Cancelar edición
    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria: '',
            imagenURL: '',
            isActive: true
        });
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg text-gray-600">Cargando productos y categorías...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Gestión de Productos</h1>

                {/* Formulario de Producto */}
                <div ref={formRef} className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Producto *
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Osito de Bautismo"
                                />
                            </div>

                            <div>
                                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio ($) *
                                </label>
                                <input
                                    type="number"
                                    id="precio"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría *
                                </label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={(e) => {
                                        // Si el valor es 'CREATE_NEW', abrimos la modal
                                        if (e.target.value === 'CREATE_NEW') {
                                            setIsCategoryModalOpen(true);
                                            setFormData(prev => ({ ...prev, categoria: '' })); // Limpiar valor temporalmente
                                        } else {
                                            handleInputChange(e); // Si no, manejar el cambio normal
                                        }
                                    }}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    
                                    {/* Opción para Crear Nueva Categoría */}
                                    <option value="CREATE_NEW" className="font-semibold text-blue-600">
                                        -- Crear Nueva Categoría --
                                    </option>
                                    
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-2">
                                    URL de la Imagen *
                                </label>
                                <input
                                    type="url"
                                    id="imagen"
                                    name="imagenURL"
                                    value={formData.imagenURL}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción *
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows={3}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe el producto..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Producto visible en el catálogo
                            </label>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                            </button>

                            {editingProduct && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Lista de Productos */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Lista de Productos ({products.length})
                        </h2>
                        <div className="text-sm text-gray-600">
                            {categories.length} categorías registradas
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No hay productos registrados</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    {product.data.imagenURL && (
                                        <img
                                            src={product.data.imagenURL}
                                            alt={product.data.nombre}
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-gray-800 text-lg">{product.data.nombre}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            product.data.isActive !== false
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.data.isActive !== false ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>

                                    {product.data.descripcion && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.data.descripcion}</p>
                                    )}

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Precio:</span>
                                            <span className="font-medium">${product.data.precio.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Categoría:</span>
                                            <span className="font-medium capitalize">{product.data.categoria}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => product.id && handleDelete(product.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleToggleActive(product)}
                                            className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                                                product.data.isActive !== false
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                        >
                                            {product.data.isActive !== false ? 'Ocultar en Catálogo' : 'Mostrar en Catálogo'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Llama a la modal pasando las props necesarias */}
            <CategoryModal 
                isCategoryModalOpen={isCategoryModalOpen}
                setIsCategoryModalOpen={setIsCategoryModalOpen}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleCreateCategory={handleCreateCategory}
            /> 
        </div>
    );
};

export default ProductsManagement;