import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase.config';

interface AuthState {
  user: any;
  isAdmin: boolean;
  loading: boolean; // ← NUEVA PROPIEDAD
  setUser: (user: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void; // ← NUEVA FUNCIÓN
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true, // ← Inicia en true (cargando)
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }), // ← Añade esta función
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isAdmin: false, loading: false }); // ← Actualiza loading también
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },
}));