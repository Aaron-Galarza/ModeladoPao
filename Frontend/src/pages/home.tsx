import React from 'react';
import ImageCarousel from '../components/design/imagenCarousel';
import { FaStar, FaHeart, FaPalette, FaHandHoldingHeart, FaBrush, FaAward, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f0f0f0] overflow-hidden">
      {/* Texto animado horizontalmente - Con fondo verde menta */}
      <div className="bg-[#87cfbc] py-3 border-y border-[#87cfbc] overflow-hidden relative">
        <div className="text-animation-container">
          <div className="text-animation-track">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="text-animation-item">
                <span className="text-lg md:text-xl font-cursive font-semibold text-white">
                  Paola Ferrari · Porcelana Fría · Creaciones artesanales únicas · 🤍🤍🤍  
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section con título y carrusel */}
      <div className="pt-8 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#f5f5f5] rounded-full px-4 py-1 mb-4">
            <span className="text-[#666] font-medium text-xs md:text-sm uppercase tracking-wider">Arte en Porcelana Fría</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-cursive font-bold text-[#333] mb-4">
            Modelado <span className="text-[#f188af]">Pao</span>
          </h1>
          
          {/* Texto de presentación inspirado en la imagen */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#e0e0e0] max-w-2xl mx-auto mt-6">
            <p className="text-lg md:text-xl text-[#555] font-sans text-center leading-relaxed italic">
              "Soy Paola Ferrari y me dedico a crear piezas en porcelana fría. 
              Cada pieza está hecha a mano, con diseño, detalle y mucho amor."
            </p>
          </div>
        </div>

        {/* Carrusel con contenedor mejorado para PC y mobile */}
        <div className="relative px-0 md:px-0 pb-8 w-full max-w-5xl mx-auto carousel-container">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl border-4 md:border-6 border-white w-full carousel-wrapper">
            <ImageCarousel />
          </div>
        </div>
      </div>

      {/* Sección de Categorías Destacadas */}
      <section className="py-16 px-4 md:px-8 bg-white relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rotate-45 z-0"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cursive font-bold text-[#333] mb-4">
              Categorías Populares
            </h2>
            <p className="text-lg text-[#555] max-w-2xl mx-auto">
              Explora nuestras colecciones más buscadas de figuras en porcelana fría
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Animales", icon: "🦄", count: "120+ figuras", color: "from-[#e8f5e9] to-[#c8e6c9]" },
              { name: "Personajes", icon: "🎭", count: "80+ diseños", color: "from-[#fce4ec] to-[#f8bbd0]" },
              { name: "Flores", icon: "🌸", count: "95+ modelos", color: "from-[#f3e5f5] to-[#e1bee7]" },
              { name: "Souvenirs", icon: "🎁", count: "150+ opciones", color: "from-[#fff3e0] to-[#ffe0b2]" }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#e0e0e0] group">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="font-cursive font-semibold text-xl mb-2 text-[#333]">{category.name}</h3>
                <p className="text-sm text-[#666]">{category.count}</p>
                <button className="mt-4 text-[#e6c25c] text-sm font-medium hover:text-[#d4af37] transition-colors flex items-center justify-center mx-auto">
                  Ver colección <span className="ml-1">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Beneficios */}
      <section className="py-16 bg-gradient-to-b from-[#fafafa] to-[#f5f5f5] px-4 md:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cursive font-bold text-[#333] mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-[#555] max-w-2xl mx-auto">
              Calidad, creatividad y dedicación en cada pieza
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaAward className="text-3xl text-[#e6c25c]" />, title: "Calidad Premium", description: "Materiales de primera calidad que garantizan durabilidad y belleza" },
              { icon: <FaHandHoldingHeart className="text-3xl text-[#e6c25c]" />, title: "Hecho con Amor", description: "Cada pieza es creada artesanalmente con atención a los detalles" },
              { icon: <FaBrush className="text-3xl text-[#e6c25c]" />, title: "Personalización", description: "Creamos figuras únicas según tus preferencias y necesidades" }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg border border-[#e0e0e0] hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-cursive font-semibold text-xl mb-3 text-[#333]">{benefit.title}</h3>
                <p className="text-[#555]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="py-16 px-4 md:px-8 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cursive font-bold text-[#333] mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-[#555] max-w-2xl mx-auto">
              Experiencias reales de quienes han confiado en nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "María L.", comment: "Las figuras para el bautismo de mi hijo fueron perfectas. ¡Todos preguntaron dónde las conseguí!", rating: 5 },
              { name: "Carlos R.", comment: "Pedí unos animalitos para decorar la torta de mi hija y superaron todas mis expectativas.", rating: 5 },
              { name: "Ana M.", comment: "La calidad de la porcelana fría es excelente. Se nota que usan materiales de primera.", rating: 4 }
            ].map((testimonial, index) => (
              <div key={index} className="bg-[#fafafa] rounded-2xl p-6 shadow-lg border border-[#e0e0e0] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-lg ${i < testimonial.rating ? 'text-[#f3c622]' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-[#555] italic mb-4 text-center">"{testimonial.comment}"</p>
                <p className="font-semibold text-[#333] text-center">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Contacto/Newsletter - Ocupa toda la página */}
      <section className="w-full bg-gradient-to-br from-[#f5f5f5] to-[rgb(240, 236, 238] py-16">
        <div className="w-full mx-auto text-center px-4 md:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-[#e0e0e0]">
            <h2 className="text-3xl md:text-4xl font-cursive font-bold text-[#333] mb-4">
              ¡No te pierdas nada!
            </h2>
            <p className="text-[#555] mb-6 text-lg max-w-2xl mx-auto">
              Suscríbete a nuestro newsletter y recibe novedades, descuentos exclusivos y tutoriales de porcelana fría
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="flex-1 px-4 py-3 rounded-full border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#e6c25c] text-[#333]"
              />
              <button className="bg-gradient-to-r from-[#e6c25c] to-[#d4af37] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Suscribirme
              </button>
            </div>
            
            <div className="mt-10 pt-8 border-t border-[#e0e0e0]">
              <h3 className="text-xl font-cursive font-semibold text-[#333] mb-4">Sígueme en redes sociales</h3>
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-[#e6c25c] hover:text-[#d4af37] transition-colors">
                  <FaInstagram className="text-2xl" />
                </a>
                <a href="#" className="text-[#e6c25c] hover:text-[#d4af37] transition-colors">
                  <FaWhatsapp className="text-2xl" />
                </a>
                <a href="#" className="text-[#e6c25c] hover:text-[#d4af37] transition-colors">
                  <FaEnvelope className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estilos personalizados para fuentes y animación */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Quicksand:wght@300;400;500&display=swap');
          .font-cursive {
            font-family: 'Playfair Display', serif;
          }
          .font-sans {
            font-family: 'Quicksand', sans-serif;
          }
          
          /* Animación de texto continua y lenta - CON MENOS SEPARACIÓN */
          .text-animation-container {
            width: 100%;
            overflow: hidden;
            position: relative;
            height: 32px;
            display: flex;
            align-items: center;
          }
          
          .text-animation-track {
            display: flex;
            animation: scrollText 35s infinite linear;
            white-space: nowrap;
          }
          
          .text-animation-item {
            display: inline-flex;
            align-items: center;
            padding: 0 1rem; /* Reducido de 2rem a 1rem para menos separación */
          }
          
          @keyframes scrollText {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          
          /* Pausar animación al hacer hover */
          .text-animation-container:hover .text-animation-track {
            animation-play-state: paused;
          }
          
          /* Efecto de degradado en los bordes */
          .text-animation-container::before,
          .text-animation-container::after {
            content: '';
            position: absolute;
            top: 0;
            height: 100%;
            width: 50px;
            z-index: 2;
          }
          
          .text-animation-container::before {
            left: 0;
            background: linear-gradient(to right, #87cfbc, transparent);
          }
          
          .text-animation-container::after {
            right: 0;
            background: linear-gradient(to left, #87cfbc, transparent);
          }
          
          /* Asegurar que el carrusel ocupe todo el ancho disponible */
          .carousel-container {
            width: 100%;
            margin: 0 auto;
          }
          
          .carousel-wrapper {
            width: 100%;
            height: auto;
            aspect-ratio: 16/9;
          }
          
          /* Mejoras de responsive */
          @media (max-width: 768px) {
            .carousel-wrapper {
              aspect-ratio: 9/16;
            }
            
            .text-animation-item span {
              font-size: 16px;
            }
            
            .text-animation-container::before,
            .text-animation-container::after {
              width: 30px;
            }
            
            .text-animation-item {
              padding: 0 0.5rem; /* Aún menos separación en móviles */
            }
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;