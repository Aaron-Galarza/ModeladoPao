// orders.service.ts - CREACIÓN CON PROXY, OBTENCIÓN DIRECTA DE FIREBASE
import axios from 'axios';
import { 
  doc, 
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config'; // Ajusta la ruta según tu estructura

// Interfaces
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
  status: string;
  createdAt: any;
}

// Proxy endpoints (solo para creación)
const crearPedidoURL = '/api/crearPedido';

// Función para crear pedido (usando proxy como antes)
export interface OrderData {
  products: { idProducto: string; quantity: number }[];
  guestEmail: string;
  guestPhone: string;
  guestName: string;
  deliveryType: string;
  shippingAddress?: string;
  paymentMethod: string;
  notes?: string;
}

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
  } catch (error) {
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

