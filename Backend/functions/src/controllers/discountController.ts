// C:\Users\Aaron\Desktop\OTROS\TRABAJO\ModeladoPao\Backend\functions\src\controllers\discountController.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const cors = require('cors')({ origin: true }); // No es necesario con onCall

// --- INICIALIZACIÓN GLOBAL ---
const db = admin.firestore();

// --- Interfaces de Tipado ---

interface Discount {
    code: string;
    value: number;
    type: 'percentage' | 'fixed';
    isActive: boolean;
    // expiresAt ELIMINADO
}

interface IManageDiscountData {
    action: 'list' | 'create' | 'update' | 'delete';
    data?: any;
    discountId?: string;
}


// --- 1. FUNCIÓN DE ADMINISTRACIÓN (manageDiscounts) ---

export const manageDiscounts = functions.https.onCall(async (request: functions.https.CallableRequest<IManageDiscountData>) => {
    
    console.log('🔧 manageDiscounts iniciada');
    
    if (!request.auth) {
        console.log('❌ Usuario no autenticado');
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para gestionar descuentos.');
    }

    // Nota: Asume que el claim 'admin' está configurado en el token del usuario
    const isAdmin = request.auth.token?.admin === true; 
    
    if (!isAdmin) {
        console.log('❌ Usuario no es admin');
        throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden gestionar descuentos.');
    }

    const discountRef = db.collection('Descuentos'); 
    
    const { action, data, discountId } = request.data;
    
    console.log('🎯 Acción a ejecutar:', action);
    
    try {
        switch (action) {
            
            case 'list':
                console.log('📋 Listando descuentos...');
                const snapshot = await discountRef.get();
                const discounts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                console.log(`✅ Encontrados ${discounts.length} descuentos`);
                return { discounts };

            case 'create':
                console.log('🆕 Creando descuento...');
                
                if (!data || !data.code || data.value === undefined || !data.type) {
                    throw new functions.https.HttpsError('invalid-argument', 'Faltan campos obligatorios (code, value, type).');
                }
                
                const codeUpper = data.code.toUpperCase();
                const existingDoc = await discountRef.doc(codeUpper).get();
                if (existingDoc.exists) {
                    throw new functions.https.HttpsError('already-exists', 'El código de descuento ya existe.');
                }

                // Lógica de expiresAt ELIMINADA aquí

                const newDiscount: Discount = {
                    code: codeUpper,
                    value: Number(data.value),
                    type: data.type,
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    // expiresAt ELIMINADO
                };

                await discountRef.doc(newDiscount.code).set(newDiscount);
                
                return { 
                    message: `Cupón ${newDiscount.code} creado exitosamente.`, 
                    discount: newDiscount 
                };

            case 'update':
                console.log('✏️ Actualizando descuento:', discountId);
                
                if (!discountId || !data) {
                    throw new functions.https.HttpsError('invalid-argument', 'Se requiere discountId y datos para actualizar.');
                }
                
                const updateData: any = { ...data };
                delete updateData.code; // No se permite cambiar el ID

                // Lógica de expiresAt ELIMINADA aquí
                
                await discountRef.doc(discountId).update(updateData);
                return { message: `Cupón ${discountId} actualizado exitosamente.` };
            
            case 'delete':
                console.log('🗑️ Eliminando descuento:', discountId);
                
                if (!discountId) {
                    throw new functions.https.HttpsError('invalid-argument', 'Se requiere discountId para eliminar.');
                }
                await discountRef.doc(discountId).delete();
                return { message: `Cupón ${discountId} eliminado.` };

            default:
                throw new functions.https.HttpsError('invalid-argument', 'Acción no válida.');
        }
    } catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        functions.logger.error("❌ Error en manageDiscounts (No-HttpsError):", error);
        throw new functions.https.HttpsError('internal', 'Error interno del servidor.');
    }
});

// --- 2. FUNCIÓN DE VALIDACIÓN PÚBLICA (checkCoupon) ---
// CAMBIAMOS functions.https.onCall por functions.https.onRequest

export const checkCoupon = functions.https.onRequest((req, res) => {
    // Usamos CORS para permitir peticiones desde localhost:5173
    cors(req, res, async () => {
        // Solo aceptamos peticiones POST para mantener la seguridad
        if (req.method !== 'POST') {
            return res.status(405).send({ error: 'Método no permitido', message: 'Solo se aceptan peticiones POST' });
        }
        
        console.log('🎫 checkCoupon iniciada por petición HTTP');
        
        // Obtener el código del cupón del cuerpo de la petición (JSON)
        const { couponCode } = req.body;
        
        console.log('🔍 Verificando cupón:', couponCode);

        // 1. Validar la entrada
        if (!couponCode || typeof couponCode !== 'string' || couponCode.trim().length === 0) {
            return res.status(400).send({ 
                error: 'invalid-argument', 
                message: 'El código de cupón no es válido.' 
            });
        }

        const codeToCheck = couponCode.trim().toUpperCase();

        try {
            // 2. Consultar el documento en Firestore
            const discountDoc = await db.collection('Descuentos').doc(codeToCheck).get();

            // 3. Verificar si el cupón existe
            if (!discountDoc.exists) {
                console.log('❌ Cupón no encontrado:', codeToCheck);
                return res.status(404).send({ 
                    error: 'not-found', 
                    message: 'El cupón no existe.' 
                });
            }

            const discountData = discountDoc.data() as any; // Usar 'any' si la interfaz Discount no está disponible aquí
            
            console.log('📊 Datos del cupón encontrado:', discountData);
            
            // 4. Verificar validez (activo)
            if (!discountData.isActive) {
                console.log('❌ Cupón inactivo:', codeToCheck);
                return res.status(403).send({ 
                    error: 'failed-precondition', 
                    message: 'El cupón está inactivo.' 
                });
            }
            
            // 5. Devolver el valor del descuento
            console.log('✅ Cupón válido:', codeToCheck);
            return res.status(200).send({
                valid: true,
                code: discountData.code,
                type: discountData.type,
                value: Number(discountData.value),
                message: `Cupón ${discountData.code} aplicado con éxito.`
            });

        } catch (error) {
            console.error('💥 Error en checkCoupon:', error);
            // En caso de cualquier error interno, devolvemos 500
            return res.status(500).send({ 
                error: 'internal', 
                message: 'Error interno del servidor al verificar el cupón.' 
            });
        }
    });
});