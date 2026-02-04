import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiHome, FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi';

export default function MobileBottomNav() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCounts = () => {
    try {
      const cartData = localStorage.getItem('cart');
      const cart = cartData && cartData !== 'undefined' && cartData !== 'null'
        ? JSON.parse(cartData) : [];
      setCartCount(Array.isArray(cart) ? cart.length : 0);

      const wishlistData = localStorage.getItem('wishlist');
      const wishlist = wishlistData && wishlistData !== 'undefined' && wishlistData !== 'null'
        ? JSON.parse(wishlistData) : [];
      setWishlistCount(Array.isArray(wishlist) ? wishlist.filter(Boolean).length : 0);
    } catch {
      setCartCount(0);
      setWishlistCount(0);
    }
  };

  // Re-read counts on mount, route change, and storage events
  useEffect(() => {
    updateCounts();

    window.addEventListener('storage', updateCounts);
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, [router.pathname]);

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="mobile-bottom-nav">
      <button
        className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => handleNavigation('/')}
        aria-label="Home"
      >
        <FiHome size={24} />
        <span className="mobile-nav-label">Home</span>
      </button>

      <button
        className={`mobile-nav-item ${isActive('/wishlist') ? 'active' : ''}`}
        onClick={() => handleNavigation('/wishlist')}
        aria-label="Wishlist"
      >
        <div className="mobile-nav-icon-wrapper">
          <FiHeart size={24} />
          {wishlistCount > 0 && (
            <span className="mobile-nav-badge">{wishlistCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Wishlist</span>
      </button>

      <button
        className={`mobile-nav-item ${isActive('/cart') ? 'active' : ''}`}
        onClick={() => handleNavigation('/cart')}
        aria-label="Cart"
      >
        <div className="mobile-nav-icon-wrapper">
          <FiShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="mobile-nav-badge">{cartCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Cart</span>
      </button>

      <button
        className={`mobile-nav-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`}
        onClick={() => {
          const userData = localStorage.getItem('user');
          if (userData && userData !== 'undefined' && userData !== 'null') {
            handleNavigation('/profile');
          } else {
            handleNavigation('/login');
          }
        }}
        aria-label="Profile"
      >
        <FiUser size={24} />
        <span className="mobile-nav-label">Profile</span>
      </button>
    </div>
  );
}
