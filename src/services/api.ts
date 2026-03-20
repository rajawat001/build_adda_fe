import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // CRITICAL FIX: Enable credentials to send httpOnly cookies
  withCredentials: true,
  // Timeout: 15 seconds for normal requests
  timeout: 15000
});

// Fetch client IP + location once from user's device, cache in memory
let clientGeo: { ip: string; city: string; state: string; country: string } | null = null;
let geoFetchAttempted = false;

function fetchClientGeo() {
  if (geoFetchAttempted || typeof window === 'undefined') return;
  geoFetchAttempted = true;

  // Try multiple free HTTPS geo APIs with fallback chain
  fetchFromApis([
    {
      url: 'https://freeipapi.com/api/json',
      parse: (data: any) => ({
        ip: data.ipAddress || '',
        city: data.cityName || '',
        state: data.regionName || '',
        country: data.countryName || ''
      }),
      isValid: (data: any) => !!data.ipAddress
    },
    {
      url: 'https://ipapi.co/json/',
      parse: (data: any) => ({
        ip: data.ip || '',
        city: data.city || '',
        state: data.region || '',
        country: data.country_name || ''
      }),
      isValid: (data: any) => !data.error && !!data.ip
    },
    {
      url: 'https://api.db-ip.com/v2/free/self',
      parse: (data: any) => ({
        ip: data.ipAddress || '',
        city: data.city || '',
        state: data.stateProv || '',
        country: data.countryName || ''
      }),
      isValid: (data: any) => !!data.ipAddress
    }
  ]);
}

interface GeoProvider {
  url: string;
  parse: (data: any) => { ip: string; city: string; state: string; country: string };
  isValid: (data: any) => boolean;
}

async function fetchFromApis(providers: GeoProvider[]) {
  for (const provider of providers) {
    try {
      const res = await fetch(provider.url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (provider.isValid(data)) {
        clientGeo = provider.parse(data);
        return; // Success, stop trying
      }
    } catch {
      // Try next provider
    }
  }
}

// Trigger geo fetch on page load (runs on user's device/browser)
fetchClientGeo();

// Attach client geo headers to every request
api.interceptors.request.use(
  (config) => {
    if (clientGeo) {
      config.headers['x-client-real-ip'] = clientGeo.ip;
      config.headers['x-client-city'] = clientGeo.city;
      config.headers['x-client-state'] = clientGeo.state;
      config.headers['x-client-country'] = clientGeo.country;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Extract the standardized response data automatically
    // If the response follows { success: true, data: {...} }, unwrap it
    const data = response.data;
    if (data && typeof data === 'object' && data.success === true && data.data !== undefined) {
      response.data = data.data;
      // Preserve meta for pagination (attach to response for consumers)
      if (data.meta) {
        (response as any).meta = data.meta;
      }
      // Preserve message if present
      if (data.message) {
        (response as any).message = data.message;
      }
    }
    return response;
  },
  async (error) => {
    // Handle standardized error format from backend
    // { success: false, error: { code: string, message: string, details?: any } }
    if (error.response?.data?.success === false && error.response.data.error) {
      const backendError = error.response.data.error;
      const enhancedError = new Error(backendError.message || 'An error occurred') as any;
      enhancedError.code = backendError.code;
      enhancedError.details = backendError.details;
      enhancedError.status = error.response.status;
      enhancedError.response = error.response;
      // Keep original response accessible for backward compat
      error.message = backendError.message || error.message;
      (error as any).errorCode = backendError.code;
      (error as any).errorDetails = backendError.details;
    }
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config?.url);
    }

    // Server down / network error — redirect to 500 page
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/500') {
        window.location.href = '/500';
      }
    }

    // Server 500/502/503/504 errors
    if (error.response?.status && error.response.status >= 500) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/500') {
        console.error(`Server error ${error.response.status}:`, error.config?.url);
      }
    }

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

    // Handle rate limiting with exponential backoff (GET requests only)
    if (error.response?.status === 429 && error.config) {
      const config = error.config as any;
      const method = (config.method || '').toUpperCase();

      // Only retry GET requests to avoid duplicate mutations
      if (method === 'GET') {
        const retryCount = config.__retryCount || 0;
        const MAX_RETRIES = 3;

        if (retryCount < MAX_RETRIES) {
          config.__retryCount = retryCount + 1;
          const backoffMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.warn(`Rate limited (429). Retrying in ${backoffMs / 1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})...`);

          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          return api(config);
        }
      }

      console.warn('Rate limited. Max retries exceeded or non-GET request.');
    }

    return Promise.reject(error);
  }
);

export default api;
