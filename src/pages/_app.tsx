import type { AppProps} from 'next/app';
import '../styles/globals.css';
import '../styles/home.css';
import '../styles/login.css';
import '../styles/cart.css';
import '../styles/checkout.css';
import '../styles/dashboard.css';
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

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}