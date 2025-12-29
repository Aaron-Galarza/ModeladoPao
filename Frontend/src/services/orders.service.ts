// orders.service.ts - CORREGIDO Y ACTUALIZADO
import axios from 'axios';
import { 
  doc, 
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config'

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;

// --- INTERFACES ---

export interface OrderProduct {
  idProducto: string;
  quantity: number;
  name: string;
  price: number;
}

export interface OrderDetails {
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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  // Campos del cupón para visualización
  couponCode?: string;
  discountAmount?: number;
}

// Interfaz para CREAR el pedido (usada por CheckoutPage)
export interface OrderData {
  products: { idProducto: string; quantity: number }[];
  guestEmail: string;
  guestPhone: string;
  guestName: string;
  deliveryType: string;
  shippingAddress?: string;
  paymentMethod: string;
  notes?: string;
  // Campos del cupón para envío
  couponCode?: string;
  discountCode?: string;   // Necesario para evitar error en checkout
  discountAmount?: number; // Necesario para evitar error en checkout
}

const FUNCTION_NAME = 'crearPedido';
const crearPedidoURL = `${FUNCTIONS_BASE_URL}${FUNCTION_NAME}`;

// --- FUNCIONES ---

export const createOrder = async (orderData: OrderData): Promise<string> => {
  try {
    console.log('📤 Enviando pedido a través de proxy:', crearPedidoURL);
    console.log('📦 Datos del pedido:', JSON.stringify(orderData, null, 2));
    
    const response = await axios.post(crearPedidoURL, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    console.log('✅ Respuesta del servidor:', response.data);
    
    const orderId = response.data.id;
    if (!orderId) {
      throw new Error('El servidor no devolvió un ID de pedido válido');
    }
    
    console.log('🎉 Pedido creado con éxito. ID:', orderId);
    return orderId;
  } catch (error: any) {
    console.error("❌ Error al crear el pedido:", error);
    
    if (axios.isAxiosError(error)) {
      console.error('📊 Detalles del error axios:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
    }
    
    throw new Error('Error al procesar el pedido. Intente de nuevo.');
  }
};

// Función para obtener pedido por ID desde Firebase
export const getOrderById = async (orderId: string): Promise<OrderDetails> => {
  try {
    console.log('🔍 Obteniendo pedido con ID desde Firebase:', orderId);
    
    const orderDocRef = doc(db, 'Pedidos', orderId);
    const orderDoc = await getDoc(orderDocRef);

    if (!orderDoc.exists()) {
      throw new Error('Pedido no encontrado');
    }

    const orderData = orderDoc.data();
    
    // Validar que los datos necesarios existan
    if (!orderData.guestName || !orderData.guestEmail || !orderData.guestPhone) {
      throw new Error('Datos incompletos del pedido');
    } // <--- AQUÍ FALTABA CERRAR LA LLAVE DEL IF ANTES

    // Mapear los datos de Firebase a la interfaz OrderDetails
    const order: OrderDetails = {
      id: orderDoc.id,
      guestName: orderData.guestName,
      guestEmail: orderData.guestEmail,
      guestPhone: orderData.guestPhone,
      deliveryType: orderData.deliveryType || 'pickup',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod || 'cash',
      products: orderData.products || [],
      totalAmount: orderData.totalAmount || 0,
      notes: orderData.notes,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date(),
      updatedAt: orderData.updatedAt,
      // Mapeo de campos de cupón
      couponCode: orderData.couponCode || orderData.discountCode, 
      discountAmount: orderData.discountAmount || 0
    };

    console.log('✅ Pedido obtenido desde Firebase:', order);
    return order;
  } catch (error: any) {
    console.error("❌ Error al obtener el pedido desde Firebase:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error('No tienes permisos para ver este pedido');
      }
      if (error.message.includes('no encontrado')) {
        throw new Error('El pedido no existe o fue eliminado');
      }
    }
    
    throw new Error('Error al obtener la información del pedido. Intente de nuevo.');
  }
};

// Función para obtener pedidos por email desde Firebase
export const getOrdersByEmail = async (email: string): Promise<OrderDetails[]> => {
  try {
    console.log('📧 Buscando pedidos para email:', email);
    
    const ordersQuery = query(
      collection(db, 'Pedidos'),
      where('guestEmail', '==', email),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(ordersQuery);
    const orders: OrderDetails[] = [];

    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      
      if (orderData.guestName && orderData.guestEmail) {
        orders.push({
          id: doc.id,
          guestName: orderData.guestName,
          guestEmail: orderData.guestEmail,
          guestPhone: orderData.guestPhone || '',
          deliveryType: orderData.deliveryType || 'pickup',
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod || 'cash',
          products: orderData.products || [],
          totalAmount: orderData.totalAmount || 0,
          notes: orderData.notes,
          status: orderData.status || 'pending',
          createdAt: orderData.createdAt || new Date(),
          updatedAt: orderData.updatedAt,
          couponCode: orderData.couponCode,
          discountAmount: orderData.discountAmount || 0
        });
      }
    });

    console.log(`✅ Encontrados ${orders.length} pedidos para ${email}`);
    return orders;
  } catch (error) {
    console.error("❌ Error al obtener pedidos por email:", error);
    throw new Error('Error al obtener el historial de pedidos. Intente de nuevo.');
  }
};

// Función para obtener todos los pedidos (solo para admin)
export const getAllOrders = async (): Promise<OrderDetails[]> => {
  try {
    console.log('📋 Obteniendo todos los pedidos');
    
    const ordersQuery = query(
      collection(db, 'Pedidos'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(ordersQuery);
    const orders: OrderDetails[] = [];

    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      
      orders.push({
        id: doc.id,
        guestName: orderData.guestName || 'Cliente no especificado',
        guestEmail: orderData.guestEmail || '',
        guestPhone: orderData.guestPhone || '',
        deliveryType: orderData.deliveryType || 'pickup',
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'cash',
        products: orderData.products || [],
        totalAmount: orderData.totalAmount || 0,
        notes: orderData.notes,
        status: orderData.status || 'pending',
        createdAt: orderData.createdAt || new Date(),
        updatedAt: orderData.updatedAt,
        // Agregamos el mapeo aquí también para que se vea en el admin
        couponCode: orderData.couponCode,
        discountAmount: orderData.discountAmount || 0
      });
    });

    console.log(`✅ Total de pedidos obtenidos: ${orders.length}`);
    return orders;
  } catch (error) {
    console.error("❌ Error al obtener todos los pedidos:", error);
    throw new Error('Error al obtener la lista de pedidos. Intente de nuevo.');
  }
};

// Función para actualizar el estado de un pedido
export const updateOrderStatus = async (orderId: string, status: OrderDetails['status']): Promise<void> => {
  try {
    console.log('🔄 Actualizando estado del pedido:', orderId, '->', status);
    // Nota: Esta función es solo un placeholder si no hay lógica de escritura directa aquí.
    console.log('✅ Estado del pedido actualizado correctamente (Simulado)');
  } catch (error) {
    console.error("❌ Error al actualizar el estado del pedido:", error);
    throw new Error('Error al actualizar el pedido. Intente de nuevo.');
  }
};

// Utilidad para formatear la fecha del pedido
export const formatOrderDate = (date: Timestamp | Date): string => {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utilidad para obtener el texto del estado
export const getStatusText = (status: OrderDetails['status']): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmado',
    'preparing': 'En preparación',
    'ready': 'Listo para retirar',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
};

// Utilidad para obtener el color del estado
export const getStatusColor = (status: OrderDetails['status']): string => {
  const colorMap: Record<string, string> = {
    'pending': 'text-yellow-600 bg-yellow-100',
    'confirmed': 'text-blue-600 bg-blue-100',
    'preparing': 'text-orange-600 bg-orange-100',
    'ready': 'text-green-600 bg-green-100',
    'delivered': 'text-purple-600 bg-purple-100',
    'cancelled': 'text-red-600 bg-red-100'
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};