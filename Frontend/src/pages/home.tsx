import React from 'react';
// IMPORTACIÓN CORRECTA
import ScrollAnimatedCarousel from '../components/design/ScrollAnimatedCarousel'; 
import { 
  FaHeart, FaPalette, FaHandHoldingHeart, FaBrush, FaAward, 
  FaInstagram, FaWhatsapp, FaEnvelope, FaPaw, FaUserAlt, 
  FaLeaf, FaGift, FaSeedling, FaDove, FaCrown
} from 'react-icons/fa';
import ContactForm from '../components/design/ContactForm';

// Colores de marca (si los necesitás en otros lados)
const BRAND_PINK = '#f188af';
const BRAND_TEAL = '#87cfbc';
const ACCENT_GOLD = '#e6c25c';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafafa] to-[#f0f0f0] overflow-hidden">

      {/* Marquee superior */}
      <div className="bg-[#87cfbc] py-3 border-y border-[#87cfbc] overflow-hidden relative z-10">
        <div className="text-animation-container">
          <div className="text-animation-track">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="text-animation-item">
                <span className="text-lg md:text-xl font-cursive font-semibold text-white">
                  Paola Ferrari · Modelado en porcelana fría
                  <FaHeart className="inline mx-1" size={16} /> 
                  <FaHeart className="inline mx-1" size={16} /> 
                  <FaHeart className="inline mx-1" size={16} /> 
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero (solo texto / badges) dentro de un contenedor */}
      <div className="pt-16 pb-6 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full px-4 py-1 mb-4 shadow-sm border border-gray-200">
            <span className="text-gray-600 font-sans font-medium text-xs md:text-sm uppercase tracking-wider">
              Arte en Porcelana Fría
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-cursive font-bold text-gray-800 mb-4">
            Modelado <span className="text-[#f188af]">Pao</span>
          </h1>

          {/* Tarjeta blanca de presentación */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 max-w-3xl md:max-w-4xl mx-auto mt-6">
            <p className="text-lg md:text-xl text-gray-600 font-sans text-center leading-relaxed italic">
              "Soy Paola Ferrari y me dedico a crear piezas en porcelana fría. 
              Cada pieza está hecha a mano, con diseño, detalle y mucho amor."
            </p>
          </div>
        </div>
      </div>

      {/* 🔴 Carrusel full-width: SIN max-w del padre.
          El tamaño (ancho/alto) lo define ScrollAnimatedCarousel/ImageCarousel. */}
      <div className="relative w-full">
        {/* No hay max-w acá. Si querés padding lateral del layout, podés agregar px-4 */}
        <ScrollAnimatedCarousel />
      </div>

      {/* Sección de Categorías Destacadas */}
      <section className="py-16 px-4 md:px-8 bg-white relative">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#fafafa] rotate-45 z-0 border-l border-t border-gray-200 opacity-50"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cursive font-bold text-gray-800 mb-4">
              Colecciones Destacadas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-sans">
              Explora nuestras creaciones más buscadas y encuentra la pieza perfecta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Animales", icon: <FaPaw className="text-3xl" />, count: "120+ figuras", color: "from-white to-pink-50", hoverColor: 'text-pink-600' },
              { name: "Personajes", icon: <FaUserAlt className="text-3xl" />, count: "80+ diseños", color: "from-white to-purple-50", hoverColor: 'text-purple-600' },
              { name: "Flores", icon: <FaLeaf className="text-3xl" />, count: "95+ modelos", color: "from-white to-teal-50", hoverColor: 'text-teal-600' },
              { name: "Bodas", icon: <FaHeart className="text-3xl" />, count: "150+ opciones", color: "from-white to-amber-50", hoverColor: 'text-amber-600' }
            ].map((category, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group cursor-pointer"
              >
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4 shadow-md border border-gray-200 group-hover:scale-105 transition-transform duration-300`}
                  style={{ color: ACCENT_GOLD }}
                >
                  {category.icon}
                </div>
                <h3 className="font-cursive font-bold text-xl mb-2 text-gray-800">{category.name}</h3>
                <p className="text-sm text-gray-600 font-sans">{category.count}</p>
                <button className={`mt-4 text-[${ACCENT_GOLD}] hover:${category.hoverColor} text-sm font-semibold transition-colors flex items-center justify-center mx-auto`}>
                  Ver colección <span className="ml-1 font-bold">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100 px-4 md:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cursive font-bold text-gray-800 mb-4">
              ¿Por qué elegir Modelado Pao?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-sans">
              Calidad, creatividad y dedicación en cada pieza
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaAward className="text-3xl" />, title: "Calidad Premium", description: "Materiales de primera calidad que garantizan durabilidad y belleza y que tu pieza dure en el tiempo." },
              { icon: <FaHandHoldingHeart className="text-3xl" />, title: "Hecho con Amor", description: "Cada pieza es creada artesanalmente con atención a los detalles, poniendo el corazón en el proceso." },
              { icon: <FaBrush className="text-3xl" />, title: "Diseño Personalizado", description: "Creamos figuras únicas según tus preferencias y necesidades para ese evento especial." }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div 
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-gray-200"
                  style={{ color: ACCENT_GOLD }}
                >
                  {benefit.icon}
                </div>
                <h3 className="font-cursive font-bold text-xl mb-3 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600 font-sans">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto + Redes */}
      <section className="w-full bg-gradient-to-br from-gray-50 to-[rgb(240,236,238)] py-16">
        <div className="w-full mx-auto text-center px-4 md:px-8">
          <ContactForm
            title="¡Hablemos de tu idea!"
            subtitle="¿Tenés un evento o una idea para un diseño personalizado? Dejanos tus datos y te contactaremos a la brevedad."
            templateSubject="NUEVO INTERESADO: {Nombre} por Contacto/Pedido"
            templateId="template_eikyi4r"
            buttonText="Quiero que me contacten"
            successMessage="¡Gracias por tu interés! Te contactaremos lo antes posible para empezar a modelar tu idea."
          />

          <div className="mt-10 pt-8 border-t border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-xl font-cursive font-bold text-gray-800 mb-4">Sígueme en redes sociales</h3>
            <div className="flex justify-center space-x-6">
              <a href="https://www.instagram.com/modeladopao/" className="text-[#e6c25c] hover:text-[#d4b14a] transition-colors">
                <FaInstagram className="text-3xl" />
              </a>
              <a href="https://wa.me/543624088244" className="text-[#e6c25c] hover:text-[#d4b14a] transition-colors">
                <FaWhatsapp className="text-3xl" />
              </a>
              <a href="https://mail.google.com/mail/u/0/?fs=1&to=modeladopao7@gmail.com&tf=cm" className="text-[#e6c25c] hover:text-[#d4b14a] transition-colors">
                <FaEnvelope className="text-3xl" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Estilos del marquee */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Quicksand:wght@300;400;500&display=swap');
        .font-cursive { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Quicksand', sans-serif; }

        .text-animation-container { width: 100%; overflow: hidden; position: relative; height: 32px; display: flex; align-items: center; }
        .text-animation-track { display: flex; animation: scrollText 35s infinite linear; white-space: nowrap; }
        .text-animation-item { display: inline-flex; align-items: center; padding: 0 1rem; }
        @keyframes scrollText { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .text-animation-container:hover .text-animation-track { animation-play-state: paused; }
        .text-animation-container::before,
        .text-animation-container::after { content: ''; position: absolute; top: 0; height: 100%; width: 50px; z-index: 2; }
        .text-animation-container::before { left: 0; background: linear-gradient(to right, #87cfbc, transparent); }
        .text-animation-container::after { right: 0; background: linear-gradient(to left, #87cfbc, transparent); }

        @media (max-width: 768px) {
          .text-animation-item span { font-size: 16px; }
          .text-animation-container::before, .text-animation-container::after { width: 30px; }
          .text-animation-item { padding: 0 0.5rem; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
