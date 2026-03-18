import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Global CSS imports (required in _app.tsx by Next.js)
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/home.css';
import '../styles/login.css';
import '../styles/cart.css';
import '../styles/checkout.css';
import '../styles/dashboard.css';
import '../styles/admin.css';
import '../styles/products.css';
import '../styles/profile.css';
import '../styles/order.css';
import '../styles/filter.css';
import '../styles/product-detail.css';
import '../styles/order-detail.css';
import '../styles/legal.css';
import '../styles/info.css';
import '../styles/error.css';
import '../styles/category.css';
import '../styles/distributors.css';
import '../styles/toast.css';
import '../styles/forms.css';
import '../styles/loading.css';
import '../styles/modern-components.css';
import '../styles/modern-home.css';
import '../styles/modern-footer.css';
import '../styles/mobile-enhancements.css';
import '../styles/mobile-filters.css';
import '../styles/mobile-overflow-fix.css';
import '../styles/mobile-bottom-nav.css';
import '../styles/InstallPWA.css';
import '../styles/otp.css';
import '../styles/email-auth.css';
import '../styles/mobile-cards.css';
import '../styles/chat-widget.css';

// Lazy load heavy JS components (not needed on initial render)
const ChatWidget = dynamic(() => import('../components/ChatWidget'), {
  ssr: false,
  loading: () => null
});

const CartConflictModal = dynamic(() => import('../components/CartConflictModal'), {
  ssr: false,
  loading: () => null
});

const InstallPWA = dynamic(() => import('../components/common/InstallPWA'), {
  ssr: false,
  loading: () => null
});

const ToastContainer = dynamic(
  () => import('react-toastify').then(mod => mod.ToastContainer),
  { ssr: false }
);

// Contexts - lightweight, always needed
import { LocationProvider } from '../context/LocationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../components/common/ToastContainer';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  // PWA auto-update
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  // Clear stale service worker caches once per build version
  useEffect(() => {
    const CACHE_VERSION = 'v2';
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cleared = localStorage.getItem('sw-cache-cleared');
      if (cleared !== CACHE_VERSION) {
        Promise.all([
          caches.delete('next-data'),
          caches.delete('others'),
        ]).then(() => {
          localStorage.setItem('sw-cache-cleared', CACHE_VERSION);
        }).catch(() => {});
      }
    }
  }, []);

  // Suppress DOM errors caused by browser extensions
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (
        event.error?.name === 'NotFoundError' &&
        event.error?.message?.includes('removeChild')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF6B35" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BuildAdda" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <ThemeProvider>
          <LocationProvider>
            <NotificationProvider>
              <CartProvider>
                <ToastProvider>
                  <InstallPWA />
                  <ErrorBoundary>
                    <Component {...pageProps} />
                  </ErrorBoundary>
                  <CartConflictModal />
                  {!isAdminPage && <ChatWidget />}
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                  />
                </ToastProvider>
              </CartProvider>
            </NotificationProvider>
          </LocationProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  );
}
