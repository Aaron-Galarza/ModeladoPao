import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageCarousel from './imagenCarousel';

const ScrollAnimatedCarousel: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);
    
    // 💡 CAMBIO 1: Reducir la altura del carrusel para escritorio (de 600px a 450px)
    // Usamos media query para solo aplicar este cambio en PC (md: min-width: 768px)
    const CAROUSEL_HEIGHT_PC_PX = 450;
    // Mantenemos una constante para móvil si la necesitáramos en el futuro, pero aquí
    // la altura real se define por CSS o la altura de contenido del Home en móvil
    const CAROUSEL_HEIGHT_MOVIL_PX = 600; // Mantenemos 600 solo como referencia si hiciera falta.

    const handleScroll = useCallback(() => {
        if (hasTriggered) return;

        if (!componentRef.current) return;

        const rect = componentRef.current.getBoundingClientRect();
        
        // 💡 CAMBIO 2: Ajustar el punto de activación para PC
        // Si la pantalla es grande (md), activamos antes (más abajo en el scroll).
        // Si no (móvil), mantenemos el valor por defecto.
        const isDesktop = window.innerWidth >= 768;
        // El nuevo valor 200 significa que el carrusel se activa cuando su borde superior
        // llega a 200px desde la parte superior de la ventana (ya has scrolleado un poco).
        const activationPoint = isDesktop ? 200 : 100;

        // Activar cuando el componente esté en el viewport
        if (rect.top <= activationPoint && rect.bottom >= 0) {
            setIsVisible(true);
            setHasTriggered(true);
        }
    }, [hasTriggered]);

    useEffect(() => {
        // Verificar visibilidad inicial
        handleScroll();
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // El useEffect para resetear se puede eliminar o mantener para desarrollo
    useEffect(() => {
        // No es necesario resetear, lo mantenemos por si ayuda en ciertos entornos
        // setIsVisible(false);
        // setHasTriggered(false);
    }, []);

    return (
        <div 
            ref={componentRef} 
            className="w-full"
            style={{ 
                // Aplicar altura para el espacio en PC
                height: window.innerWidth >= 768 ? `${CAROUSEL_HEIGHT_PC_PX}px` : 'auto', 
                minHeight: '1px'
            }}
        >
            <div 
                className={`sticky top-0 w-full overflow-hidden transition-all duration-1000 ease-out z-20 md:rounded-3xl border-4 md:border-6 border-white ${
                    isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-10'
                }`}
                style={{ 
                    // Aplicar altura al carrusel visible en PC
                    height: window.innerWidth >= 768 ? `${CAROUSEL_HEIGHT_PC_PX}px` : `${CAROUSEL_HEIGHT_MOVIL_PX}px`,
                    // Sombra exterior elegante y profesional
                    boxShadow: isVisible 
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)' 
                        : 'none'
                }}
            >
                {/* Nota: Hemos movido las clases de redondeo y borde al div sticky */}
                <ImageCarousel />
            </div>
        </div>
    );
};

export default ScrollAnimatedCarousel;