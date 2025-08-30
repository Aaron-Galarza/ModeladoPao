import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase.config';
import { useAuthStore } from '../admin/authStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setIsAdmin, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          setIsAdmin(idTokenResult.claims.admin === true);
        } catch (error) {
          console.error('Error verificando claims:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);

  return <>{children}</>;
};