import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase.config';

interface AuthState {
  user: any;
  isAdmin: boolean;
  setUser: (user: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isAdmin: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },
}));