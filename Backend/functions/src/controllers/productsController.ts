// Backend/functions/src/controllers/productsController.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Definimos la interfaz para los datos de un nuevo producto
interface ICreateProductData {
    nombre: string;
    precio: number;
    descripcion?: string;
    categoria?: string;
    stock: number
    isStockeable: boolean
}

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

// Función para crear un nuevo producto
export const createProduct = functions.https.onCall(async (request: functions.https.CallableRequest<ICreateProductData>) => {
    try {
        // 1. Verificación de autenticación
        if (!request.auth) {
            console.log('No authenticated user');
            throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado.');
        }

        // 2. Verificación de admin - CORREGIDO
        console.log('User UID:', request.auth.uid);
        console.log('User claims:', request.auth.token);
        
        // El claim admin está dentro de "claims", no en el root del token
        const isAdmin = request.auth.token.claims?.admin === true;
        console.log('Is admin:', isAdmin);

        if (!isAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden crear productos.');
        }

        // 3. Validación de datos
        const { nombre, precio, descripcion, categoria, stock, isStockeable } = request.data;

        if (isStockeable && (typeof stock !== 'number' || stock < 0)) {
            throw new functions.https.HttpsError('invalid-argument', 'Si controlas stock, debe ser un número mayor o igual a 0.');
        }

        if (!nombre || typeof nombre !== 'string') {
            throw new functions.https.HttpsError('invalid-argument', 'El nombre es obligatorio y debe ser texto.');
        }

        if (!precio || typeof precio !== 'number' || precio <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'El precio es obligatorio y debe ser un número positivo.');
        }

        // 4. Crear producto
        const newProduct = {
            nombre: nombre.trim(),
            precio: Number(precio.toFixed(2)),
            descripcion: descripcion?.trim() || '',
            categoria: categoria?.trim() || 'varios',
            stock: isStockeable ? Math.floor(stock) : 0,
            isStockeable: !!isStockeable
        };

        const docRef = await admin.firestore().collection('Productos').add(newProduct);

        return { 
            message: 'Producto creado exitosamente.',
            productId: docRef.id 
        };

    } catch (error) {
        console.error("Error en createProduct:", error);
        
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        
        throw new functions.https.HttpsError('internal', 'Error interno del servidor.');
    }
});