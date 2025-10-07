import { db } from "../firebase/firebase.config";
import { collection, getDocs } from "firebase/firestore";

// Interfaz para la categoría (refleja el documento en la nueva colección Categorias)
export interface Category {
    id: string; // El ID del documento (ej. 'animales')
    nombre: string; // El nombre legible (ej. 'Animales')
}

/**
 * Obtiene la lista maestra de categorías desde la colección 'Categorias'.
 */
export async function getCategories(): Promise<Category[]> {
    try {
        const categoriesCollection = collection(db, "Categorias"); 
        const categoriesSnapshot = await getDocs(categoriesCollection);

        const categoriesList = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre as string
        }));
        
        return categoriesList;
    } catch (error) {
        console.error("Error en getCategories:", error);
        return []; 
    }
}