import { useState, useEffect, useMemo } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../../firebase/firebase.config";
import { 
  FaWhatsapp, 
  FaPhone, 
  FaMoneyBill, 
  FaBox, 
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaTag // 1. Importamos el icono para el cupón
} from "react-icons/fa";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

interface IUpdateOrderStatusData {
    orderId: string;
    newStatus: string;
}

interface OrderProduct {
  idProducto: string;
  quantity: number;
  name: string;
  price: number;
}

interface OrderDetails {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryType: 'pickup' | 'delivery';
  shippingAddress?: string;
  paymentMethod: 'cash' | 'transfer';
  products: OrderProduct[];
  totalAmount: number;
  notes?: string;
  status: 'pending' | 'in-progress' | 'delivered' | 'cancelled';
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  // 2. Agregamos los campos opcionales del cupón a la interfaz
  couponCode?: string;
  discountAmount?: number;
}

const updateOrderStatusCallable = httpsCallable<IUpdateOrderStatusData, any>(getFunctions(), 'updateOrderStatus');

const OrdersManagement = () => {
  const [allOrders, setAllOrders] = useState<OrderDetails[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      const ordersCollection = collection(db, "Pedidos");
      const ordersQuery = query(ordersCollection, orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(ordersQuery, 
        (snapshot) => {
          const ordersData: OrderDetails[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            const products = (data.products || data.productos || []).map((product: any) => ({
              idProducto: product.idProducto || product.productId || 'N/A',
              quantity: Number(product.quantity) || Number(product.cantidad) || 1,
              name: product.name || product.nombre || 'Producto sin nombre',
              price: Number(product.price) || Number(product.precioEnElPedido) || 0
            }));
            
            let totalAmount = Number(data.totalAmount) || Number(data.total) || 0;
            if (totalAmount === 0 && products.length > 0) {
              totalAmount = products.reduce((sum: number, product: OrderProduct) => {
                return sum + (Number(product.price) * Number(product.quantity));
              }, 0);
            }
            
            ordersData.push({
              id: doc.id,
              guestName: data.guestName || data.nombreCliente || "Cliente no especificado",
              guestEmail: data.guestEmail || data.emailCliente || "",
              guestPhone: data.guestPhone || data.telefonoCliente || "",
              deliveryType: data.deliveryType || 'pickup',
              shippingAddress: data.shippingAddress || data.direccionEnvio,
              paymentMethod: data.paymentMethod || 'cash',
              products: products,
              totalAmount: totalAmount,
              notes: data.notes || data.notas,
              status: data.status || 'pending',
              createdAt: data.createdAt || Timestamp.now(),
              updatedAt: data.updatedAt,
              // 3. Mapeamos los datos del cupón desde Firestore
              // Asegúrate de que tu función 'createOrder' esté guardando estos campos en la raíz del documento
              couponCode: data.couponCode || undefined, 
              discountAmount: Number(data.discountAmount) || 0
            });
          });
          
          setAllOrders(ordersData);
          setLoading(false);
        },
        (error) => {
          console.error("Error en el listener de pedidos:", error);
          setError(`Error al cargar los pedidos: ${error.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error configurando el listener:", err);
      setError("Error al configurar la conexión con la base de datos");
      setLoading(false);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return allOrders;
    }
    return allOrders.filter(order => order.status === filter);
  }, [allOrders, filter]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderDetails['status']) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No hay usuario autenticado. Debes iniciar sesión.");
      }
      
      const result = await updateOrderStatusCallable({ 
        orderId: orderId, 
        newStatus: newStatus 
      });

      console.log("Respuesta de la Cloud Function:", result.data.message);

    } catch (error: any) {
      console.error("Error al llamar a la Cloud Function:", error.message);
      setError(`Error al actualizar el estado: ${error.message}`);
    }
  };

  const openWhatsApp = (phone: string, guestName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone;
  
    if (cleanPhone.length === 10) {
      formattedPhone = `549${cleanPhone}`;
    } else if (cleanPhone.length > 10 && !cleanPhone.startsWith('549')) {
      formattedPhone = cleanPhone;
    } else {
      formattedPhone = cleanPhone;
    }
    
    const message = `Hola ${guestName}, recibí tu pedido desde la página de Modelado Pao, ¿querés continuar con tu compra?`;
    const encodedMessage = encodeURIComponent(message);
    
    if (formattedPhone) {
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendiente',
      'in-progress': 'En Proceso',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: {[key: string]: string} = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Timestamp | Date) => {
    if (!date) return "Fecha no disponible";
    
    try {
      if (date instanceof Timestamp) {
        return date.toDate().toLocaleString("es-ES", {
          dateStyle: 'short',
          timeStyle: 'short'
        });
      }
      return new Date(date).toLocaleString("es-ES", {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getDeliveryTypeText = (type: string) => {
    return type === 'pickup' ? 'Retiro en sucursal' : 'Delivery';
  };

  const getPaymentMethodText = (method: string) => {
    return method === 'cash' ? 'Efectivo' : 'Transferencia';
  };

  const formatPrice = (price: any): string => {
    try {
      const numPrice = Number(price);
      if (isNaN(numPrice)) return '$0.00';
      return `$${numPrice.toFixed(2)}`;
    } catch (error) {
      return '$0.00';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando pedidos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Gestión de Pedidos</h1>
        
        <div className="bg-white p-3 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "in-progress", "delivered", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === status 
                    ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg shadow">
            <div className="text-gray-500 text-lg">
              {filter === "all" 
                ? "No hay pedidos en la base de datos" 
                : `No hay pedidos con estado "${getStatusText(filter)}"`}
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-semibold text-gray-800">
                      <FaUser className="text-gray-600" />
                      <span>{order.guestName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-gray-400" />
                    <span className="text-gray-500">{order.guestPhone}</span>
                    <button
                      onClick={() => openWhatsApp(order.guestPhone, order.guestName)}
                      className="text-green-500 hover:text-green-600 transition-colors"
                      title="Contactar por WhatsApp"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FaBox className="text-gray-600" /> Productos:
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700">
                    {order.products.length === 0 ? (
                      <div className="text-gray-500 text-sm">No hay productos en este pedido</div>
                    ) : (
                      order.products.map((product, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{product.quantity} x {product.name}</span>
                          <span>{formatPrice(product.price * product.quantity)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Sección de Totales con Lógica de Cupones */}
                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                  
                  {/* Si hay descuento, mostramos el desglose */}
                  {(order.discountAmount && order.discountAmount > 0) ? (
                    <>
                      {/* Fila del Subtotal */}
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal:</span>
                        <span>{formatPrice(order.totalAmount + order.discountAmount)}</span>
                      </div>

                      {/* Fila del Cupón */}
                      <div className="flex justify-between text-green-600 items-center">
                        <div className="flex items-center gap-2">
                          <FaTag className="text-green-500" />
                          <span className="font-medium">
                            Cupón: <span className="uppercase bg-green-100 px-2 py-0.5 rounded text-xs">{order.couponCode}</span>
                          </span>
                        </div>
                        <span className="font-bold">-{formatPrice(order.discountAmount)}</span>
                      </div>
                      
                      {/* Separador */}
                      <hr className="border-dashed border-gray-200" />
                    </>
                  ) : null}

                  {/* Fila del Total Final */}
                  <div className="flex justify-between items-center font-bold text-lg text-gray-800">
                    <div className="flex items-center gap-2">
                      <FaMoneyBill className={order.discountAmount ? "text-green-600" : "text-gray-600"} />
                      <span>Total:</span>
                    </div>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>

                  {/* Resto de la información (Entrega, Pago, Estado) */}
                  <div className="flex justify-between text-gray-600 pt-2">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <span className="font-medium">Entrega:</span>
                    </div>
                    <span>{getDeliveryTypeText(order.deliveryType)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaMoneyBill className="text-gray-400" />
                      <span className="font-medium">Pago:</span>
                    </div>
                    <span>{getPaymentMethodText(order.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`${getStatusColor(order.status)} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {order.notes && (
                  <div className="text-sm mt-4">
                    <h3 className="font-semibold text-gray-800 mb-1">Notas del cliente:</h3>
                    <div className="bg-gray-100 rounded-lg p-2 text-gray-700">
                      {order.notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 flex flex-wrap gap-2 border-t border-gray-200">
                {order.status !== "delivered" && order.status !== "cancelled" && (
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Marcar como Entregado
                    </button>
                )}
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Cancelar Pedido
                  </button>
                )}
                {order.status !== "in-progress" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "in-progress")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Marcar En Proceso
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;