// Frontend/src/components/design/ContactForm.tsx

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

// ====================================================================
// !!! IMPORTANTE: CLAVES DE EMAILJS (Debe coincidir con info.tsx) !!!
// ====================================================================
// AHORA ESTO SERÁ UN VALOR POR DEFECTO O EL QUE USE Info.tsx
const EMAILJS_DEFAULT_TEMPLATE_ID = 'template_6lyc2kv'; 
const EMAILJS_SERVICE_ID = 'service_b5fu0sf';
const EMAILJS_PUBLIC_KEY = 'f7yhJ-pGSn-Ts9LPX';
// ====================================================================

// Definimos las props que recibirá el componente
interface ContactFormProps {
    title: string;
    subtitle: string;
    // AÑADIR NUEVA PROP: templateId
    templateId?: string; // Hacemos opcional para usar el default si no se provee
    // Parámetros para personalizar el asunto y el mensaje final
    templateSubject: string; // Ej: "NUEVO INTERESADO: {Nombre} en Seminario"
    buttonText: string;
    successMessage: string;
    note?: string; // Nota al pie (Ej: "No compartimos tus datos")
}

const ContactForm: React.FC<ContactFormProps> = ({ 
    title, 
    subtitle, 
    templateId = EMAILJS_DEFAULT_TEMPLATE_ID, // USAMOS LA PROP O EL VALOR POR DEFECTO
    templateSubject, 
    buttonText, 
    successMessage,
    note
}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        setError(null);
        
        const subject = templateSubject.replace('{Nombre}', formData.name);

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone || 'No especificado',
            subject_line: subject // Usamos el asunto personalizado
        };
        
        try {
            const result = await emailjs.send(
                EMAILJS_SERVICE_ID, 
                templateId, // AHORA USA LA PROP O EL DEFAULT
                templateParams, 
                EMAILJS_PUBLIC_KEY
            );

            console.log('Correo enviado con éxito:', result.status, result.text);
            setIsSubmitted(true);
            setFormData({ name: "", email: "", phone: "" }); // Limpiar formulario
        } catch (err) {
            console.error('Error al enviar el correo:', err);
            setError("Ocurrió un error al enviar tu mensaje. Por favor, inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-teal-200">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-2xl font-cursive font-bold text-gray-900">{title}</h3>
                    <p className="mt-2 text-lg text-gray-600 font-sans">{successMessage}</p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#f188af] hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f188af]"
                    >
                        Enviar otro mensaje
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-gray-200">
            <h2 className="text-3xl font-cursive font-bold text-gray-800 mb-2 text-center">{title}</h2>
            <p className="text-gray-600 mb-6 text-center font-sans">{subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo Nombre */}
                <div>
                    <label htmlFor="name" className="sr-only">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tu Nombre"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f188af] focus:border-[#f188af] transition duration-150 font-sans"
                    />
                </div>

                {/* Campo Email */}
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Tu Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f188af] focus:border-[#f188af] transition duration-150 font-sans"
                    />
                </div>
                
                {/* Campo Teléfono (opcional) */}
                <div>
                    <label htmlFor="phone" className="sr-only">Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Tu Teléfono (opcional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#f188af] focus:border-[#f188af] transition duration-150 font-sans"
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center font-sans">{error}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg font-bold text-white transition-all duration-200 ${
                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#f188af] hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f188af]'
                    }`}
                >
                    {isSubmitting ? 'Enviando...' : buttonText}
                </button>
            </form>
            
            {/* Nota al pie */}
            {note && (
                <p className="mt-4 text-xs text-gray-500 text-center font-sans italic">
                    {note}
                </p>
            )}
        </div>
    );
};

export default ContactForm;