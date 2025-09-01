// hooks/useCartCount.ts
import { useEffect, useState } from 'react';
import { useCartStore } from '../components/checkout/cartStore';

export const useCartCount = () => {
  const [count, setCount] = useState(0);
  
  // Suscribirse al store completo y actualizar el count
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe(
      (state) => {
        const newCount = state.items.reduce((total, item) => total + item.quantity, 0);
        setCount(newCount);
      }
    );

    // Actualizar con el valor inicial
    const initialCount = useCartStore.getState().getItemCount();
    setCount(initialCount);

    return unsubscribe;
  }, []);

  return count;
};