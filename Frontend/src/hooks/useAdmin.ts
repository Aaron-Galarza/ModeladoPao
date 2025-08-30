import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth'; // ← Importación type-only

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null); // ← Ahora User está importado correctamente
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar claims del usuario
        const idTokenResult = await user.getIdTokenResult(true);
        setIsAdmin(idTokenResult.claims.admin === true);
      } catch (error) {
        console.error('Error verificando claims:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, user, loading };
};