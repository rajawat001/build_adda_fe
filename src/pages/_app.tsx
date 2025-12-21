import type { AppProps } from 'next/app';
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

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}