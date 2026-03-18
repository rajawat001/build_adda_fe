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
  (response) => response,
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config?.url);
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

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('Rate limited. Please wait before making more requests.');
    }

    return Promise.reject(error);
  }
);

export default api;
