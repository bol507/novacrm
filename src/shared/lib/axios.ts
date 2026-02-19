import { router } from '@/app/routes';
import { removeAuth } from '@/features/auth/utils/auth-storage';
import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  //withCredentials: true, // sessions
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Opcional: interceptores para errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar autenticación
      removeAuth();
      
      // Mostrar mensaje
      toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      
      // Redirigir al login
      router.navigate('/login');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;