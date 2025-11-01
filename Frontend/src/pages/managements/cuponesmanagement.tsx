// C:\Users\Aaron\Desktop\OTROS\TRABAJO\ModeladoPao\Frontend\src\pages\managements\cuponesmanagement.tsx

import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaPercentage, FaMoneyBillWave } from "react-icons/fa";

// ======================= INTERFACES DE TIPADO =======================

interface Discount {
    code: string;
    value: number;
    type: 'percentage' | 'fixed';
    isActive: boolean;
    // expiresAt ELIMINADO
}

interface NewDiscountForm {
    code: string;
    value: number;
    type: 'percentage' | 'fixed';
    isActive: boolean;
    // expiresAt ELIMINADO
}

interface IManageDiscountData {
    action: 'list' | 'create' | 'update' | 'delete';
    data?: any;
    discountId?: string;
}

const manageDiscountsCallable = httpsCallable<IManageDiscountData, any>(getFunctions(), 'manageDiscounts');

// ======================= COMPONENTE PRINCIPAL =======================

const CuponesManagement = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [currentDiscountId, setCurrentDiscountId] = useState<string | null>(null);
    const [newDiscount, setNewDiscount] = useState<NewDiscountForm>({
        code: '',
        value: 0,
        type: 'percentage',
        isActive: true,
        // expiresAt ELIMINADO
    });

    // ----------------------------------------------------
    // FUNCIÓN DE CARGA INICIAL
    // ----------------------------------------------------
    const fetchDiscounts = async () => {
        setLoading(true);
        setError(null);
        try {
            const auth = getAuth();
            if (!auth.currentUser) {
                throw new Error("No hay usuario autenticado.");
            }

            const result = await manageDiscountsCallable({ action: 'list' });
            
            const mappedDiscounts: Discount[] = result.data.discounts.map((d: any) => ({
                ...d,
                // Lógica de mapeo de expiresAt ELIMINADA
            }));

            setDiscounts(mappedDiscounts);

        } catch (err: any) {
            console.error("Error al listar cupones:", err);
            setError(`Error al cargar cupones: ${err.message || err.details || 'Acceso denegado.'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    // ----------------------------------------------------
    // HANDLERS DEL FORMULARIO
    // ----------------------------------------------------

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setNewDiscount(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewDiscount(prev => ({
            ...prev,
            isActive: e.target.checked,
        }));
    };

    const resetForm = () => {
        setNewDiscount({
            code: '',
            value: 0,
            type: 'percentage',
            isActive: true,
            // expiresAt ELIMINADO
        });
        setFormMode('create');
        setCurrentDiscountId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend: any = { ...newDiscount };
            
            if (formMode === 'edit') {
                delete dataToSend.code;
            }

            // Lógica de expiresAt ELIMINADA aquí
            
            const payload: IManageDiscountData = {
                action: formMode === 'create' ? 'create' : 'update',
                data: dataToSend,
                discountId: currentDiscountId || undefined,
            };

            const result = await manageDiscountsCallable(payload);
            
            alert(result.data.message);
            
            resetForm();
            fetchDiscounts();
            
        } catch (err: any) {
            setError(`Error al guardar: ${err.message || err.details}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (discount: Discount) => {
        // Lógica de formateo de fecha ELIMINADA

        setNewDiscount({
            code: discount.code,
            value: discount.value,
            type: discount.type,
            isActive: discount.isActive,
            // expiresAt ELIMINADO
        });
        
        setFormMode('edit');
        setCurrentDiscountId(discount.code);
        setIsFormOpen(true);
    };

    // ----------------------------------------------------
    // ACCIONES RÁPIDAS (Activación/Eliminación)
    // ----------------------------------------------------

    const toggleDiscountStatus = async (discount: Discount) => {
        setLoading(true);
        try {
            const newStatus = !discount.isActive;
            const payload: IManageDiscountData = {
                action: 'update',
                discountId: discount.code,
                data: { isActive: newStatus },
            };
            await manageDiscountsCallable(payload);
            
            setDiscounts(prev => prev.map(d => 
                d.code === discount.code ? { ...d, isActive: newStatus } : d
            ));

        } catch (err: any) {
            setError(`Error al cambiar estado: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDiscount = async (code: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar el cupón ${code}? Esta acción es irreversible.`)) {
            return;
        }

        setLoading(true);
        try {
            const payload: IManageDiscountData = {
                action: 'delete',
                discountId: code,
            };
            const result = await manageDiscountsCallable(payload);
            
            alert(result.data.message);
            fetchDiscounts();
        } catch (err: any) {
            setError(`Error al eliminar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // FUNCIONES DE AYUDA PARA EL RENDER
    // ----------------------------------------------------
    
    const formatValue = (value: number, type: 'percentage' | 'fixed') => {
        return type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`;
    };

    // formatDateDisplay ELIMINADA

    // ----------------------------------------------------
    // RENDER DEL COMPONENTE
    // ----------------------------------------------------

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Gestión de Cupones de Descuento
                </h1>
                <button
                    onClick={() => {
                        resetForm();
                        setIsFormOpen(true);
                    }}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    <FaPlus className="mr-2" /> Crear Cupón
                </button>
            </div>

            {loading && (
                 <div className="flex justify-center items-center h-20 mb-4">
                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                     <span className="ml-3 text-gray-600">Cargando...</span>
                 </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {/* Modal/Formulario */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                                    {formMode === 'create' ? 'Crear Nuevo Cupón' : `Editar Cupón: ${currentDiscountId}`}
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label htmlFor="code" className="text-sm font-medium text-gray-700 mb-1">Código del Cupón</label>
                                        <input
                                            type="text"
                                            id="code"
                                            name="code"
                                            value={newDiscount.code}
                                            onChange={handleChange}
                                            disabled={formMode === 'edit'}
                                            required
                                            className={`p-2 border rounded-lg ${formMode === 'edit' ? 'bg-gray-100' : 'border-gray-300'}`}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex flex-col w-2/3">
                                            <label htmlFor="value" className="text-sm font-medium text-gray-700 mb-1">Valor</label>
                                            <input
                                                type="number"
                                                id="value"
                                                name="value"
                                                value={newDiscount.value}
                                                onChange={handleChange}
                                                min="0.01"
                                                step="any"
                                                required
                                                className="p-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div className="flex flex-col w-1/3">
                                            <label htmlFor="type" className="text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={newDiscount.type}
                                                onChange={handleChange}
                                                className="p-2 border border-gray-300 rounded-lg bg-white h-[42px]"
                                            >
                                                <option value="percentage">% Porcentaje</option>
                                                <option value="fixed">Monto Fijo ($)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Campo de fecha de expiración ELIMINADO */}
                                    
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={newDiscount.isActive}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">Cupón Activo</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                >
                                    {loading ? 'Guardando...' : formMode === 'create' ? 'Crear' : 'Actualizar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabla de Cupones */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            {/* Columna de Expiración ELIMINADA */}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {discounts.map((discount) => (
                            <tr key={discount.code} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{discount.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {formatValue(discount.value, discount.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        discount.type === 'percentage' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {discount.type === 'percentage' ? <FaPercentage className="mr-1 mt-[2px]" /> : <FaMoneyBillWave className="mr-1 mt-[2px]" />}
                                        {discount.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleDiscountStatus(discount)}
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                                            discount.isActive 
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                        disabled={loading}
                                    >
                                        {discount.isActive ? <FaCheck className="mr-1 mt-[2px]"/> : <FaTimes className="mr-1 mt-[2px]"/>}
                                        {discount.isActive ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                                {/* Columna de Expiración ELIMINADA */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleEditClick(discount)}
                                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                        title="Editar Cupón"
                                        disabled={loading}
                                    >
                                        <FaEdit className="inline w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDiscount(discount.code)}
                                        className="text-red-600 hover:text-red-900 transition-colors"
                                        title="Eliminar Cupón"
                                        disabled={loading}
                                    >
                                        <FaTrash className="inline w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {discounts.length === 0 && !loading && (
                    <div className="text-center p-8 text-gray-500">No hay cupones creados aún.</div>
                )}
            </div>
        </div>
    );
};

export default CuponesManagement;