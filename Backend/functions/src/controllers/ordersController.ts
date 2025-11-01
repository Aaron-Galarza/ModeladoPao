import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// 🚨 CORRECCIÓN: Usar require para que TypeScript trate 'cors' como una función callable
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors'); 

// Inicializa el middleware de CORS para permitir peticiones desde cualquier origen (true)
const corsHandler = cors({ origin: true });

export const crearPedido = functions.https.onRequest(async (req, res) => {
    // 1. Envolver toda la lógica de la función con el handler de CORS
    corsHandler(req, res, async () => {
        
        // 2. Validar el método de la solicitud
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
            discountCode // 🚨 NUEVO: Recibimos el código de descuento del frontend
        } = req.body;

        // 3. Validar campos obligatorios
        if (!products || products.length === 0 || !guestEmail || !guestPhone || !guestName || !deliveryType || !paymentMethod) {
            res.status(400).send("Error: Faltan campos obligatorios.");
            return;
        }

        // 4. Lógica para el cálculo del subtotal (antes del descuento)
        const db = admin.firestore();
        let subtotalAmount = 0; // Renombramos a subtotalAmount para claridad
        const productsForOrder = [];

        try {
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
                let itemPrice = datosProducto?.precio ?? 0;

                subtotalAmount += itemPrice * item.quantity;

                productsForOrder.push({
                    idProducto: item.idProducto,
                    nombre: datosProducto?.nombre,
                    cantidad: item.quantity,
                    precioEnElPedido: itemPrice,
                });
            }

            let finalAmount = subtotalAmount;
            let discountApplied = 0;
            let usedDiscountCode = null;

            // ----------------------------------------------------
            // 🚨 INTEGRACIÓN: LÓGICA DE DESCUENTO NATIVA
            // ----------------------------------------------------
            if (discountCode) {
                const codeToSearch = String(discountCode).toUpperCase();
                try {
                    const discountDoc = await db.collection('Descuentos').doc(codeToSearch).get();

                    if (discountDoc.exists) {
                        const discount = discountDoc.data() as any;
                        
                        // 1. Validar que esté activo
                        if (discount.isActive) {
                            // 2. Validar expiración (si tiene fecha)
                            const isExpired = discount.expiresAt && discount.expiresAt.toDate() < new Date();
                            
                            if (!isExpired) {
                                // 3. Aplicar descuento
                                const { type, value } = discount;

                                if (type === 'percentage') {
                                    discountApplied = finalAmount * (value / 100);
                                } else if (type === 'fixed') {
                                    discountApplied = value;
                                }
                                
                                // Asegurar que el descuento no hace el total negativo
                                finalAmount = Math.max(0, finalAmount - discountApplied);
                                usedDiscountCode = codeToSearch;
                                console.log(`Cupón ${codeToSearch} aplicado. Descuento: ${discountApplied}. Monto final: ${finalAmount}`);
                            } else {
                                console.log(`Cupón ${codeToSearch} expirado.`);
                            }
                        } else {
                            console.log(`Cupón ${codeToSearch} inactivo.`);
                        }
                    } else {
                        console.log(`Cupón ${codeToSearch} no encontrado.`);
                    }
                } catch (error) {
                    console.error("Error al buscar cupón en Firestore:", error);
                    // Si hay un error, el pedido sigue sin descuento
                }
            }
            // ----------------------------------------------------

            // 5. Creación del documento del pedido en Firestore
            const orderData = {
                guestEmail,
                guestPhone,
                guestName,
                products: productsForOrder,
                subtotalAmount, // 🚨 Monto antes del descuento
                discountApplied: discountApplied, // Cuánto se descontó
                usedDiscountCode: usedDiscountCode, // El código usado (o null)
                totalAmount: finalAmount, // 🚨 MONTO FINAL A PAGAR
                deliveryType,
                shippingAddress: deliveryType === 'delivery' ? shippingAddress : null, 
                paymentMethod,
                notes: notes || '',
                status: 'pending',
                createdAt: admin.firestore.FieldValue.serverTimestamp(), 
            };

            const docRef = await db.collection("Pedidos").add(orderData);
            
            // 6. Respuesta exitosa (201 Created)
            res.status(201).send({ 
                message: "Pedido creado exitosamente.", 
                id: docRef.id,
                totalAmount: finalAmount // Devolvemos el monto final
            });
            
        } catch (error) {
            console.error("Error al procesar el pedido o calcular total:", error);
            // Si el error no ha sido manejado antes (e.g. 404 de producto), enviamos 500
            if (!res.headersSent) {
                res.status(500).send("Error interno al procesar el pedido.");
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