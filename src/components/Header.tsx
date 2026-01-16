import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import authService from '../services/auth.service';
import { NotificationBell } from './NotificationBell';
import AnnouncementBar from './AnnouncementBar';
import MobileBottomNav from './MobileBottomNav';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiPackage,
  FiMapPin
} from 'react-icons/fi';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    loadUserData();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event we'll trigger on login
    window.addEventListener('userLogin', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
    };
  }, [router.pathname]); // Reload when route changes

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      const userRole = localStorage.getItem('role');

      // Check if userData exists and is valid JSON
      if (userData && userData !== 'undefined' && userData !== 'null') {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }

      // Set user role
      if (userRole && userRole !== 'undefined' && userRole !== 'null') {
        setRole(userRole);
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
      setRole(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear client-side data even if backend call fails
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setRole(null);
      router.push('/login');
    }
  };

  // Handle mobile menu toggle with body scroll lock
  useEffect(() => {
    if (showMobileMenu) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [showMobileMenu]);

  const categories = [
    { id: 'Cement', name: 'Cement', icon: '🏗️' },
    { id: 'Steel', name: 'Steel', icon: '🔩' },
    { id: 'Bricks', name: 'Bricks', icon: '🧱' },
    { id: 'Sand', name: 'Sand', icon: '⏳' },
    { id: 'Paint', name: 'Paint', icon: '🎨' },
    { id: 'Tiles', name: 'Tiles', icon: '◽' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
    setShowCategoryMenu(false);
  };

  return (
    <>
      <AnnouncementBar />

      <header className="modern-header">
        {/* Top Header */}
        <div className="header-top">
          <div className="container">
            <div className="header-top-content">
              <div className="logo-section">
                <Link href="/" className="brand-logo">
                  <img src="/buildAddaBrandImage.png" alt="BuildAdda" />
                </Link>
              </div>

              {/* Search Bar */}
              <form className="search-bar" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search for cement, steel, bricks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="search-button">
                  Search
                </button>
              </form>

              {/* Header Actions */}
              <div className="header-actions">
                {user ? (
                  <>
                    {role === 'admin' || role === 'distributor' ? (
                      <>
                        <Link
                          href={role === 'admin' ? '/admin/dashboard' : '/distributor/dashboard'}
                          className="header-action-btn dashboard-btn"
                        >
                          <FiPackage size={20} />
                          <span>Dashboard</span>
                        </Link>
                        <button onClick={handleLogout} className="header-action-btn logout-btn">
                          <FiUser size={20} />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/wishlist" className="header-action-btn">
                          <div className="icon-badge">
                            <FiHeart size={22} />
                            {wishlistCount > 0 && (
                              <span className="badge">{wishlistCount}</span>
                            )}
                          </div>
                          <span className="action-label">Wishlist</span>
                        </Link>

                        <Link href="/cart" className="header-action-btn">
                          <div className="icon-badge">
                            <FiShoppingCart size={22} />
                            {cartCount > 0 && (
                              <span className="badge">{cartCount}</span>
                            )}
                          </div>
                          <span className="action-label">Cart</span>
                        </Link>

                        <div className="profile-dropdown">
                          <button
                            className="header-action-btn"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                          >
                            <FiUser size={22} />
                            <span className="action-label">Profile</span>
                          </button>

                          {showProfileMenu && (
                            <div className="dropdown-menu">
                              <Link href="/profile" onClick={() => setShowProfileMenu(false)}>
                                My Profile
                              </Link>
                              <Link href="/orders" onClick={() => setShowProfileMenu(false)}>
                                My Orders
                              </Link>
                              <NotificationBell />
                              <button onClick={handleLogout} className="dropdown-logout">
                                Logout
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/login" className="header-action-btn login-btn">
                      <FiUser size={20} />
                      <span>Login</span>
                    </Link>
                    <Link href="/register" className="header-action-btn register-btn">
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="header-nav">
          <div className="container">
            <nav className="main-nav">
              <div
                className="nav-item categories-dropdown"
                onMouseEnter={() => setShowCategoryMenu(true)}
                onMouseLeave={() => setShowCategoryMenu(false)}
              >
                <button className="categories-btn">
                  <FiMenu />
                  <span>All Categories</span>
                </button>

                {showCategoryMenu && (
                  <div className="categories-menu">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className="category-menu-item"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <span className="category-icon">{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/products" className="nav-link">
                Products
              </Link>
              <Link href="/distributors" className="nav-link">
                <FiMapPin size={16} />
                Find Distributors
              </Link>
              <Link href="/about" className="nav-link">
                About Us
              </Link>
              <Link href="/contact" className="nav-link">
                Contact
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}
            onClick={(e) => {
              // Close menu when clicking overlay (not content)
              if (e.target === e.currentTarget) {
                setShowMobileMenu(false);
              }
            }}
          >
            <div className="mobile-menu-content">
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: 0, color: '#111827' }}>Menu</h3>
              </div>

              <Link href="/" onClick={() => setShowMobileMenu(false)}>
                Home
              </Link>
              <Link href="/products" onClick={() => setShowMobileMenu(false)}>
                Products
              </Link>
              <Link href="/distributors" onClick={() => setShowMobileMenu(false)}>
                Find Distributors
              </Link>

              <div className="mobile-categories">
                <h4>Categories</h4>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategoryClick(category.id);
                      setShowMobileMenu(false);
                    }}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <MobileBottomNav />
    </>
  );
}