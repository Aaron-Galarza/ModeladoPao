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
    const [carouselLoaded, setCarouselLoaded] = useState(false);

    // Animación de entrada del carrusel
    useEffect(() => {
        const timer = setTimeout(() => {
            setCarouselLoaded(true);
        }, 300);
        
        return () => clearTimeout(timer);
    }, []);

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

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEndX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (isTransitioning) return;
        const distance = touchStartX - touchEndX;
        const minSwipeDistance = 80;

        if (Math.abs(distance) < minSwipeDistance) return;
        
        if (distance > 0) {
            nextSlide();
        } else {
            prevSlide();
        }

        setTouchStartX(0);
        setTouchEndX(0);
    };

    // Auto-advance
    useEffect(() => {
        if (isTransitioning) return;
        
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentImageIndex, isTransitioning, nextSlide]);

    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => setIsTransitioning(false), 700);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    return (
        <div
            className={`relative w-full overflow-hidden h-full bg-black transition-all duration-1000 ${
                carouselLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-roledescription="carousel"
            // Contorno negro difuminado elegante
            style={{
                boxShadow: `
                    0 0 0 1px rgba(0, 0, 0, 0.3),
                    0 4px 20px rgba(0, 0, 0, 0.5),
                    0 8px 40px rgba(0, 0, 0, 0.4),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.1)
                `,
                borderRadius: '12px' // Bordes redondeados suaves
            }}
        >
            {/* Slides individuales con animación mejorada */}
            <div className="absolute inset-0">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`
                            absolute inset-0 w-full h-full transition-all duration-700 ease-out transform-gpu
                            ${index === currentImageIndex 
                                ? 'opacity-100 scale-100 z-10' 
                                : 'opacity-0 scale-105 pointer-events-none z-0'
                            }
                        `}
                        style={{
                            borderRadius: '12px', // Coherencia con el contenedor
                            overflow: 'hidden' // Para que las imágenes respeten el border-radius
                        }}
                    >
                        <picture className="w-full h-full block">
                            <source media="(min-width: 768px)" srcSet={image.pc} />
                            <img
                                src={image.movil}
                                alt={`Slide ${index + 1}`}
                                draggable={false}
                                className={`w-full h-full ${image.customClass || 'object-cover'} block transition-transform duration-1000 ${
                                    index === currentImageIndex ? 'scale-100' : 'scale-110'
                                }`}
                                style={{
                                    borderRadius: '12px' // Bordes redondeados en las imágenes
                                }}
                            />
                        </picture>

                        {/* Overlay con gradiente mejorado */}
                        <div 
                            className={`absolute inset-0 flex flex-col justify-end pb-24 p-6 md:p-8 text-white transition-all duration-1000 ${
                                index === currentImageIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                            style={{
                                background: `
                                    linear-gradient(
                                        180deg, 
                                        transparent 0%, 
                                        rgba(0, 0, 0, 0.1) 30%, 
                                        rgba(0, 0, 0, 0.3) 50%, 
                                        rgba(0, 0, 0, 0.7) 70%, 
                                        rgba(0, 0, 0, 0.9) 100%
                                    )
                                `,
                                borderRadius: '12px'
                            }}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold font-cursive mb-2 drop-shadow-lg">
                                {image.title}
                            </h2>
                            <p className="text-lg md:text-xl font-sans max-w-md drop-shadow-lg">
                                {image.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navegación para móvil - Mejorada con sombras */}
            <button
                onClick={prevSlide}
                className="md:hidden absolute bottom-4 left-4 text-white/90 hover:text-white transition-all duration-300 z-20 p-3 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm shadow-lg"
                aria-label="Anterior"
                style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                <FaChevronLeft size={22} />
            </button>
            <button
                onClick={nextSlide}
                className="md:hidden absolute bottom-4 right-4 text-white/90 hover:text-white transition-all duration-300 z-20 p-3 bg-black/50 rounded-full hover:bg-black/70 backdrop-blur-sm shadow-lg"
                aria-label="Siguiente"
                style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                <FaChevronRight size={22} />
            </button>

            {/* Controles de Navegación - Mejorados con sombras */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 z-20">
                {/* Flecha izquierda (solo en PC) */}
                <button
                    onClick={prevSlide}
                    className="hidden md:flex bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg"
                    aria-label="Anterior"
                    style={{
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <FaChevronLeft size={18} />
                </button>

                {/* Puntos de navegación con sombras */}
                <div className="flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${
                                currentImageIndex === i 
                                    ? 'bg-white scale-125 shadow-white/50' 
                                    : 'bg-white/60 hover:bg-white/80 shadow-black/30'
                            }`}
                            aria-label={`Ir al slide ${i+1}`}
                        />
                    ))}
                </div>

                {/* Flecha derecha (solo en PC) */}
                <button
                    onClick={nextSlide}
                    className="hidden md:flex bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg"
                    aria-label="Siguiente"
                    style={{
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <FaChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ImageCarousel;