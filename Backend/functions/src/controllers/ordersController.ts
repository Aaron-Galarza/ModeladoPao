import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const cors = require('cors'); 
const corsHandler = cors({ origin: true });

export const crearPedido = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        
        if (req.method !== "POST") {
            res.status(405).send("Método no permitido. Usa POST.");
            return;
        }

        const { 
            products, 
            guestEmail, 
            guestPhone, 
            guestName, 
            deliveryType, 
            shippingAddress, 
            paymentMethod, 
            notes,
            discountCode 
        } = req.body;

        // 1. Validación de campos obligatorios
        if (!products || products.length === 0 || !guestEmail || !guestPhone || !guestName || !deliveryType || !paymentMethod) {
            res.status(400).send("Error: Faltan campos obligatorios.");
            return;
        }

        const db = admin.firestore();

        try {
            // ----------------------------------------------------
            // 🚀 INICIO DE LA TRANSACCIÓN DE STOCK
            // ----------------------------------------------------
            const result = await db.runTransaction(async (transaction) => {
                let subtotalAmount = 0;
                const productsForOrder = [];
                const stockUpdates: { ref: admin.firestore.DocumentReference, nuevoStock: number }[] = [];

                // Validamos cada producto y su stock
                for (const item of products) {
                    const productoRef = db.collection("Productos").doc(item.idProducto);
                    const productoDoc = await transaction.get(productoRef);

                    if (!productoDoc.exists) {
                        throw new Error(`PRODUCTO_NO_EXISTE:${item.idProducto}`);
                    }

                    const data = productoDoc.data()!;
                    
                    // Lógica de validación de stock
                    if (data.isStockeable === true) {
                        if (data.stock < item.quantity) {
                            throw new Error(`STOCK_INSUFICIENTE:${data.nombre}`);
                        }
                        // Preparamos la actualización para después
                        stockUpdates.push({ 
                            ref: productoRef, 
                            nuevoStock: data.stock - item.quantity 
                        });
                    }

                    const itemPrice = data.precio ?? 0;
                    subtotalAmount += itemPrice * item.quantity;

                    productsForOrder.push({
                        idProducto: item.idProducto,
                        nombre: data.nombre,
                        cantidad: item.quantity,
                        precioEnElPedido: itemPrice,
                    });
                }

                // Si llegamos aquí, hay stock de TODO. Procedemos a descontar.
                stockUpdates.forEach(update => {
                    transaction.update(update.ref, { stock: update.nuevoStock });
                });

                // --- Lógica de Descuento (Integrada) ---
                let finalAmount = subtotalAmount;
                let discountApplied = 0;
                let usedDiscountCode = null;

                if (discountCode) {
                    const codeToSearch = String(discountCode).toUpperCase();
                    const discountDoc = await transaction.get(db.collection('Descuentos').doc(codeToSearch));

                    if (discountDoc.exists) {
                        const discData = discountDoc.data()!;
                        const isExpired = discData.expiresAt && discData.expiresAt.toDate() < new Date();
                        
                        if (discData.isActive && !isExpired) {
                            if (discData.type === 'percentage') {
                                discountApplied = subtotalAmount * (discData.value / 100);
                            } else {
                                discountApplied = discData.value;
                            }
                            finalAmount = Math.max(0, subtotalAmount - discountApplied);
                            usedDiscountCode = codeToSearch;
                        }
                    }
                }

                // Creamos el ID del nuevo pedido
                const newOrderRef = db.collection("Pedidos").doc();
                
                const orderData = {
                    guestEmail,
                    guestPhone,
                    guestName,
                    products: productsForOrder,
                    subtotalAmount,
                    discountApplied,
                    usedDiscountCode,
                    totalAmount: finalAmount,
                    deliveryType,
                    shippingAddress: deliveryType === 'delivery' ? shippingAddress : null, 
                    paymentMethod,
                    notes: notes || '',
                    status: 'pending',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(), 
                };

                // Guardamos el pedido dentro de la misma transacción
                transaction.set(newOrderRef, orderData);

                return { id: newOrderRef.id, totalAmount: finalAmount };
            });

            // Si la transacción termina con éxito
            res.status(201).send({ 
                message: "Pedido creado exitosamente con stock actualizado.", 
                ...result 
            });

        } catch (error: any) {
            console.error("❌ Error en crearPedido:", error.message);

            // Manejo de errores específicos para el cliente
            if (error.message.startsWith("STOCK_INSUFICIENTE:")) {
                const nombreProd = error.message.split(":")[1];
                res.status(409).send({ error: "stock-error", message: `No hay stock suficiente de: ${nombreProd}` });
            } 
            else if (error.message.startsWith("PRODUCTO_NO_EXISTE:")) {
                res.status(404).send({ error: "not-found", message: "Uno de los productos ya no existe." });
            } 
            else {
                res.status(500).send({ error: "internal", message: "Error al procesar el pedido." });
            }
        }
    });
});


// Define la interfaz para los datos de la solicitud
interface IUpdateOrderStatusData {
    orderId: string;
    newStatus: string;
}

// Función para actualizar el estado de un pedido (sin cambios)
export const updateOrderStatus = functions.https.onCall(async (request: functions.https.CallableRequest<IUpdateOrderStatusData>) => {
    try {
        const db = admin.firestore();

        if (!request.auth || !request.auth.token.admin) {
            throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden actualizar el estado de los pedidos.');
        }

        const { orderId, newStatus } = request.data;
        const validStatus = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        
        if (!orderId || typeof orderId !== 'string' || !newStatus || !validStatus.includes(newStatus)) {
            throw new functions.https.HttpsError('invalid-argument', 'Se requiere un ID de pedido y un estado válido.');
        }

        const orderRef = db.collection('Pedidos').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'El pedido no existe.');
        }

        const currentStatus = orderDoc.data()?.status;

        if (newStatus === currentStatus) {
            return { message: 'El estado del pedido ya es el que intentas establecer.' };
        }
        
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