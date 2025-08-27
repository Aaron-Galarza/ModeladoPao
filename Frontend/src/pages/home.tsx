import React from 'react';
import ImageCarousel from '../components/design/imagenCarousel';
import { FaStar, FaHeart, FaPalette } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="h-auto bg-gradient-to-b from-[#eaeaea] to-[#f5f5f5]">
      {/* Título arriba del carrusel */}
      <div className="text-center pt-10 pb-6 px-4">
        <h1 className="text-4xl md:text-5xl font-poppins font-extrabold text-[var(--text-color)] drop-shadow-md mb-4">
          ¡Bienvenidos a <span className="text-[var(--link-hover)]">MODELADO PAO</span>!
        </h1>
        <p className="text-lg md:text-xl text-gray-700 font-poppins mb-2">
          Donde la creatividad toma forma en porcelana fría
        </p>
        <p className="text-md text-gray-600 font-poppins italic max-w-2xl mx-auto">
          Descubre las mejores piezas de porcelana fría para tus proyectos y celebraciones.
        </p>
      </div>

      {/* Carrusel */}
      <div className="px-4 md:px-8 pb-12">
        <ImageCarousel />
      </div>

      {/* Sección de Categorías Destacadas */}
      <section className="py-16 px-4 md:px-8 bg-white rounded-lg shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-[var(--text-color)] mb-4">
              Categorías Populares
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestras colecciones más buscadas de figuras en porcelana fría
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Animales", icon: "🦄", count: "120+ figuras", color: "from-[var(--pastel-menta)] to-[#6ab7a4]" },
              { name: "Personajes", icon: "🎭", count: "80+ diseños", color: "from-[#F8C8DC] to-[#f8a5c5]" },
              { name: "Flores", icon: "🌸", count: "95+ modelos", color: "from-[#ffd6e0] to-[#ffb3c8]" },
              { name: "Souvenirs", icon: "🎁", count: "150+ opciones", color: "from-[#c9f5e1] to-[#87cfbc]" }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl mx-auto mb-4`}>
                  {category.icon}
                </div>
                <h3 className="font-poppins font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
                <button className="mt-4 text-[var(--pastel-pink)] text-sm font-medium hover:text-[#d64d83] transition-colors">
                  Ver colección →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Beneficios */}
      <section className="py-16 bg-gradient-to-r from-[#fdf2f8] to-[#f0fdf4] px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-[var(--text-color)] mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calidad, creatividad y dedicación en cada pieza
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaStar className="text-3xl text-yellow-400" />, title: "Calidad Premium", description: "Materiales de primera calidad que garantizan durabilidad y belleza" },
              { icon: <FaHeart className="text-3xl text-red-400" />, title: "Hecho con Amor", description: "Cada pieza es creada artesanalmente con atención a los detalles" },
              { icon: <FaPalette className="text-3xl text-blue-400" />, title: "Personalización", description: "Creamos figuras únicas según tus preferencias y necesidades" }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-inner">
                  {benefit.icon}
                </div>
                <h3 className="font-poppins font-semibold text-xl mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-[var(--text-color)] mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experiencias reales de quienes han confiado en nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "María L.", comment: "Las figuras para el bautismo de mi hijo fueron perfectas. ¡Todos preguntaron dónde las conseguí!", rating: 5 },
              { name: "Carlos R.", comment: "Pedí unos animalitos para decorar la torta de mi hija y superaron todas mis expectativas.", rating: 5 },
              { name: "Ana M.", comment: "La calidad de la porcelana fría es excelente. Se nota que usan materiales de primera.", rating: 4 }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center mb-4 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={`text-lg ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4 text-center">"{testimonial.comment}"</p>
                <p className="font-semibold text-[var(--text-color)] text-center">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Newsletter */}
      <section className="py-16 bg-gradient-to-br from-[var(--pastel-pink)]/20 to-[var(--pastel-menta)]/20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-[var(--text-color)] mb-4">
            ¡No te pierdas nada!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Suscríbete a nuestro newsletter y recibe novedades, descuentos exclusivos y tutoriales de porcelana fría
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--pastel-pink)]"
            />
            <button className="bg-gradient-to-r from-[var(--pastel-pink)] to-[#f8a5c5] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Suscribirme
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
