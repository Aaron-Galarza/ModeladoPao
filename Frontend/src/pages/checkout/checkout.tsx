import React, { useState } from "react";
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import { useCartStore } from "../../components/checkout/cartStore";
import { createOrder, OrderData } from "../../services/orders.service";
import { checkCoupon } from "../../services/coupons.service";
import { useNavigate, Link } from "react-router-dom";

// --- COMPONENTES REUTILIZABLES ---

const FormInput = ({ label, name, value, onChange, error, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all outline-none ${
        error ? "border-red-500" : "border-gray-200"
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const OptionButton = ({ selected, onClick, icon: Icon, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 border rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 h-full w-full ${
      selected
        ? "border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500"
        : "border-gray-200 hover:border-pink-300 bg-white"
    }`}
  >
    <Icon className={`text-xl ${selected ? "text-pink-600" : "text-gray-400"}`} />
    <span className="text-sm font-medium text-center leading-tight">{label}</span>
  </button>
);

// --- PÁGINA PRINCIPAL ---

const CheckoutPage: React.FC = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  // Estados
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    deliveryType: "pickup",
    shippingAddress: "",
    shippingCity: "",
    paymentMethod: "cash",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Validaciones simples al escribir
    if (name === "guestName" && (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) || value.length > 50)) return;
    if (name === "guestPhone" && (!/^\d*$/.test(value) || value.length > 15)) return;

    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDeliveryTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryType: type,
      ...(type === "pickup" && { shippingAddress: "", shippingCity: "" }),
    }));
    if (type === "pickup") setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { shippingAddress, shippingCity, ...rest } = prev;
      return rest;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.guestName.trim()) newErrors.guestName = "Nombre requerido";
    if (!formData.guestEmail.trim() || !emailRegex.test(formData.guestEmail)) newErrors.guestEmail = "Email inválido";
    if (!formData.guestPhone.trim() || formData.guestPhone.length < 8) newErrors.guestPhone = "Teléfono inválido";

    if (formData.deliveryType === "delivery") {
      if (!formData.shippingAddress.trim()) newErrors.shippingAddress = "Dirección requerida";
      if (!formData.shippingCity.trim()) newErrors.shippingCity = "Ciudad requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyCoupon = async () => {
    if (couponCode.length < 3) return setError("Código muy corto.");
    setIsCouponLoading(true);
    setError("");

    try {
      const result: any = await checkCoupon(couponCode);
      if (result.valid) {
        const total = getTotal();
        const discount = result.type === "percentage" 
          ? total * (result.value / 100) 
          : result.value;
        setDiscountAmount(Math.min(discount, total));
        setError("");
      } else {
        setDiscountAmount(0);
        setError(result.message || "Cupón inválido.");
      }
    } catch (err: any) {
      setDiscountAmount(0);
      setError(err.message || "Error al verificar cupón");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        setError("Completa los campos obligatorios marcados en rojo.");
        // Scroll suave hacia arriba si hay error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    setIsLoading(true);
    setError("");

    try {
      const orderData: OrderData = {
        products: items.map((item) => ({ idProducto: item.id, quantity: item.quantity })),
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        deliveryType: formData.deliveryType,
        shippingAddress: formData.deliveryType === "delivery" ? `${formData.shippingAddress}, ${formData.shippingCity}` : undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || "",
        
        discountAmount: discountAmount, 
        couponCode: couponCode.trim() || undefined, 
        // @ts-ignore
        discountCode: couponCode.trim() || undefined, 
      };

      const orderId = await createOrder(orderData);
      const currentTotal = getTotal(); 
      clearCart(); 

      navigate(`/order-confirmation/${orderId}`, {
        state: { 
            order: {
                ...orderData,
                id: orderId,
                products: items,
                totalAmount: currentTotal - discountAmount,
                discountAmount: discountAmount, 
            } 
        },
      });
    } catch (err: any) {
      setError(err.message || "Error al procesar el pedido.");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0ecee] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center animate-bounce-slow">
              <FiCheckCircle className="w-10 h-10 text-pink-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 font-poppins">Carrito vacío</h2>
          <p className="text-gray-600 mb-6 text-base">Agrega productos para continuar.</p>
          <Link to="/catalogo" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl inline-block w-full">
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ecee] py-8 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center mb-6">
          <Link to="/cart" className="flex items-center text-pink-600 hover:text-pink-700 font-semibold text-sm sm:text-base">
            <FiArrowLeft className="mr-2" /> Volver al Carrito
          </Link>
        </div>

        {/* Header Responsive */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center font-poppins">
          Finalizar Compra
        </h1>
        <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
          Ingresa tus datos para el envío o retiro
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
          <div className="order-2 lg:order-1 bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 font-poppins flex items-center">
              <FiMapPin className="mr-3 text-pink-500" /> Tus Datos
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput 
                label="Nombre completo *" 
                name="guestName" 
                value={formData.guestName} 
                onChange={handleInputChange} 
                error={errors.guestName} 
                placeholder="Nombre y Apellido" 
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormInput 
                    label="Email *" 
                    name="guestEmail" 
                    value={formData.guestEmail} 
                    onChange={handleInputChange} 
                    error={errors.guestEmail} 
                    placeholder="ejemplo@correo.com" 
                    type="email" 
                />
                <FormInput 
                    label="Teléfono *" 
                    name="guestPhone" 
                    value={formData.guestPhone} 
                    onChange={handleInputChange} 
                    error={errors.guestPhone} 
                    placeholder="Sin 0 y sin 15" 
                    type="tel" 
                    maxLength={15} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de entrega *</label>
                <div className="grid grid-cols-2 gap-3 h-auto">
                  <OptionButton 
                    selected={formData.deliveryType === "pickup"} 
                    onClick={() => handleDeliveryTypeChange("pickup")} 
                    icon={FiMapPin} 
                    label="Retiro en local" 
                  />
                  <OptionButton 
                    selected={formData.deliveryType === "delivery"} 
                    onClick={() => handleDeliveryTypeChange("delivery")} 
                    icon={FiTruck} 
                    label="Envío a domicilio" 
                  />
                </div>
              </div>

              {formData.deliveryType === "delivery" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                  <FormInput 
                    label="Dirección *" 
                    name="shippingAddress" 
                    value={formData.shippingAddress} 
                    onChange={handleInputChange} 
                    error={errors.shippingAddress} 
                    placeholder="Calle y Número" 
                  />
                  <FormInput 
                    label="Ciudad *" 
                    name="shippingCity" 
                    value={formData.shippingCity} 
                    onChange={handleInputChange} 
                    error={errors.shippingCity} 
                    placeholder="Resistencia" 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Método de pago *</label>
                <div className="grid grid-cols-2 gap-3">
                  <OptionButton 
                    selected={formData.paymentMethod === "cash"} 
                    onClick={() => setFormData({ ...formData, paymentMethod: "cash" })} 
                    icon={FiDollarSign} 
                    label="Efectivo" 
                  />
                  <OptionButton 
                    selected={formData.paymentMethod === "transfer"} 
                    onClick={() => setFormData({ ...formData, paymentMethod: "transfer" })} 
                    icon={FiCreditCard} 
                    label="Transferencia" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Notas (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 transition-all text-sm"
                  placeholder="Ej: Tocar timbre, casa de rejas..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium text-center">
                    {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center mt-4"
              >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                    </span>
                ) : "Confirmar Pedido"}
              </button>
            </form>
          </div>

          {/* --- COLUMNA DERECHA: RESUMEN --- */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 font-poppins">Resumen del Pedido</h2>
              
              <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-2 border-b border-gray-50 last:border-0">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">{item.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                        <p className="font-bold text-gray-800 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-gray-100" />

              {/* SECCIÓN CUPÓN (CORREGIDA PARA MÓVIL) */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Cupón de Descuento
                </label>
                {/* CAMBIO AQUÍ: flex-col en móvil (vertical), sm:flex-row en desktop (horizontal).
                   El botón ahora ocupa todo el ancho en móvil para que sea fácil de tocar y no se salga.
                */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setDiscountAmount(0); setError(""); }}
                    placeholder="CÓDIGO"
                    className="w-full sm:flex-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 uppercase text-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isCouponLoading || !couponCode.trim()}
                    className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isCouponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {discountAmount > 0 && (
                    <div className="flex items-center mt-2 text-green-600 bg-green-50 p-2 rounded-lg text-xs font-semibold">
                        <FiCheckCircle className="mr-1.5" /> Descuento aplicado: -${discountAmount.toFixed(2)}
                    </div>
                )}
              </div>

              {/* TOTALES */}
              <div className="space-y-2 mb-4 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento:</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Envío:</span>
                  <span className="text-green-600 font-medium">A convenir</span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-pink-600">${(getTotal() - discountAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* BENEFICIOS */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                 <ul className="text-xs text-blue-800 space-y-1.5 font-medium">
                    <li className="flex items-center">🛡️ Compra protegida</li>
                    <li className="flex items-center">📞 Contacto directo por WhatsApp</li>
                 </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;