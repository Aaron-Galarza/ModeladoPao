import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicialización de Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors'); 
const corsHandler = cors({ origin: true });

// --- INTERFACES ---
interface IUpdateOrderStatusData {
    orderId: string;
    newStatus: string;
}

// --- FUNCIÓN 1: CREAR PEDIDO ---
export const crearPedido = functions.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        
        // 1. Validar el método de la solicitud
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
            discountCode,
            couponCode 
        } = req.body;

        // 2. Validar campos obligatorios
        if (!products || products.length === 0 || !guestEmail || !guestPhone || !guestName || !deliveryType || !paymentMethod) {
            res.status(400).send("Error: Faltan campos obligatorios.");
            return;
        }

        const db = admin.firestore();

        try {
            // 🚀 INICIO DE LA TRANSACCIÓN (Stock + Descuento + Creación)
            const result = await db.runTransaction(async (transaction) => {
                let subtotalAmount = 0;
                const productsForOrder = [];
                const stockUpdates: { ref: admin.firestore.DocumentReference, nuevoStock: number }[] = [];

                // A. Validar cada producto, su precio y su STOCK
                for (const item of products) {
                    const productoRef = db.collection("Productos").doc(item.idProducto);
                    const productoDoc = await transaction.get(productoRef);

                    if (!productoDoc.exists) {
                        throw new Error(`PRODUCTO_NO_EXISTE:${item.idProducto}`);
                    }

                    const data = productoDoc.data()!;
                    
                    // Lógica de validación de stock
                    if (data.isStockeable === true) {
                        if (typeof data.stock !== 'number' || data.stock < item.quantity) {
                            throw new Error(`STOCK_INSUFICIENTE:${data.nombre}`);
                        }
                        // Preparamos la actualización para el final de la transacción
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

                // B. Lógica de Descuento
                let finalAmount = subtotalAmount;
                let discountApplied = 0;
                let usedDiscountCode = null;

                const codeToProcess = discountCode || couponCode;
                if (codeToProcess) {
                    const codeToSearch = String(codeToProcess).toUpperCase();
                    const discountRef = db.collection('Descuentos').doc(codeToSearch);
                    const discountDoc = await transaction.get(discountRef);

                    if (discountDoc.exists) {
                        const disc = discountDoc.data()!;
                        const isExpired = disc.expiresAt && disc.expiresAt.toDate() < new Date();
                        
                        if (disc.isActive && !isExpired) {
                            if (disc.type === 'percentage') {
                                discountApplied = subtotalAmount * (disc.value / 100);
                            } else if (disc.type === 'fixed') {
                                discountApplied = disc.value;
                            }
                            finalAmount = Math.max(0, subtotalAmount - discountApplied);
                            usedDiscountCode = codeToSearch;
                        }
                    }
                }

                // C. Ejecutar actualizaciones de stock (dentro de la transacción)
                stockUpdates.forEach(update => {
                    transaction.update(update.ref, { stock: update.nuevoStock });
                });

                // D. Crear el documento del Pedido
                const newOrderRef = db.collection("Pedidos").doc();
                const orderData = {
                    guestEmail,
                    guestPhone,
                    guestName,
                    products: productsForOrder,
                    subtotalAmount, 
                    couponCode: usedDiscountCode,   
                    discountAmount: discountApplied, 
                    totalAmount: finalAmount, 
                    deliveryType,
                    shippingAddress: deliveryType === 'delivery' ? shippingAddress : null, 
                    paymentMethod,
                    notes: notes || '',
                    status: 'pending',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(), 
                };

                transaction.set(newOrderRef, orderData);

                return { id: newOrderRef.id, totalAmount: finalAmount };
            });

            // Respuesta exitosa
            res.status(201).send({ 
                message: "Pedido creado exitosamente con stock actualizado.", 
                ...result 
            });

        } catch (error: any) {
            console.error("❌ Error en crearPedido:", error.message);

            // Manejo de errores específicos
            if (error.message.startsWith("STOCK_INSUFICIENTE:")) {
                const nombreProd = error.message.split(":")[1];
                res.status(409).send({ 
                    error: "stock-error", 
                    message: `No hay stock suficiente de: ${nombreProd}` 
                });
            } 
            else if (error.message.startsWith("PRODUCTO_NO_EXISTE:")) {
                res.status(404).send({ 
                    error: "not-found", 
                    message: "Uno de los productos ya no existe en la base de datos." 
                });
            } 
            else {
                res.status(500).send({ 
                    error: "internal", 
                    message: "Error interno al procesar el pedido." 
                });
            }
        }
    });
});

// --- FUNCIÓN 2: ACTUALIZAR ESTADO DEL PEDIDO ---
export const updateOrderStatus = functions.https.onCall(async (request: functions.https.CallableRequest<IUpdateOrderStatusData>) => {
    try {
        const db = admin.firestore();

        // Validar permisos de administrador
        if (!request.auth || !request.auth.token.admin) {
            throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden realizar esta acción.');
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