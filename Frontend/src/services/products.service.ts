import { db } from "../firebase/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface Product {
    id: string;
    data: {
        nombre: string;
        precio: number;
        descripcion: string;
        categoria: string;
        imagen: string;
        isActive?: boolean;
    };
}

// services/products.service.ts
export async function getProducts(): Promise<Product[]> {
    try {
        const productosCollection = collection(db, "Productos");
        const productosSnapshot = await getDocs(productosCollection); // Sin el filtro "where"

        const productosList = productosSnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data() as Product['data']
        }));
        
        return productosList;
    } catch (error) {
        console.error("Error en getProducts:", error);
        throw error;
    }
}