import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Esta función se activa cuando se crea un nuevo documento en 'pedidos'
export const validarNuevoPedido = functions.firestore
  .onDocumentCreated("Pedidos/{pedidoId}", async (event) => {
    // El objeto 'snap' ahora se accede a través de event.data
    const nuevoPedido = event.data?.data() as {
      userId: string;
      productos: any[];
      estado: string;
      total: number;
    };

    // Si el documento no tiene datos, no continuamos
    if (!nuevoPedido) {
        console.error("Error: el documento no tiene datos.");
        return;
    }

    // 1. Validar campos obligatorios
    if (
      !nuevoPedido.userId ||
      !nuevoPedido.productos ||
      !nuevoPedido.estado
    ) {
      console.error("Error: faltan campos obligatorios en el pedido.");
      return event.data?.ref.delete();
    }

    // 2. Validar que la lista de productos no esté vacía
    if (nuevoPedido.productos.length === 0) {
      console.error("Error: el pedido debe contener al menos un producto.");
      return event.data?.ref.delete();
    }

    // Si todo es válido, la función termina y el documento permanece en Firestore
    console.log("Pedido validado exitosamente.");
    return null;
  });