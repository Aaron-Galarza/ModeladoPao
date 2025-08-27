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