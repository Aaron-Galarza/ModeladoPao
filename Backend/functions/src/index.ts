// Backend/functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Inicializa el SDK de Admin de Firebase
admin.initializeApp();


//-----PEDIDOS------//
//----------------------API POST crearPedido-----------------------//
// Backend/functions/src/index.ts
exports.crearPedido = functions.https.onRequest(async (req, res) => {
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

//-----PRODUCTOS------//
// Función de depuración para listar productos
export const listarProductos = functions.https.onRequest(async (req, res) => {
    // Validamos que solo acepte peticiones GET
    if (req.method !== "GET") {
        res.status(405).send("Método no permitido. Usa GET.");
        return;
    }

    try {
        const productosRef = admin.firestore().collection("Productos");
        const snapshot = await productosRef.get();

        if (snapshot.empty) {
            res.status(404).send("No se encontraron productos.");
            return;
        }

        const productos = snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
        }));

        res.status(200).json(productos);
    } catch (error) {
        console.error("Error al listar productos:", error);
        res.status(500).send("Error interno del servidor.");
    }
});
