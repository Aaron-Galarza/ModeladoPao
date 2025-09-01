import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  // Obtener la URL base desde las variables de entorno
  const API_BASE_URL = env.VITE_FIREBASE_FUNCTIONS_URL 
  return {
    plugins: [react(), tailwindcss()],
    envPrefix: ['VITE_', 'REACT_APP_'],
    
    // 🔥 CONFIGURACIÓN DEL SERVER CON PROXY USANDO VARIABLE DE ENTORNO
    server: {
      proxy: {
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 Enviando request via proxy:', req.method, req.url);
              console.log('🎯 Target URL:', API_BASE_URL);
            });
          }
        }
      }
    }
  }
})