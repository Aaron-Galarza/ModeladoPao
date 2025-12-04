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
}

interface NewDiscountForm {
    code: string;
    value: number;
    type: 'percentage' | 'fixed';
    isActive: boolean;
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
        setNewDiscount({
            code: discount.code,
            value: discount.value,
            type: discount.type,
            isActive: discount.isActive,
        });
        
        setFormMode('edit');
        setCurrentDiscountId(discount.code);
        setIsFormOpen(true);
    };

    // ----------------------------------------------------
    // ACCIONES RÁPIDAS
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
    // HELPER FORMATO
    // ----------------------------------------------------
    
    const formatValue = (value: number, type: 'percentage' | 'fixed') => {
        return type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`;
    };

    // ----------------------------------------------------
    // RENDER DEL COMPONENTE
    // ----------------------------------------------------

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8"> {/* Padding bottom extra para móvil */}
            
            {/* ENCABEZADO RESPONSIVE: Stack en móvil, Row en desktop */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Gestión de Cupones
                </h1>
                <button
                    onClick={() => {
                        resetForm();
                        setIsFormOpen(true);
                    }}
                    className="w-full md:w-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-2 px-4 rounded-lg shadow transition-colors"
                >
                    <FaPlus className="mr-2" /> Crear Cupón
                </button>
            </div>

            {loading && (
                 <div className="flex justify-center items-center h-20 mb-4">
                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                 </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {/* MODAL / FORMULARIO RESPONSIVE */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-down">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
                                    {formMode === 'create' ? 'Crear Nuevo Cupón' : 'Editar Cupón'}
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label htmlFor="code" className="text-sm font-bold text-gray-700 mb-1">Código</label>
                                        <input
                                            type="text"
                                            id="code"
                                            name="code"
                                            value={newDiscount.code}
                                            onChange={handleChange}
                                            disabled={formMode === 'edit'}
                                            required
                                            placeholder="EJ: VERANO2024"
                                            className={`p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${formMode === 'edit' ? 'bg-gray-100 text-gray-500' : 'border-gray-300'}`}
                                        />
                                    </div>
                                    
                                    {/* Inputs Valor y Tipo en Stack para móvil */}
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex flex-col w-full md:w-2/3">
                                            <label htmlFor="value" className="text-sm font-bold text-gray-700 mb-1">Valor</label>
                                            <input
                                                type="number"
                                                id="value"
                                                name="value"
                                                value={newDiscount.value}
                                                onChange={handleChange}
                                                min="0.01"
                                                step="any"
                                                required
                                                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full md:w-1/3">
                                            <label htmlFor="type" className="text-sm font-bold text-gray-700 mb-1">Tipo</label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={newDiscount.type}
                                                onChange={handleChange}
                                                className="p-3 border border-gray-300 rounded-lg bg-white h-[50px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="percentage">%</option>
                                                <option value="fixed">$</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center pt-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={newDiscount.isActive}
                                            onChange={handleCheckboxChange}
                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">Activar cupón inmediatamente</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse md:flex-row justify-end gap-3 rounded-b-lg border-t">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full md:w-auto px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                >
                                    {loading ? 'Guardando...' : formMode === 'create' ? 'Crear Cupón' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* VISTA TABLET/DESKTOP (Tabla tradicional) - Oculta en móvil */}
            {/* ========================================================= */}
            <div className="hidden md:block bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {discounts.map((discount) => (
                            <tr key={discount.code} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{discount.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {formatValue(discount.value, discount.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${
                                        discount.type === 'percentage' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {discount.type === 'percentage' ? <FaPercentage className="mr-1" /> : <FaMoneyBillWave className="mr-1" />}
                                        {discount.type === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleDiscountStatus(discount)}
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors items-center ${
                                            discount.isActive 
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                        disabled={loading}
                                    >
                                        {discount.isActive ? <FaCheck className="mr-1"/> : <FaTimes className="mr-1"/>}
                                        {discount.isActive ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => handleEditClick(discount)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-1">
                                        <FaEdit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteDiscount(discount.code)} className="text-red-600 hover:text-red-900 transition-colors p-1">
                                        <FaTrash className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ========================================================= */}
            {/* VISTA MÓVIL (Tarjetas/Cards) - Oculta en Desktop */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {discounts.map((discount) => (
                    <div key={discount.code} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 relative">
                        {/* Cabecera de la Tarjeta */}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{discount.code}</h3>
                                <p className="text-gray-500 text-sm flex items-center mt-1">
                                    {discount.type === 'percentage' ? <FaPercentage className="mr-1 text-xs" /> : <FaMoneyBillWave className="mr-1 text-xs" />}
                                    {discount.type === 'percentage' ? 'Descuento porcentual' : 'Descuento fijo'}
                                </p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                discount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {discount.isActive ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                        </div>

                        {/* Valor Grande */}
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-blue-600">
                                {formatValue(discount.value, discount.type)}
                            </span>
                        </div>

                        {/* Acciones Footer */}
                        <div className="flex justify-between items-center border-t pt-3 mt-2">
                            {/* Toggle Switch Simulado */}
                            <button 
                                onClick={() => toggleDiscountStatus(discount)}
                                className={`text-sm font-medium flex items-center ${discount.isActive ? 'text-green-600' : 'text-gray-500'}`}
                            >
                                {discount.isActive ? <FaCheck className="mr-1"/> : <FaTimes className="mr-1"/>}
                                {discount.isActive ? 'Desactivar' : 'Activar'}
                            </button>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleEditClick(discount)} 
                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                >
                                    <FaEdit size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteDiscount(discount.code)} 
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {discounts.length === 0 && !loading && (
                <div className="text-center p-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
                    <p className="text-gray-500">No hay cupones creados aún.</p>
                </div>
            )}
        </div>
    );
};

export default CuponesManagement;