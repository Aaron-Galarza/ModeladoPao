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

// --- COMPONENTES REUTILIZABLES (Para acortar el código principal) ---

const FormInput = ({ label, name, value, onChange, error, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all ${
        error ? "border-red-500" : "border-gray-200"
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

// Aquí arreglamos la altura: cambiamos flex-col a flex-row y quitamos el mb-1 del icono
const OptionButton = ({ selected, onClick, icon: Icon, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3 border rounded-xl transition-all flex flex-row items-center justify-center gap-2 ${
      selected
        ? "border-pink-500 bg-pink-50 text-pink-700"
        : "border-gray-200 hover:border-pink-300"
    }`}
  >
    <Icon className="text-lg" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// --- PÁGINA PRINCIPAL ---

const CheckoutPage: React.FC = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  // Estados de Cupones
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false); // Corregido el useState destructurado

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

  // Validaciones de input mientras se escribe
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
      const { shippingAddress, shippingCity, ...rest } = prev;
      return rest;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.guestName.trim()) newErrors.guestName = "El nombre es obligatorio";
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

 // Dentro de CheckoutPage.tsx...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        setError("Por favor, corrige los errores en el formulario");
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
        
        // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
        
        discountAmount: discountAmount, 
        
        // 2. Manejo de nombres según lo que dijo tu amigo:
        // Si el back espera 'discountCode', se lo mandamos así.
        // Pero mantenemos 'couponCode' porque tu OrdersManagement lo lee así.
        couponCode: couponCode.trim() || undefined, 
        // @ts-ignore (si TypeScript se queja, agrega esto a la interfaz OrderData)
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
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 font-poppins">Carrito vacío</h2>
          <p className="text-gray-600 mb-8 text-lg">No hay productos para procesar el pago</p>
          <Link to="/catalogo" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl inline-block">
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ecee] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center mb-8">
          <Link to="/cart" className="flex items-center text-pink-600 hover:text-pink-700 font-semibold">
            <FiArrowLeft className="mr-2" /> Volver al Carrito
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center font-poppins">Finalizar Compra</h1>
        <p className="text-gray-600 text-center mb-8">Completa tus datos para procesar el pedido</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-poppins flex items-center">
              <FiMapPin className="mr-3 text-pink-500" /> Información de Entrega
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Nombre completo *" name="guestName" value={formData.guestName} onChange={handleInputChange} error={errors.guestName} placeholder="Ej: María González" />
                <FormInput label="Teléfono *" name="guestPhone" value={formData.guestPhone} onChange={handleInputChange} error={errors.guestPhone} placeholder="Ej: 1123456789" type="tel" maxLength={15} />
              </div>

              <FormInput label="Email *" name="guestEmail" value={formData.guestEmail} onChange={handleInputChange} error={errors.guestEmail} placeholder="Ej: tu@email.com" type="email" />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de entrega *</label>
                <div className="grid grid-cols-2 gap-3">
                  <OptionButton selected={formData.deliveryType === "pickup"} onClick={() => handleDeliveryTypeChange("pickup")} icon={FiMapPin} label="Retiro en local" />
                  <OptionButton selected={formData.deliveryType === "delivery"} onClick={() => handleDeliveryTypeChange("delivery")} icon={FiTruck} label="Envío a domicilio" />
                </div>
              </div>

              {formData.deliveryType === "delivery" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <FormInput label="Dirección *" name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} error={errors.shippingAddress} placeholder="Ej: Av. Siempre Viva 742" />
                  <FormInput label="Ciudad *" name="shippingCity" value={formData.shippingCity} onChange={handleInputChange} error={errors.shippingCity} placeholder="Ej: Resistencia" />
                </div>
              )}

              {/* SECCIÓN DE MÉTODOS DE PAGO (Aquí se aplica el cambio de altura) */}
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
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 transition-all"
                  placeholder="Indicaciones especiales..."
                />
              </div>

              {error && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg disabled:opacity-75 flex items-center justify-center"
              >
                {isLoading ? "Procesando..." : "Confirmar Pedido"}
              </button>
            </form>
          </div>

          {/* --- COLUMNA DERECHA: RESUMEN --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-poppins">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-pink-600 font-bold">${item.price}</p>
                      <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-gray-200" />

              {/* SECCIÓN CUPÓN */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FiDollarSign className="mr-2 text-pink-500" /> Cupón de Descuento
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setDiscountAmount(0); setError(""); }}
                    placeholder="CÓDIGO"
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isCouponLoading || !couponCode.trim()}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isCouponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {discountAmount > 0 && (
                   <p className="text-sm text-green-600 font-semibold mt-1">¡Descuento aplicado!: -${discountAmount.toFixed(2)}</p>
                )}
              </div>

              {/* TOTALES */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${getTotal().toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-lg text-red-500">
                    <span>Descuento:</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold text-green-600">A convenir</span>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total estimado:</span>
                  <span className="text-pink-600">${(getTotal() - discountAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* BENEFICIOS */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                 <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FiCheckCircle className="mr-2 text-green-500" /> Beneficios:
                 </h3>
                 <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">✅ Devoluciones gratuitas</li>
                    <li className="flex items-center">✅ Soporte prioritario 24/7</li>
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