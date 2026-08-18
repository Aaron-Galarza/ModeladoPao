import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";

// ALERTA DE VITE: Asegurate de que la ruta a estos componentes sea la correcta en tu proyecto.
// Si no tenés estos archivos creados, comentalos (ponele // adelante) para que no explote la pantalla.
import HeroSection from "../components/landing/HeroSection"; 
import Footer from "../components/landing/Footer";

export default function Home() {
  const navigate = useNavigate();

  const handleBranchSelect = (branch) => {
    // FIX TÉCNICO: Ruta directa real. Cuando toque "Resistencia", va a ir a /menu?branch=Resistencia
    navigate(`/menu?branch=${branch}`);
  };

  return (
    <div className="bg-[#0A0A0A] relative min-h-screen flex flex-col">
      {/* Botón de Gestión B2B - El gancho para el dueño */}
      <Link
        to="/admin"
        title="Acceso Gestión"
        aria-label="Acceso al Panel de Gestión"
        className="fixed top-5 right-5 z-50 group flex items-center gap-2 px-3 py-2 border border-[#1A1A1A] hover:border-[#D32F2F]/40 bg-[#0A0A0A]/80 backdrop-blur-sm transition-all duration-300"
      >
        <Lock size={13} className="text-[#333] group-hover:text-[#D32F2F] transition-colors duration-300" />
        <span className="text-[9px] tracking-[0.35em] uppercase text-[#333] group-hover:text-[#888] transition-colors duration-300 hidden sm:block">
          Gestión
        </span>
      </Link>

      {/* Contenido Principal */}
      <HeroSection
        onBranchSelect={handleBranchSelect}
        heroImage="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b091abfaaf2694b81ce384/4b850db78_generated_de92c761.png"
      />
      <Footer />
    </div>
  );
}