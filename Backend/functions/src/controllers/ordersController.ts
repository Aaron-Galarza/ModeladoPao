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
        // El handler de CORS ya se encarga de las peticiones OPTIONS (preflight), 
        // por lo que solo necesitamos chequear el POST.
        if (req.method !== "POST") {
            res.status(405).send("Método no permitido. Usa POST.");
            return;
        }

        const { products, guestEmail, guestPhone, guestName, deliveryType, shippingAddress, paymentMethod, notes } = req.body;

        // 3. Validar campos obligatorios
        if (!products || products.length === 0 || !guestEmail || !guestPhone || !guestName || !deliveryType || !paymentMethod) {
            res.status(400).send("Error: Faltan campos obligatorios.");
            return;
        }

        // 4. Lógica para el cálculo del total
        const db = admin.firestore();
        let totalAmount = 0;
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
                // Usar el operador de coalescencia nula (??) para un manejo seguro de precio
                let itemPrice = datosProducto?.precio ?? 0;

                totalAmount += itemPrice * item.quantity;

                productsForOrder.push({
                    idProducto: item.idProducto,
                    nombre: datosProducto?.nombre,
                    cantidad: item.quantity,
                    precioEnElPedido: itemPrice,
                });
            }

            // 5. Creación del documento del pedido en Firestore
            const orderData = {
                guestEmail,
                guestPhone,
                guestName,
                products: productsForOrder,
                totalAmount,
                deliveryType,
                // Si es pickup, la dirección es null; si es delivery, usa la dirección proporcionada
                shippingAddress: deliveryType === 'delivery' ? shippingAddress : null, 
                paymentMethod,
                notes: notes || '',
                status: 'pending',
                // Usar serverTimestamp para hora precisa y consistente
                createdAt: admin.firestore.FieldValue.serverTimestamp(), 
            };

            const docRef = await db.collection("Pedidos").add(orderData);
            
            // 6. Respuesta exitosa (201 Created)
            res.status(201).send({ message: "Pedido creado exitosamente.", id: docRef.id });
            
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

// Función para actualizar el estado de un pedido (sin cambios necesarios)
export const updateOrderStatus = functions.https.onCall(async (request: functions.https.CallableRequest<IUpdateOrderStatusData>) => {
    // Las funciones onCall no necesitan CORS porque usan el SDK de Firebase
    // y manejan la comunicación de forma diferente (a través de HTTP/2 y SDK).
    try {
        const db = admin.firestore();

        // 1. Verificación de autenticación y admin
        if (!request.auth || !request.auth.token.admin) {
            throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden actualizar el estado de los pedidos.');
        }

        // 2. Validación de datos
        const { orderId, newStatus } = request.data;
        // Asumo que tu frontend tiene 'pending'|'confirmed'|'preparing'|'ready'|'delivered'|'cancelled'
        const validStatus = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        
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