// Backend/functions/src/index.ts

import * as admin from "firebase-admin";
admin.initializeApp();

// Importamos las funciones de los controladores
import * as productsController from "./controllers/productsController";
import * as ordersController from "./controllers/ordersController";
import * as userController from "./controllers/userController";
import * as discountController from "./controllers/discountController";


// Exportamos las funciones para que Firebase las detecte
exports.listarProductos = productsController.listarProductos;
exports.crearPedido = ordersController.crearPedido;
exports.updateOrderStatus = ordersController.updateOrderStatus;
exports.createProduct = productsController.createProduct;
exports.loginAdmin = userController.loginAdmin;
exports.manageDiscounts = discountController.manageDiscounts;
exports.checkCoupon = discountController.checkCoupon;         // AHORA ES onRequest (para público)