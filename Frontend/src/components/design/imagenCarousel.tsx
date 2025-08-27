import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import chavoPC from '../../assets/images/chavez.jpg'; 
import chavoMovil from '../../assets/images/chavo-movil.jpg';
import leonPC from '../../assets/images/escandalosos-pc.jpg';
import leonMovil from '../../assets/images/escandalosos-movil.jpg';
import sirenitaPC from '../../assets/images/sirenita-pc.jpg';
import sirenitaMovil from '../../assets/images/sirenita-movil.jpg';

const images = [
  { pc: chavoPC, movil: chavoMovil, title: "Personajes Divertidos", description: "Figuras únicas de tus personajes favoritos" },
  { pc: leonPC, movil: leonMovil, title: "Animales Salvajes", description: "Crea tu propio zoológico con nuestras figuras", customClass: "object-scale-down md:object-cover" },
  { pc: sirenitaPC, movil: sirenitaMovil, title: "Mundo Marino", description: "Explora las profundidades con nuestras creaciones" },
];

const ImageCarousel: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 6000);
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(p => (p === images.length - 1 ? 0 : p + 1));
      setIsTransitioning(false);
    }, 300);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(p => (p === 0 ? images.length - 1 : p - 1));
      setIsTransitioning(false);
    }, 300);
  }, []);

  const handleDotClick = (index: number) => {
    if (index === currentImageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    // Pausar transición automática durante el touch
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
    
    // Efecto de arrastre en tiempo real
    if (trackRef.current && touchStartX !== 0) {
      const dragDistance = touchStartX - e.touches[0].clientX;
      const dragOffset = dragDistance / carouselRef.current!.offsetWidth;
      const dragPercentage = currentImageIndex * 100 + dragOffset * 100;
      
      trackRef.current.style.transform = `translateX(-${dragPercentage}%)`;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) { 
      setTouchStartX(0); 
      setTouchEndX(0); 
      return; 
    }
    
    // Restaurar transición
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 700ms ease-out';
    }
    
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) < minSwipeDistance) { 
      // Si no hay swipe suficiente, volver a la slide actual
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentImageIndex * 100}%)`;
      }
      setTouchStartX(0); 
      setTouchEndX(0); 
      return; 
    }
    
    if (distance > 0) nextSlide(); 
    else prevSlide();
    
    setTouchStartX(0); 
    setTouchEndX(0);
  };

  // Forzar repintado para evitar líneas blancas
  useEffect(() => {
    const forceRepaint = () => {
      if (trackRef.current) {
        // eslint-disable-next-line no-unused-expressions
        trackRef.current.offsetHeight;
      }
    };

    forceRepaint();
    window.addEventListener('resize', forceRepaint);
    
    return () => {
      window.removeEventListener('resize', forceRepaint);
    };
  }, []);

  return (
    <div
      ref={carouselRef}
      className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl h-[80vh] max-h-[700px] min-h-[500px] bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {/* TRACK con referencia para control manual */}
      <div
        ref={trackRef}
        className="flex h-full transition-transform duration-700 ease-out transform-gpu will-change-transform"
        style={{
          transform: `translateX(-${currentImageIndex * 100}%)`
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-full flex-shrink-0 bg-black"
            style={{ width: '100%' }}
          >
            <picture className="w-full h-full block">
              <source media="(min-width: 768px)" srcSet={image.pc} />
              <img
                src={image.movil}
                alt={`Slide ${index + 1}`}
                draggable={false}
                className={`w-full h-full ${image.customClass || 'object-cover'} block`}
                style={{ 
                  display: 'block', 
                  transform: 'translateZ(0)', 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                onLoad={() => {
                  // Forzar repintado después de cargar cada imagen
                  if (trackRef.current) {
                    // eslint-disable-next-line no-unused-expressions
                    trackRef.current.offsetHeight;
                  }
                }}
              />
            </picture>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-20 p-6 md:p-8 text-white">
              <h2 className="text-2xl md:text-4xl font-bold font-poppins mb-2 drop-shadow-md">
                {image.title}
              </h2>
              <p className="text-lg md:text-xl font-quicksand max-w-md drop-shadow-md">
                {image.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Flechas desktop */}
      <button 
        onClick={prevSlide} 
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 z-10" 
        aria-label="Anterior"
      >
        <FaChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide} 
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300 z-10" 
        aria-label="Siguiente"
      >
        <FaChevronRight size={24} />
      </button>

      {/* dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, i) => (
          <button 
            key={i} 
            onClick={() => handleDotClick(i)} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === i ? 'bg-white scale-125' : 'bg-white/60'}`} 
            aria-label={`Ir al slide ${i+1}`} 
          />
        ))}
      </div>

      {/* progress */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/50 z-10 overflow-hidden">
        <div 
          className="h-full bg-white transition-all ease-linear" 
          style={{ 
            width: isTransitioning ? '0%' : '100%', 
            transition: isTransitioning ? 'none' : 'width 5s linear' 
          }} 
        />
      </div>
    </div>
  );
};

export default ImageCarousel;