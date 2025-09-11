import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import chavoPC from '../../assets/images/chavez.jpg';
import chavoMovil from '../../assets/images/chavo-movil.jpg';
import leonPC from '../../assets/images/escandalosos-pc.jpg';
import leonMovil from '../../assets/images/escandalosos-movil.jpg';
import sirenitaPC from '../../assets/images/sirenita-pc.jpg';
import sirenitaMovil from '../../assets/images/sirenita-movil.jpg';

const images = [
  { pc: chavoPC, movil: chavoMovil, title: "Personajes Divertidos", description: "Figuras únicas de tus personajes favoritos" },
  { pc: leonPC, movil: leonMovil, title: "Animales Salvajes", description: "Variedad de animales", customClass: "object-scale-down md:object-cover" },
  { pc: sirenitaPC, movil: sirenitaMovil, title: "Mundo Marino", description: "Explora las profundidades con nuestras creaciones" },
];

const ImageCarousel: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  }, [isTransitioning]);

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setCurrentImageIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isTransitioning) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 80;

    if (Math.abs(distance) < minSwipeDistance) {
      // No hay suficiente swipe, no hacer nada.
    } else if (distance > 0) {
      nextSlide(); // Swipe hacia la izquierda
    } else {
      prevSlide(); // Swipe hacia la derecha
    }

    setTouchStartX(0);
    setTouchEndX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };
  
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return (
    <div
      className="relative w-full overflow-hidden h-full bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Slides individuales con animación de revista */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 w-full h-full transition-all duration-700 ease-out transform-gpu
              ${index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}
            `}
          >
            <picture className="w-full h-full block">
              <source media="(min-width: 768px)" srcSet={image.pc} />
              <img
                src={image.movil}
                alt={`Slide ${index + 1}`}
                draggable={false}
                className={`w-full h-full ${image.customClass || 'object-cover'} block`}
              />
            </picture>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-24 p-6 md:p-8 text-white">
              <h2 className="text-2xl md:text-3xl font-bold font-cursive mb-2 drop-shadow-md">
                {image.title}
              </h2>
              <p className="text-lg md:text-xl font-sans max-w-md drop-shadow-md">
                {image.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navegación para móvil (flechas en esquinas) */}
      <button
        onClick={prevSlide}
        className="md:hidden absolute bottom-4 left-4 text-white/50 hover:text-white transition-colors z-10 p-2"
        aria-label="Anterior"
      >
        <FaChevronLeft size={30} />
      </button>
      <button
        onClick={nextSlide}
        className="md:hidden absolute bottom-4 right-4 text-white/50 hover:text-white transition-colors z-10 p-2"
        aria-label="Siguiente"
      >
        <FaChevronRight size={30} />
      </button>

      {/* Controles de Navegación para PC y puntos para ambas vistas */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-10">
        {/* Flecha izquierda (solo en PC) */}
        <button
          onClick={prevSlide}
          className="hidden md:flex bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300"
          aria-label="Anterior"
        >
          <FaChevronLeft size={20} />
        </button>

        {/* Puntos de navegación */}
        <div className="flex space-x-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === i ? 'bg-white scale-125' : 'bg-white/60'}`}
              aria-label={`Ir al slide ${i+1}`}
            />
          ))}
        </div>

        {/* Flecha derecha (solo en PC) */}
        <button
          onClick={nextSlide}
          className="hidden md:flex bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all duration-300"
          aria-label="Siguiente"
        >
          <FaChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ImageCarousel;