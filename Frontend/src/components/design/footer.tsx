import React from 'react';
import { Footer, FooterBrand, FooterCopyright, FooterDivider, FooterLink, FooterLinkGroup, FooterIcon } from "flowbite-react";
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import '../../App.css'; // Asegúrate de importar tu archivo CSS

const CustomFooter = () => {
  return (
    <Footer container className="bg-[var(--pastel-menta)] text-[var(--text-color)] rounded-none mt-12 py-4">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sección Superior */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0 pb-3">
          
          {/* Texto de la Marca a la Izquierda - Versión Escritorio */}
          <div className="hidden md:flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-gray-800 font-poppins font-semibold text-xl">PORCELANA FRÍA</span>
            <span className="text-sm italic text-gray-600 font-poppins mt-1">
                "Donde la creatividad se moldea con tus manos."
            </span>
          </div>

          {/* Texto de la Marca a la Izquierda - Versión Móvil */}
          <div className="flex flex-col items-center md:hidden text-center">
            <span className="text-gray-800 font-poppins font-semibold text-xl">MODELADO PAO</span>
            <span className="text-sm italic text-gray-600 font-poppins mt-1">
                "Donde la creatividad se moldea con tus manos."
            </span>
          </div>

          {/* Logo de Texto de la Marca en el Centro para Escritorio */}
          <div className="hidden md:flex flex-col items-center text-center leading-none">
            <span className="text-2xl font-cormorant-garamond font-bold text-gray-800 tracking-wider">MODELADO</span>
            <span className="text-xl font-cormorant-garamond font-normal text-gray-700 -mt-1">PAO</span>
          </div>

          {/* Enlaces y Redes a la Derecha */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-8 text-base">
            <FooterLinkGroup className="flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <FooterLink href="#" className="text-[var(--text-color)] hover:text-[var(--pastel-pink)] transition-colors duration-300">Acerca de</FooterLink>
              <FooterLink href="/catalogo" className="text-[var(--text-color)] hover:text-[var(--pastel-pink)] transition-colors duration-300">Catálogo</FooterLink>
              <FooterLink href="#" className="text-[var(--text-color)] hover:text-[var(--pastel-pink)] transition-colors duration-300">Contacto</FooterLink>
            </FooterLinkGroup>
            <FooterLinkGroup className="flex space-x-4 mt-2 sm:mt-0">
              <FooterLink href="https://www.facebook.com/tupaginadefacebook" target="_blank" rel="noopener noreferrer">
                <FooterIcon icon={() => <FaFacebook size={20} />} className="text-gray-700 hover:text-[var(--pastel-pink)] transition-colors duration-300" />
              </FooterLink>
              <FooterLink href="https://www.instagram.com/tuperfildeinstagram" target="_blank" rel="noopener noreferrer">
                <FooterIcon icon={() => <FaInstagram size={20} />} className="text-gray-700 hover:text-[var(--pastel-pink)] transition-colors duration-300" />
              </FooterLink>
              <FooterLink href="https://wa.me/tunumerodetelefono" target="_blank" rel="noopener noreferrer">
                <FooterIcon icon={() => <FaWhatsapp size={20} />} className="text-gray-700 hover:text-[var(--pastel-pink)] transition-colors duration-300" />
              </FooterLink>
            </FooterLinkGroup>
          </div>
        </div>
        
        {/* Línea Divisoria */}
        <FooterDivider className="bg-[var(--pastel-pink)] my-3" />

        {/* Sección Inferior: Copyright, Correo y Desarrollador */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 space-y-2 sm:space-y-0">
            <FooterCopyright by=" Modelado Pao" href="/" year={2025} className="text-sm text-gray-600" />
            
            {/* Correo de AFDevelopers centrado con CSS */}
            <a href="mailto:AFdevelopers12@gmail.com" className="footer-email hidden md:flex items-center space-x-2 text-sm text-[var(--text-color)] hover:underline transition-colors duration-300">
                <FaEnvelope />
                <span>AFdevelopers12@gmail.com</span>
            </a>

            <span className="text-sm text-gray-600">
                Plataforma desarrollada por <a href="mailto:AFdevelopers12@gmail.com" className="hover:underline text-[var(--text-color)]">AFdevelopers</a>
            </span>
        </div>
      </div>
    </Footer>
  );
};

export default CustomFooter;