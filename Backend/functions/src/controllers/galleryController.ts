// Backend/functions/src/controllers/galleryController.ts

import * as functions from "firebase-functions";

interface IGalleryData {
    action: 'list' | 'delete';
    publicId?: string;
}

interface ICloudinaryResource {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
    bytes: number;
}

// Carga diferida de Cloudinary para no demorar el arranque de la función
// (evita el timeout "Cannot determine backend specification" al deployear).
let cloudinary: any = null;

function getCloudinary(): any {
    if (!cloudinary) {
        const { v2 } = require("cloudinary");
        v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        cloudinary = v2;
    }
    return cloudinary;
}

export const gallery = functions.https.onCall(async (request: functions.https.CallableRequest<IGalleryData>) => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado.');
    }

    const isAdmin = request.auth.token.admin === true;
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Solo los administradores pueden gestionar la galería.');
    }

    const { action, publicId } = request.data;

    try {
        switch (action) {
            case 'list': {
                const cld = getCloudinary();
                const result: any = await cld.api.resources({
                    type: 'upload',
                    resource_type: 'image',
                    max_results: 500,
                });

                const resources: ICloudinaryResource[] = (result.resources || []).map((r: any) => ({
                    public_id: r.public_id,
                    secure_url: r.secure_url,
                    format: r.format,
                    width: r.width,
                    height: r.height,
                    created_at: r.created_at,
                    bytes: r.bytes,
                }));

                return { resources };
            }

            case 'delete': {
                if (!publicId) {
                    throw new functions.https.HttpsError('invalid-argument', 'Se requiere publicId para eliminar.');
                }

                const cld = getCloudinary();
                const result: any = await cld.uploader.destroy(publicId, { resource_type: 'image' });

                return { message: 'Imagen eliminada correctamente.', result: result.result };
            }

            default:
                throw new functions.https.HttpsError('invalid-argument', 'Acción no válida.');
        }
    } catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        functions.logger.error("Error en gallery:", error);
        throw new functions.https.HttpsError('internal', 'Error interno del servidor.');
    }
});
