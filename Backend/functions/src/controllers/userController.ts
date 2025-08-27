// Backend/functions/src/controllers/userController.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface ILoginAdminData {
    email: string;
    password: string;
}

export const loginAdmin = functions.https.onCall(async (request: functions.https.CallableRequest<ILoginAdminData>) => {
    const { email, password } = request.data;

    if (!email || !password) {
        throw new functions.https.HttpsError('invalid-argument', 'El correo y la contraseña son obligatorios.');
    }

    try {
        // 1. Obtiene el usuario por correo electrónico
        const userRecord = await admin.auth().getUserByEmail(email);

        // 2. Verifica si el usuario tiene el custom claim de admin
        if (!userRecord.customClaims || userRecord.customClaims.admin !== true) {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permisos de administrador.');
        }

        // 3. Obtiene el token de ID (incluyendo los claims)
        const idTokenResult = await admin.auth().getUser(userRecord.uid);
        const customToken = await admin.auth().createCustomToken(idTokenResult.uid, idTokenResult.customClaims);
        
        return { token: customToken };

    } catch (error) {
        console.error("Error en el login:", error);
        throw new functions.https.HttpsError('internal', 'Credenciales incorrectas o error en el servidor.');
    }
});