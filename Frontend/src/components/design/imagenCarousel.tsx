import React, { useState, useEffect, useCallback, useRef } from 'react';

import Kity from '../../assets/images/kity.jpeg';
import Hada from '../../assets/images/hada.jpeg';
import Sirenita from '../../assets/images/pokemon.jpeg';

// Slides con una sola imagen
const images = [
  { src: Kity, },
  { src: Hada,  },
  { src: Sirenita },
];

type Props = {
  pausedExternal?: boolean; // Pausa externa (viewport, etc.)
};

const AUTOPLAY_MS = 5000;
const TRANSITION_MS = 700;

const ImageCarousel: React.FC<Props> = ({ pausedExternal = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [carouselLoaded, setCarouselLoaded] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  // Timer estable
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (pausedExternal) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, AUTOPLAY_MS);
  }, [clearTimer, pausedExternal]);

  const resetTimer = useCallback(() => {
    clearTimer();
    startTimer();
  }, [clearTimer, startTimer]);

  // Montaje suave
  useEffect(() => {
    const t = setTimeout(() => setCarouselLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Avance
  const nextSlide = useCallback(() => {
    if (isTransitioning) return; // evita doble disparo
    setIsTransitioning(true);
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [isTransitioning]);

  // Fin de la transición → liberamos y rearmamos timer
  useEffect(() => {
    if (!isTransitioning) return;
    const t = setTimeout(() => {
      setIsTransitioning(false);
      resetTimer(); // mantiene cadencia constante post-animación
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [isTransitioning, resetTimer]);

  // Arranque/pausa externa
  useEffect(() => {
    if (pausedExternal) {
      clearTimer();
    } else {
      startTimer();
    }
    return () => clearTimer();
  }, [pausedExternal, startTimer, clearTimer]);

  // Interacción del usuario → reiniciar contador
  const handleDotClick = (index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
    resetTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    const distance = touchStartX - touchEndX;
    const minSwipe = 80;
    if (Math.abs(distance) >= minSwipe) {
      if (distance > 0) nextSlide();
      else prevSlide();
      resetTimer();
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  return (
    <div
      className={`
        relative w-full mx-auto
        h-[550px] md:h-[530px]
        md:max-w-[900px]
        overflow-hidden bg-black transition-all duration-1000
        ${carouselLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      style={{
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.25),
          0 4px 12px rgba(0,0,0,0.25),
          inset 0 0 0 1px rgba(255,255,255,0.05)
        `,
        borderRadius: '12px',
      }}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 w-full h-full transition-all duration-700 ease-out transform-gpu
              ${index === currentImageIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'}
            `}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
          >
            <img
              src={image.src}
              alt={`Slide ${index + 1}`}
              loading="lazy"
              draggable={false}
              className={`
                w-full h-full ${image|| 'object-cover'} block transition-transform duration-1000
                ${index === currentImageIndex ? 'scale-100' : 'scale-110'}
              `}
              style={{ borderRadius: '12px' }}
            />
            {/* 👇 Overlay y textos eliminados completamente */}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform z-20">
        <div className="flex space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === i ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
