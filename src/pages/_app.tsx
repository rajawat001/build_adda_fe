import type { AppProps} from 'next/app';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ToastProvider } from '../components/common/ToastContainer';
import { ToastContainer } from 'react-toastify';
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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <Component {...pageProps} />
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
      </NotificationProvider>
    </ThemeProvider>
  );
}