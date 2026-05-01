import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8085/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute le token JWT automatiquement à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log(`[Axios] Request to ${config.url}, Token found: ${!!token}`);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;