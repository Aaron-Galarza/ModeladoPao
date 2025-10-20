
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Este componente no renderiza nada visible.
 * Su único propósito es ejecutar un "efecto secundario":
 * hacer scroll al inicio de la página (0,0) cada vez
 * que el 'pathname' (la ruta de la URL) cambia.
 */
function ScrollToTop() {

  const { pathname } = useLocation();

  useEffect(() => {
  
    window.scrollTo(0, 0);
    
  }, [pathname]);

  return null;
}

export default ScrollToTop;