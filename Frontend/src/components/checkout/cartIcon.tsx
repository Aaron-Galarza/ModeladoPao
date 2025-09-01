// CartIcon.tsx - VERSIÓN DEFINITIVA
import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCartCount } from '../../hooks/useCartCount'; // Ajusta la ruta

const CartIcon: React.FC = () => {
  const itemCount = useCartCount();
  
  console.log('🛒 CartIcon count:', itemCount);

  return (
    <Link 
      to="/cart"
      className="relative p-2 text-gray-700 hover:text-pink-500 transition-colors"
    >
      <FiShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs 
                        rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;