// Backend/functions/src/controllers/ordersController.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const crearPedido = functions.https.onRequest(async (req, res) => {
    // Validar el método de la solicitud
    if (req.method !== "POST") {
        res.status(405).send("Método no permitido. Usa POST.");
        return;
    }

    const { products, guestEmail, guestPhone, guestName, deliveryType, shippingAddress, paymentMethod, notes } = req.body;

    // Validar campos obligatorios
    if (!products || products.length === 0 || !guestEmail || !guestPhone || !guestName || !deliveryType || !paymentMethod) {
        res.status(400).send("Error: Faltan campos obligatorios.");
        return;
    }

    // Lógica para el cálculo del total
    const db = admin.firestore();
    let totalAmount = 0;
    const productsForOrder = [];

    for (const item of products) {
        // Validación básica de cada producto en el array
        if (!item.idProducto || typeof item.idProducto !== 'string' || !item.quantity || typeof item.quantity !== 'number') {
            res.status(400).send("Error: Cada producto debe tener 'idProducto' (string) y 'quantity' (number).");
            return;
        }

        const productoRef = db.collection("Productos").doc(item.idProducto);
        const productoDoc = await productoRef.get();

        if (!productoDoc.exists) {
            res.status(404).send(`Error: Producto con ID ${item.idProducto} no encontrado.`);
            return;
        }

        const datosProducto = productoDoc.data();
        let itemPrice = datosProducto?.precio || 0;

        totalAmount += itemPrice * item.quantity;

        productsForOrder.push({
            idProducto: item.idProducto,
            nombre: datosProducto?.nombre,
            cantidad: item.quantity,
            precioEnElPedido: itemPrice,
        });
    }

    // Creación del documento del pedido en Firestore
    try {
        const orderData = {
            guestEmail,
            guestPhone,
            guestName,
            products: productsForOrder,
            totalAmount,
            deliveryType,
            shippingAddress: deliveryType === 'delivery' ? shippingAddress : null,
            paymentMethod,
            notes: notes || '',
            status: 'pending',
            createdAt: new Date(),
        };

        const docRef = await db.collection("Pedidos").add(orderData);
        res.status(201).send({ message: "Pedido creado exitosamente.", id: docRef.id });
    } catch (error) {
        console.error("Error al crear el pedido:", error);
        res.status(500).send("Error interno al procesar el pedido.");
    }
});

// Define la interfaz para los datos de la solicitud
interface IUpdateOrderStatusData {
    orderId: string;
    newStatus: string;
}

// Función para actualizar el estado de un pedido
export const updateOrderStatus = functions.https.onCall(async (request: functions.https.CallableRequest<IUpdateOrderStatusData>) => {
    try {
        const db = admin.firestore();

// 1. Verificación de autenticación y admin
if (!request.auth || !request.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden actualizar el estado de los pedidos.');
}

        // 2. Validación de datos
        const { orderId, newStatus } = request.data;
        const validStatus = ['pending', 'in-progress', 'delivered', 'cancelled'];
        
        if (!orderId || typeof orderId !== 'string' || !newStatus || !validStatus.includes(newStatus)) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere un ID de pedido y un estado válido.');
        }

        // 3. Lógica principal: Actualizar el pedido
        const orderRef = db.collection('Pedidos').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El pedido no existe.');
        }

        const currentStatus = orderDoc.data()?.status;

        // Validaciones de estado para evitar cambios inválidos
        if (newStatus === currentStatus) {
            return { message: 'El estado del pedido ya es el que intentas establecer.' };
        }
        
        
        // Ejecuta la actualización en Firestore
        await orderRef.update({
            status: newStatus
        });
        
        return { 
            message: `Estado del pedido ${orderId} actualizado a "${newStatus}" con éxito.`,
            orderId: orderId,
            newStatus: newStatus 
        };

    } catch (error) {
        console.error("Error en updateOrderStatus:", error);
        
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        
        throw new functions.https.HttpsError('internal', 'Error interno del servidor.');
    }
});