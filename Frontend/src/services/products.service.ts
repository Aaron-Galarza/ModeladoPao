import { db } from "../firebase.config";
import { collection, getDocs } from "firebase/firestore";

// Definimos la interfaz del producto para tipado
export interface Product {
    id: string;
    data: {
        nombre: string;
        precio: number;
        descripcion: string;
        categoria: string;
        imagen: string;
    };
}

export async function getProducts(): Promise<Product[]> {
    const productosCollection = collection(db, "Productos"); // Asegúrate de que el nombre de la colección sea exactamente "Productos"
    const productosSnapshot = await getDocs(productosCollection);
    
    // Mapeamos los documentos para obtener los datos y el ID
    const productosList = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as Product['data']
    }));
    
    return productosList;
}