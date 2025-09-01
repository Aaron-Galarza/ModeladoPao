import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_QUANTITY_PER_ITEM = 50;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          if (existingItem.quantity < MAX_QUANTITY_PER_ITEM) {
            set({
              items: items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            });
          }
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      
      removeItem: (id: string) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },
      
      updateQuantity: (id: string, quantity: number) => {
        const { items } = get();
        const item = items.find(item => item.id === id);
        
        if (item && quantity > 0 && quantity <= MAX_QUANTITY_PER_ITEM) {
          set({
            items: items.map(item =>
              item.id === id
                ? { ...item, quantity }
                : item
            )
          });
        }
      },
      
      clearCart: () => {
        set({ items: [] }); // <-- Asegúrate de que esta línea esté presente y correcta
      },
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      closeCart: () => {
        set({ isOpen: false });
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);