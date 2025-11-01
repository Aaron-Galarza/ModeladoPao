// C:\Users\Aaron\Desktop\OTROS\TRABAJO\ModeladoPao\Frontend\src\services\coupons.service.ts

import axios from 'axios';
// Ya no necesitamos 'getFunctions' ni 'httpsCallable'
// import { getFunctions, httpsCallable } from 'firebase/functions'; 

// Usamos la misma lógica que en orders.service.ts
const FUNCTIONS_BASE_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
const FUNCTION_NAME = 'checkCoupon';
// Usará el proxy en desarrollo gracias a VITE_FIREBASE_FUNCTIONS_URL = '/api'
const checkCouponURL = `${FUNCTIONS_BASE_URL}${FUNCTION_NAME}`; 

export interface DiscountResponse {
    valid: boolean;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    message: string;
}

export const checkCoupon = async (couponCode: string): Promise<DiscountResponse> => {
    try {
        console.log('📤 Verificando cupón con axios via proxy:', checkCouponURL);
        
        const response = await axios.post<DiscountResponse>(checkCouponURL, { 
            couponCode 
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        console.log('✅ Cupón verificado exitosamente:', response.data);
        return response.data;

    } catch (error) {
        console.error("❌ Error al verificar cupón:", error);
        
        if (axios.isAxiosError(error) && error.response?.data?.message) {
             // Lanza el mensaje de error específico que devuelve la función (404, 403, 400)
            throw new Error(error.response.data.message);
        }
        
        throw new Error('Error al conectar con el servicio de cupones. Intente de nuevo.');
    }
};