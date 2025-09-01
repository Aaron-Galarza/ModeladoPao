import React, { useState } from 'react';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiTruck, FiCheckCircle, FiDollarSign } from 'react-icons/fi';
import { useCartStore } from '../../components/checkout/cartStore';
import { createOrder, OrderData } from '../../services/orders.service';
import { useNavigate, Link } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    deliveryType: 'pickup',
    shippingAddress: '',
    shippingCity: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lógica para manejar cambios y validación (sin cambios)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'guestName') {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) && value !== '') return;
      if (value.length > 50) return;
    }
    
    if (name === 'guestPhone') {
      if (!/^\d*$/.test(value) && value !== '') return;
      if (value.length > 15) return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  const handleDeliveryTypeChange = (type: 'pickup' | 'delivery') => {
    setFormData(prevState => ({
      ...prevState,
      deliveryType: type,
      ...(type === 'pickup' && { shippingAddress: '', shippingCity: '' })
    }));
    if (type === 'pickup') {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.shippingAddress;
        delete newErrors.shippingCity;
        return newErrors;
      });
    }
  };

  const handlePaymentMethodChange = (method: 'cash' | 'transfer') => {
    setFormData(prevState => ({
      ...prevState,
      paymentMethod: method
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^\d{8,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'El nombre es obligatorio';
    } else if (!nameRegex.test(formData.guestName)) {
      newErrors.guestName = 'El nombre debe contener solo letras y tener entre 2 y 50 caracteres';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Ingresa un email válido';
    }

    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = 'El teléfono es obligatorio';
    } else if (!phoneRegex.test(formData.guestPhone.replace(/\s/g, ''))) {
      newErrors.guestPhone = 'Ingresa un teléfono válido (solo números, 8-15 dígitos)';
    }

    if (formData.deliveryType === 'delivery') {
      if (!formData.shippingAddress.trim()) {
        newErrors.shippingAddress = 'La dirección es obligatoria para envío a domicilio';
      }
      if (!formData.shippingCity.trim()) {
        newErrors.shippingCity = 'La ciudad es obligatoria para envío a domicilio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Crear el objeto para enviar a la API
      const orderData: OrderData = {
        products: items.map(item => ({
          idProducto: item.id,
          quantity: item.quantity
        })),
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        deliveryType: formData.deliveryType,
        shippingAddress: formData.deliveryType === 'delivery' ? `${formData.shippingAddress}, ${formData.shippingCity}` : undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || ""
      };

      // 2. Llamar a la API para crear el pedido
      const orderId = await createOrder(orderData);
      
      // 3. Crear el objeto de pedido completo para pasarlo al estado de la ruta
      const fullOrderDetails = {
        ...orderData,
        id: orderId, // Agregar el ID devuelto por la API
        products: items, // Pasar los productos del carrito con todos sus detalles (nombre, precio, etc.)
        totalAmount: getTotal()
      };
      
      // 4. Vaciar el carrito
      clearCart();
      
      // 5. Navegar a la página de confirmación, pasando los datos en el 'state'
      navigate(`/order-confirmation/${orderId}`, { state: { order: fullOrderDetails } });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido. Intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(240, 236, 238)' }}>
        <div className="absolute inset-0" style={{ backgroundColor: 'rgb(240, 236, 238)' }} />
        <div className="relative z-10 container mx-auto max-w-4xl py-12 px-4 min-h-screen flex flex-col">
          <div className="flex items-center mb-8">
            <Link 
              to="/catalogo" 
              className="flex items-center text-pink-600 hover:text-pink-700 transition-colors font-semibold"
            >
              <FiArrowLeft className="mr-2" />
              Volver al Catálogo
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:scale-[1.01] transition-transform duration-200 w-full max-w-md">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-12 h-12 text-pink-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-poppins">Carrito vacío</h2>
              <p className="text-gray-600 mb-8 text-lg">No hay productos para procesar el pago</p>
              <Link
                to="/catalogo"
                className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl 
                  hover:from-pink-600 hover:to-pink-700 transition-all duration-300 
                  font-semibold text-lg shadow-lg hover:shadow-xl inline-block"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(240, 236, 238)' }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgb(240, 236, 238)' }} />
      <div className="relative z-10 container mx-auto max-w-6xl py-12 px-4">
        <div className="flex items-center mb-8">
          <Link 
            to="/cart" 
            className="flex items-center text-pink-600 hover:text-pink-700 transition-colors font-semibold"
          >
            <FiArrowLeft className="mr-2" />
            Volver al Carrito
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center font-poppins">Finalizar Compra</h1>
        <p className="text-gray-600 text-center mb-8">Completa tus datos para procesar el pedido</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-poppins flex items-center">
              <FiMapPin className="mr-3 text-pink-500" />
              Información de Entrega
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Nombre completo *</label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all ${
                      errors.guestName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Ej: María González"
                    maxLength={50}
                  />
                  {errors.guestName && (<p className="mt-1 text-sm text-red-500">{errors.guestName}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Teléfono *</label>
                  <input
                    type="tel"
                    name="guestPhone"
                    value={formData.guestPhone}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all ${
                      errors.guestPhone ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Ej: 1123456789"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                  />
                  {errors.guestPhone && (<p className="mt-1 text-sm text-red-500">{errors.guestPhone}</p>)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                <input
                  type="email"
                  name="guestEmail"
                  value={formData.guestEmail}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all ${
                    errors.guestEmail ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Ej: tu@email.com"
                />
                {errors.guestEmail && (<p className="mt-1 text-sm text-red-500">{errors.guestEmail}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de entrega *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDeliveryTypeChange('pickup')}
                    className={`p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                      formData.deliveryType === 'pickup' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <FiMapPin className="mb-1 text-lg" />
                    <span className="text-sm">Retiro en local</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeliveryTypeChange('delivery')}
                    className={`p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                      formData.deliveryType === 'delivery' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <FiTruck className="mb-1 text-lg" />
                    <span className="text-sm">Envío a domicilio</span>
                  </button>
                </div>
              </div>
              {formData.deliveryType === 'delivery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Dirección de envío *</label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      required={formData.deliveryType === 'delivery'}
                      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all ${
                        errors.shippingAddress ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Ej: Av. Siempre Viva 742"
                    />
                    {errors.shippingAddress && (<p className="mt-1 text-sm text-red-500">{errors.shippingAddress}</p>)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Ciudad *</label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      required={formData.deliveryType === 'delivery'}
                      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all ${
                        errors.shippingCity ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Ej: Springfield"
                    />
                    {errors.shippingCity && (<p className="mt-1 text-sm text-red-500">{errors.shippingCity}</p>)}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Método de pago *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('cash')}
                    className={`p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                      formData.paymentMethod === 'cash' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <FiDollarSign className="mb-1 text-lg" />
                    <span className="text-sm">Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('transfer')}
                    className={`p-3 border rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                      formData.paymentMethod === 'transfer' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <FiCreditCard className="mb-1 text-lg" />
                    <span className="text-sm">Transferencia</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Notas adicionales (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                  placeholder="Indicaciones especiales para tu pedido..."
                />
              </div>
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl 
                  hover:from-pink-600 hover:to-pink-700 transition-all duration-300 
                  font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed
                  flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </button>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-poppins">Resumen del Pedido</h2>
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-pink-600 font-bold">${item.price}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="my-4 border-gray-200" />
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold text-green-600">A convenir</span>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total estimado:</span>
                  <span className="text-pink-600">${getTotal().toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 text-right"></p>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FiCheckCircle className="mr-2 text-green-500" />
                  Beneficios de tu compra:
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Devoluciones gratuitas por 30 días
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Soporte prioritario 24/7
                  </li>
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