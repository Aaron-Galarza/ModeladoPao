import React, { useLayoutEffect } from 'react';
import { FiArrowLeft, FiPlus, FiMinus, FiX, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../components/checkout/cartStore';

// Define el límite de cantidad por producto
const MAX_QUANTITY_PER_ITEM = 50;

// La interfaz no necesita la propiedad 'stock'
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

  // Usa useLayoutEffect para asegurar que el estado se actualice
  // justo antes de que el componente sea pintado en la pantalla
  useLayoutEffect(() => {
    useCartStore.getState(); 
  }, []);

  const calculateItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(240, 236, 238)' }}>
        <div className="absolute inset-0" style={{ backgroundColor: 'rgb(240, 236, 238)' }} />
        
        <div className="relative z-10 container mx-auto max-w-4xl py-12 px-4 min-h-screen flex flex-col">
          <div className="flex items-center mb-8">
            <Link 
              to="/catalogo" 
              className="flex items-center text-pink-600 hover:text-pink-700 transition-colors font-semibold"
            >
              <FiArrowLeft className="mr-2" />
              Volver al Catálogo
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:scale-[1.01] transition-transform duration-200 w-full max-w-md">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                  <FiShoppingCart className="w-12 h-12 text-pink-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-poppins">
                Tu carrito está vacío
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                ¡Explora nuestro catálogo y encuentra algo especial!
              </p>
              <Link
                to="/catalogo"
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl 
                           hover:from-pink-600 hover:to-pink-700 transition-all duration-300 
                           font-semibold text-lg shadow-lg hover:shadow-xl inline-block"
              >
                Descubrir Productos
              </Link>
            </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(240, 236, 238)' }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgb(240, 236, 238)' }} />
      
      <div className="relative z-10 container mx-auto max-w-6xl py-12 px-4 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <Link 
            to="/catalogo" 
            className="flex items-center text-pink-600 hover:text-pink-700 transition-colors font-semibold"
          >
            <FiArrowLeft className="mr-2" />
            Seguir Comprando
          </Link>
          
          <div className="text-center sm:text-right">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center sm:justify-end font-poppins">
              <FiShoppingCart className="mr-3 text-pink-500" />
              Mi Carrito
            </h1>
            <p className="text-gray-600 mt-2">
              {getItemCount()} {getItemCount() === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 font-poppins">
                  Productos seleccionados
                </h2>
                <button
                  onClick={clearCart}
                  className="flex items-center text-red-500 hover:text-red-700 transition-colors font-semibold"
                >
                  <FiTrash2 className="mr-2" />
                  Vaciar Carrito
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-poppins">
                Resumen de compra
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${getTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold text-green-600">A convenir</span>
                </div>

                <hr className="my-4 border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-pink-600">${getTotal().toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 
                          rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 
                          font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Proceder al Pago
                <FiArrowLeft className="ml-2 transform rotate-180" />
              </Link>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">✅ Beneficios:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Devoluciones gratuitas por 30 días</li>
                  <li>• Soporte prioritario 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="h-8"></div>
      </div>
    </div>
  );
};

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
    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
          {item.name}
        </h3>
        <p className="text-pink-600 font-bold text-lg">${item.price}</p>
        
        <div className="flex items-center space-x-3 mt-3">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FiMinus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <span className="w-8 text-center font-semibold text-gray-800">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-lg text-gray-800">
          ${calculateTotal(item.price, item.quantity).toFixed(2)}
        </p>
        
        <button
          onClick={() => onRemove(item.id)}
          className="mt-2 text-red-500 hover:text-red-700 transition-colors text-sm"
        >
          <FiX className="w-4 h-4 inline mr-1" />
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default CartPage;