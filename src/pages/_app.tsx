import { useEffect } from 'react';
import type { AppProps} from 'next/app';
import Head from 'next/head';
import '../utils/chartSetup';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LocationProvider } from '../context/LocationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../components/common/ToastContainer';
import { ToastContainer } from 'react-toastify';
import CartConflictModal from '../components/CartConflictModal';
import ChatWidget from '../components/ChatWidget';
import InstallPWA from '../components/common/InstallPWA';
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

export default function App({ Component, pageProps }: AppProps) {
  // PWA auto-update: reload page when a new service worker takes over
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

  return (
    <>
    <Head>
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF6B35" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BuildAdda" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
    <ThemeProvider>
      <LocationProvider>
      <NotificationProvider>
        <CartProvider>
          <ToastProvider>
            {/* PWA Install Banner */}
              <InstallPWA />
            <Component {...pageProps} />
            <CartConflictModal />
            <ChatWidget />
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
    </>
  );
}