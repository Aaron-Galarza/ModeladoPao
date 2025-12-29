import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';

// Carga diferida del carrusel
// Asegúrate de que el nombre del archivo importado coincida (ej: './ImageCarousel')
const LazyImageCarousel = lazy(() => import('./imagenCarousel'));

const WRAPPER_BASE_CLASSES = 'w-full';
const STICKY_BASE_CLASSES =
  'sticky top-0 w-full overflow-hidden transition-all duration-700 ease-out z-20 md:rounded-3xl border-4 md:border-[6px] border-white';

// 🔧 AJUSTES OPCIÓN 3: Más grande en PC
// Aumentamos altura en PC (md:h-[600px]) para dar aire a imágenes verticales
const HEIGHT_CLASSES = 'h-[500px] md:h-[550px]';
// Aumentamos ancho máximo en PC (md:max-w-[1000px]) para usar mejor la pantalla
const WIDTH_CLASSES  = 'w-[92%] mx-auto md:max-w-[500px]';

const ScrollAnimatedCarousel: React.FC = () => {
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        setHasUserScrolled(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const topMargin = isDesktop ? '-200px' : '-100px';

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { root: null, rootMargin: `${topMargin} 0px 0px 0px`, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasUserScrolled) {
      setIsMounted(true);
    }
  }, [hasUserScrolled]);

  return (
    <div
      ref={wrapperRef}
      className={`${WRAPPER_BASE_CLASSES} ${WIDTH_CLASSES} ${HEIGHT_CLASSES}`}
    >
      <div
        className={`${STICKY_BASE_CLASSES} ${WIDTH_CLASSES} ${HEIGHT_CLASSES} ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{
          boxShadow: isVisible
            ? '0 8px 24px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.05)'
            : 'none',
        }}
      >
        {isMounted ? (
          <Suspense fallback={null}>
            <LazyImageCarousel pausedExternal={!isVisible} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
};

export default ScrollAnimatedCarousel;