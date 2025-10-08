import React, { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiPhone, FiMessageSquare, FiCopy, FiDollarSign } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

// Define una interfaz para la forma de los datos del estado
interface LocationState {
  order: {
    id: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    deliveryType: 'pickup' | 'delivery';
    shippingAddress?: string;
    paymentMethod: 'cash' | 'transfer';
    notes?: string;
    totalAmount: number;
    products: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  };
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Información de pago
  const paymentInfo = {
    name: "Paola Patricia Ferrari",
    alias: "paolapatricia1975",
    cvu: "4530000800018599797939"
  };

  // Información de contacto de la dueña
  const ownerInfo = {
    name: "Paola Ferrari",
    phone: "+54 3624088244",
    businessName: "Modelado Pao"
  };

  // Función para copiar texto al portapapeles
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Función para enviar mensaje por WhatsApp con todos los datos del pedido
  const sendWhatsAppMessage = () => {
    if (!state || !state.order) return;
    
    const { order } = state;
    const message = `¡Hola ${ownerInfo.name}! \n\n` +
      `Acabo de realizar un pedido en ${ownerInfo.businessName} y quiero confirmarlo.\n\n` +
      `*DETALLES DEL PEDIDO:*\n` +
      `• Número de pedido: #${order.id.slice(-8)}\n` +
      `• Cliente: ${order.guestName}\n` +
      `• Email: ${order.guestEmail}\n` +
      `• Teléfono: ${order.guestPhone}\n\n` +
      `*PRODUCTOS:*\n` +
      `${order.products.map(p => `• ${p.name} - Cantidad: ${p.quantity} - $${(p.price * p.quantity).toFixed(2)}`).join('\n')}\n\n` +
      `*TOTAL: $${order.totalAmount.toFixed(2)}*\n\n` +
      `*MÉTODO DE ENTREGA:*\n` +
      `• ${order.deliveryType === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}\n` +
      `${order.deliveryType === 'delivery' ? `• Dirección: ${order.shippingAddress}\n` : ''}\n` +
      `*MÉTODO DE PAGO:*\n` +
      `• ${order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia bancaria'}\n\n` +
      `${order.notes && order.notes.trim() !== '' ? `*NOTAS ADICIONALES:*\n${order.notes}\n\n` : ''}` +
      `Por favor, confirmame la recepción de este pedido y los próximos pasos.\n\n` +
      `¡Gracias! `;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${ownerInfo.phone.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
  };

  // Verifica si el estado y el pedido existen
  if (!state || !state.order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm w-full max-w-md border border-pink-200">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">No se pudieron cargar los detalles del pedido.</p>
          <Link
            to="/catalogo"
            className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors font-semibold"
          >
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const { order } = state;

  return (
    <div className="min-h-screen bg-pink-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/"
            className="flex items-center text-pink-600 hover:text-pink-700 transition-colors font-medium"
          >
            <FiArrowLeft className="mr-2" />
            Volver al inicio
          </Link>
          <div className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-md">Orden #{order.id.slice(-8)}</div>
        </div>

        {/* Tarjeta principal de confirmación */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-pink-200">
          <div className="bg-pink-500 p-5 text-white text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FiCheckCircle className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-1">¡Pedido Confirmado!</h1>
            <p className="text-pink-100 text-sm">Tu pedido quedo registrado, desliza hacia abajo y contactame por whatsapp para seguir gestionandolo, respondo en horario laboral. Gracias</p>
          </div>

          <div className="p-5">
            {/* Información del pedido */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 text-lg border-b pb-2">Resumen del pedido</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                {/* Información del cliente */}
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-medium text-pink-700 mb-2">Información del cliente</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700"><span className="font-medium">Nombre:</span> {order.guestName}</p>
                    <p className="text-gray-700"><span className="font-medium">Email:</span> {order.guestEmail}</p>
                    <p className="text-gray-700"><span className="font-medium">Teléfono:</span> {order.guestPhone}</p>
                  </div>
                </div>
                
                {/* Información de entrega */}
                <div className="bg-mint-50 rounded-lg p-4">
                  <h4 className="font-medium text-teal-700 mb-2">Información de entrega</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Método:</span> {order.deliveryType === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}
                    </p>
                    {order.deliveryType === 'delivery' && (
                      <p className="text-gray-700">
                        <span className="font-medium">Dirección:</span> {order.shippingAddress}
                      </p>
                    )}
                    <p className="text-gray-700">
                      <span className="font-medium">Pago:</span> 
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${order.paymentMethod === 'cash' ? 'bg-yellow-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-3">Productos</h4>
                <div className="space-y-3">
                  {order.products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-pink-100 rounded-md flex items-center justify-center text-pink-600 font-medium mr-3 text-xs">
                          {product.quantity}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">${product.price.toFixed(2)} c/u</p>
                        </div>
                      </div>
                      <span className="font-semibold text-pink-600 text-sm">${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total:</span>
                    <span className="font-bold text-lg text-pink-600">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas adicionales */}
            {order.notes && order.notes.trim() !== '' && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-amber-800 mb-1 text-sm">Notas adicionales:</h4>
                <p className="text-xs text-amber-700 italic">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de información de pago (solo para transferencia) */}
        {order.paymentMethod === 'transfer' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-pink-200">
            <div className="bg-pink-500 p-4 text-white">
              <h2 className="font-bold flex items-center justify-center text-sm">
                <FiDollarSign className="mr-1" />
                INFORMACIÓN DE PAGO
              </h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <div>
                    <p className="text-xs text-pink-700 font-medium">Nombre</p>
                    <p className="text-sm">{paymentInfo.name}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(paymentInfo.name, 'name')}
                    className="text-pink-600 hover:text-pink-800 p-1 rounded"
                    title="Copiar nombre"
                  >
                    <FiCopy size={14} />
                    {copiedField === 'name' && <span className="absolute -mt-6 -mr-6 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">¡Copiado!</span>}
                  </button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <div>
                    <p className="text-xs text-pink-700 font-medium">Alias</p>
                    <p className="text-sm">{paymentInfo.alias}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(paymentInfo.alias, 'alias')}
                    className="text-pink-600 hover:text-pink-800 p-1 rounded"
                    title="Copiar alias"
                  >
                    <FiCopy size={14} />
                    {copiedField === 'alias' && <span className="absolute -mt-6 -mr-6 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">¡Copiado!</span>}
                  </button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <div>
                    <p className="text-xs text-pink-700 font-medium">CVU</p>
                    <p className="text-sm font-mono">{paymentInfo.cvu}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(paymentInfo.cvu, 'cvu')}
                    className="text-pink-600 hover:text-pink-800 p-1 rounded"
                    title="Copiar CVU"
                  >
                    <FiCopy size={14} />
                    {copiedField === 'cvu' && <span className="absolute -mt-6 -mr-6 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">¡Copiado!</span>}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-mint-100 rounded-lg border border-teal-200">
                <p className="text-xs text-teal-800">
                  💡 <strong>Importante:</strong> Una vez realizada la transferencia, envía el comprobante por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sección de contacto */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-pink-200">
          <div className="bg-pink-500 p-4 text-white">
            <h2 className="font-bold flex items-center justify-center text-sm">
              <FiPhone className="mr-1" />
              CONTACTO
            </h2>
          </div>
          
          <div className="p-4">
            {/* Información de contacto */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full mx-auto mb-2 flex items-center justify-center text-pink-600 font-bold">
                {ownerInfo.name.charAt(0)}
              </div>
              <h3 className="font-medium text-gray-800">{ownerInfo.name}</h3>
              <p className="text-pink-600 text-sm">{ownerInfo.businessName}</p>
            </div>

            {/* Botón principal de WhatsApp */}
            <div className="mb-4">
              <button
                onClick={sendWhatsAppMessage}
                className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium text-sm"
              >
                <FiMessageSquare className="mr-2" />
                Continuar pedido por WhatsApp
              </button>
            </div>

            {/* Información adicional de contacto */}
            <div className="bg-pink-50 rounded-lg p-3 mb-3">
              <p className="text-xs text-pink-700 text-center">
                Se abrirá WhatsApp con todos los datos de tu pedido previamente cargados.
              </p>
            </div>

            {/* Contacto alternativo */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">También puedes contactarnos:</p>
              <a
                href={`tel:${ownerInfo.phone}`}
                className="inline-flex items-center text-pink-600 hover:text-pink-800 text-xs font-medium"
              >
                <FiPhone className="mr-1" />
                {ownerInfo.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-pink-400 text-xs mt-6">
          <p>¿Necesitas ayuda? No dudes en contactarnos.</p>
        </div>
      </div>

      <style>{`
        .bg-mint-50 { background-color: #f0fdf9; }
        .bg-mint-100 { background-color: #ccfbf1; }
        .text-teal-700 { color: #0f766e; }
      `}</style>
    </div>
  );
};

export default OrderConfirmationPage;