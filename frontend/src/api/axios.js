import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8085/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute le token JWT automatiquement à chaque requête (sauf si pas de token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Ne pas ajouter le header Authorization si pas de token
    delete config.headers.Authorization;
  }
  return config;
});

export default api;