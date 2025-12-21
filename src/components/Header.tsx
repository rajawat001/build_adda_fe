import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import authService from '../services/auth.service';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      
      // Check if userData exists and is valid JSON
      if (userData && userData !== 'undefined' && userData !== 'null') {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
      
      // Load cart
      const cartData = localStorage.getItem('cart');
      if (cartData && cartData !== 'undefined' && cartData !== 'null') {
        const cart = JSON.parse(cartData);
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } else {
        setCartCount(0);
      }
      
      // Load wishlist
      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData && wishlistData !== 'undefined' && wishlistData !== 'null') {
        const wishlist = JSON.parse(wishlistData);
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend to clear httpOnly cookie
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear client-side data even if backend call fails
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">
            <h1>BuildAdda</h1>
          </Link>
          
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/distributors">Distributors</Link>
            
            {user ? (
              <>
                <Link href="/wishlist">
                  Wishlist ({wishlistCount})
                </Link>
                <Link href="/cart">
                  Cart ({cartCount})
                </Link>
                <Link href="/orders">Orders</Link>
                <Link href="/profile">Profile</Link>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}