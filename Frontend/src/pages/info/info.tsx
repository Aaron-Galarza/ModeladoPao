import React, { useState } from "react";

const content = {
  hero: {
    eyebrow: "Quien soy",
    title: "Calidad, detalle y amor en cada trabajo",
    subtitle:
      "Soy Paola Ferrari y desde 2017 que me dedico a crear piezas unicas en porcenala fría para cualquier tipo de eventos. Ademas de lo publicado en la pagina realizo pedidos totalmente personalizados y siempre hechos con mucha dedicación y amor.",
    ctaLabel: "Ver catálogo",
    ctaHref: "/catalogo",
    secondaryCtaLabel: "Contactame",
    secondaryCtaHref: "/contacto",
  },
  features: [
    {
      title: "Material de calidad",
      desc: "Selecciono cada insumo para mantener un estándar alto y constante.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" fill="none" strokeWidth="1.8">
          <path d="M12 3l8 6-8 6-8-6 8-6z" />
          <path d="M4 15l8 6 8-6" />
        </svg>
      ),
    },
    {
      title: "Precios no excesivos",
      desc: "Precios justos basados en la calidad del producto y horas de trabajo.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" fill="none" strokeWidth="1.8">
          <path d="M3 10h18M3 14h18" />
          <path d="M7 6h10M7 18h10" />
        </svg>
      ),
    },
    {
      title: "Atención cercana",
      desc: "Busco un trato simple, directo y amable para mejorar la experiencia del cliente.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" fill="none" strokeWidth="1.8">
          <path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4v8z" />
        </svg>
      ),
    },
  ],
  highlight: {
    badge: "Promesa",
    title: "Siempre bello. Siempre calidad",
    desc: "Cada pedido es una oportunidad para sorprenderte. Cuido la ejecución, el tiempo y el trato directo al entregar.",
  },
  stats: [
    { label: "Años Trabajando en el rubro", value: "8+" },
    { label: "Trabajos realizados en todo tipo de eventos", value: "Muchos" },
    { label: "Puntaje promedio", value: "4.8/5" },
    { label: "Productos activos", value: "20+" },
  ],
  faqs: [
    {
      q: "¿Hacen envíos?",
      a: "Sí, realizo envíos en todo el país. Al confirmar el pedido se evalúa el costo y se envía por correo argentino.",
    },
    {
      q: "¿Puedo personalizar mi pedido?",
      a: "¡Claro! Tenes la opción de contactarme y hacer un pedido totalmente personalizado para el motivo que necesites.",
    },
    {
      q: "¿Qué medios de pago aceptan?",
      a: "Efectivo y Transferencia. Podes elegir la opción más conveniente para vos.",
    },
    {
      q: "¿Ademas de piezas en porcelana fría hay otros productos?",
      a: "Sí, y cada vez sumamos más. Mirá el catálogo para ver todos.",
    },
  ],
  cta: {
    title: "¿Listo para pedir?",
    desc: "Hacé tu pedido online en segundos o escribinos por WhatsApp si tenés dudas.",
    primaryLabel: "Ver catálogo",
    primaryHref: "/catalogo",
    secondaryLabel: "WhatsApp",
    secondaryHref: "https://wa.me/543624063011",
  },
};

const Section: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <section className={`container mx-auto px-4 ${className ?? ""}`}>{children}</section>
);

const FAQItem: React.FC<{
  q: string;
  a: string;
  index: number;
  open: boolean;
  onToggle: (index: number) => void;
}> = ({ q, a, index, open, onToggle }) => {
  const id = `faq-${index}`;
  return (
    <div className="break-inside-avoid mb-4 border border-gray-200 rounded-lg bg-white w-full">
      <button
        type="button"
        onClick={() => onToggle(index)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer select-none"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <span className="font-medium text-gray-800">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 12l-6-6h12l-6 6z" />
        </svg>
      </button>
      {open && (
        <div id={`${id}-panel`} role="region" aria-hidden={!open} className="px-4 pb-4 text-gray-600">
          {a}
        </div>
      )}
    </div>
  );
};

const Info: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleToggleFaq = (i: number) => setOpenFaqIndex(prev => (prev === i ? null : i));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío del formulario
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Datos del formulario:", formData);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", phone: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(240,236,238)]">
      {/* HERO */}
      <Section className="py-14">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xl tracking-widest font-semibold text-teal-600 uppercase">
            {content.hero.eyebrow}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2">{content.hero.title}</h1>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">{content.hero.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a
              href={content.hero.ctaHref}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
            >
              {content.hero.ctaLabel}
            </a>
            <a
              href={content.hero.secondaryCtaHref}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white text-teal-700 font-semibold border border-teal-200 hover:bg-teal-50 transition"
            >
              {content.hero.secondaryCtaLabel}
            </a>
          </div>
        </div>
      </Section>

      {/* FEATURES */}
      <Section className="py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {content.features.map((f, i) => (
            <div key={i} className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="text-gray-600 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* HIGHLIGHT BANNER */}
      <Section className="py-8">
        <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-[var(--pastel-pink)] p-6">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-white   border-[var(--footer)]">
            {content.highlight.badge}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">{content.highlight.title}</h3>
          <p className="text-gray-700 mt-2 max-w-3xl">{content.highlight.desc}</p>
        </div>
      </Section>

      {/* STATS */}
      <Section className="py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {content.stats.map((s, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-200 p-6 text-center">
              <div className="text-3xl font-extrabold text-gray-900">{s.value}</div>
              <div className="mt-1 text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ — Masonry (evita alturas emparejadas en filas) */}
      <Section className="py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
        <div className="columns-1 md:columns-2 gap-4">
          {content.faqs.map((f, i) => (
            <FAQItem
              key={i}
              q={f.q}
              a={f.a}
              index={i}
              open={openFaqIndex === i}
              onToggle={handleToggleFaq}
            />
          ))}
        </div>
      </Section>

      {/* FORMULARIO DE SUSCRIPCIÓN PARA SEMINARIOS */}
      <Section className="py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                ¿Te interesa aprender sobre porcelana fría?
              </h2>
              <p className="text-gray-600">
                Dejanos tus datos y te avisaremos cuando abramos el próximo seminario
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Gracias por registrarte!</h3>
                <p className="text-gray-600">
                  Te contactaremos cuando tengamos novedades sobre los próximos seminarios.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="+54 9 1234-5678"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Quiero recibir novedades"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Solo te contactaremos para informarte sobre seminarios y cursos. No compartimos tus datos.
                </p>
              </form>
            )}
          </div>
        </div>
      </Section>

      {/* CTA FINAL */}
      <Section className="py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{content.cta.title}</h3>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{content.cta.desc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <a
              href={content.cta.primaryHref}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
            >
              {content.cta.primaryLabel}
            </a>
            <a
              href={content.cta.secondaryHref}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white text-teal-700 font-semibold border border-teal-200 hover:bg-teal-50 transition"
            >
              {content.cta.secondaryLabel}
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Info;