import React, { useLayoutEffect } from 'react';
import { FiArrowLeft, FiPlus, FiMinus,  FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../components/checkout/cartStore';

const MAX_QUANTITY_PER_ITEM = 1;

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotal, 
    clearCart,
    getItemCount 
  } = useCartStore();

  useLayoutEffect(() => {
    useCartStore.getState(); 
  }, []);

  const calculateItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0ecee]">
        <div className="container mx-auto max-w-4xl py-12 px-4 min-h-screen flex flex-col justify-center items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-md transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center">
                  <FiShoppingCart className="w-10 h-10 text-pink-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-500 mb-8">
                ¡Elige algo lindo de nuestro catálogo!
              </p>
              <Link
                to="/catalogo"
                className="block w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Ir a comprar
              </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ecee] py-8 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header Carrito */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Link 
            to="/catalogo" 
            className="flex items-center text-pink-600 hover:text-pink-700 transition-colors font-medium text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2" />
            Seguir Comprando
          </Link>
          
          <div className="flex items-baseline gap-2">
             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-poppins">
               Mi Carrito
             </h1>
             <span className="text-gray-500 text-sm">
               ({getItemCount()} items)
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
               <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                 <h2 className="text-lg font-semibold text-gray-700">Productos</h2>
                 <button
                   onClick={clearCart}
                   className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center font-medium"
                 >
                   <FiTrash2 className="mr-1" /> Vaciar
                 </button>
               </div>
               
               <div className="space-y-4">
                 {items.map((item) => (
                   <CartItemComponent
                     key={item.id}
                     item={item}
                     onUpdateQuantity={updateQuantity}
                     onRemove={removeItem}
                     calculateTotal={calculateItemTotal}
                   />
                 ))}
               </div>
            </div>
          </div>

          {/* Resumen Lateral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 font-poppins border-b border-gray-100 pb-4">
                Resumen
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium text-sm">A convenir</span>
                </div>
                
                <div className="flex justify-between text-2xl font-bold text-gray-800 pt-4 mt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-pink-600">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-pink-600 text-white py-4 rounded-xl hover:bg-pink-700 transition-colors font-bold text-lg shadow-md flex items-center justify-center gap-2"
              >
                Finalizar Compra <FiArrowLeft className="transform rotate-180" />
              </Link>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                 Transacciones seguras y encriptadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE ITEM MEJORADO PARA MÓVIL ---
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  calculateTotal: (price: number, quantity: number) => number;
}

const CartItemComponent: React.FC<CartItemProps> = ({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  calculateTotal 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-pink-100 transition-colors bg-white">
      {/* Imagen + Info Básica (Siempre en fila) */}
      <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-800 text-base leading-tight mb-1 line-clamp-2">
              {item.name}
            </h3>
            <p className="text-pink-600 font-bold text-lg">
                ${item.price}
            </p>
          </div>
      </div>

      {/* Controles + Subtotal + Eliminar (Abajo en móvil, Derecha en Desktop) */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
          
          {/* Selector de Cantidad */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white shadow-sm disabled:opacity-30 disabled:shadow-none transition-all text-gray-600"
            >
              <FiMinus size={14} />
            </button>
            <span className="w-8 text-center font-semibold text-gray-800 text-sm">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white shadow-sm disabled:opacity-30 disabled:shadow-none transition-all text-gray-600"
            >
              <FiPlus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
             <div className="text-right">
                <span className="block text-xs text-gray-400 sm:hidden">Total:</span>
                <p className="font-bold text-lg text-gray-800">
                    ${calculateTotal(item.price, item.quantity).toFixed(2)}
                </p>
             </div>
             
             <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title="Eliminar producto"
             >
                <FiTrash2 size={18} />
             </button>
          </div>
      </div>
    </div>
  );
};

export default CartPage;