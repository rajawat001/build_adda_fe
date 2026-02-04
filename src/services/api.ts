import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // CRITICAL FIX: Enable credentials to send httpOnly cookies
  withCredentials: true
});

// Remove token interceptor - cookies are sent automatically
api.interceptors.request.use(
  (config) => {
    // No need to manually add Authorization header
    // Browser automatically sends httpOnly cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any client-side data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        // Only redirect if user was previously authenticated (had user data)
        // This prevents redirecting guest users browsing public pages
        const wasAuthenticated = localStorage.getItem('wasAuthenticated');
        const currentPath = window.location.pathname;

        // Don't redirect if:
        // 1. Already on login/register page
        // 2. On public pages (home, products, product details)
        // 3. User was never authenticated
        const publicPaths = ['/', '/login', '/register', '/products', '/about', '/contact', '/checkout', '/cart', '/order-success'];
        const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/products/');

        if (!isPublicPath && wasAuthenticated && currentPath !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
