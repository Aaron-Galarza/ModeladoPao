import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserShield, FaSpinner } from 'react-icons/fa';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase.config';
import { useAuthStore } from '../../components/admin/authStore';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setIsAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;
      const idTokenResult = await user.getIdTokenResult(true);
      const isAdmin = idTokenResult.claims.admin === true;

      if (!isAdmin) {
        throw new Error('Acceso denegado. No tienes permisos de administrador.');
      }

      setUser(user);
      setIsAdmin(true);
      navigate('/admin/dashboard');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/user-not-found':
          setError('Usuario no encontrado');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde');
          break;
        default:
          setError(error.message || 'Error en el login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--pastel-pink)]/20 to-[var(--pastel-menta)]/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[var(--pastel-pink)] to-[#f8a5c5] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaUserShield className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-[var(--text-color)] mb-2">
            Acceso Administrador
          </h1>
          <p className="text-gray-600 font-poppins">
            Ingresa tus credenciales para acceder al panel
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos del formulario */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--pastel-pink)] focus:border-transparent transition-all duration-200 font-poppins"
                  placeholder="admin@modeladopao.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--pastel-pink)] focus:border-transparent transition-all duration-200 font-poppins"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-poppins">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--pastel-pink)] to-[#f8a5c5] text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg font-poppins"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;