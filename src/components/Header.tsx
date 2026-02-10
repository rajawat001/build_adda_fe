import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback } from 'react';
import authService from '../services/auth.service';
import { getProductsByCategory } from '../services/product.service';
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
  FiMapPin,
  FiBell
} from 'react-icons/fi';
import GoogleTranslate from './GoogleTranslate';
import {
  GiBrickWall,
  GiSteelClaws,
  GiClayBrick,
  GiSandCastle,
  GiPaintBucket,
  GiDominoTiles
} from 'react-icons/gi';
import api from '../services/api';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'products' | 'categories' | 'distributors'>('products');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const profileRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
    loadCategories();

    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
    };
  }, [router.pathname]);

  // Close profile dropdown on outside click & position dropdown on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      // Position dropdown so it stays within viewport on mobile
      if (profileRef.current) {
        const rect = profileRef.current.getBoundingClientRect();
        const menuWidth = 200;
        const viewportWidth = window.innerWidth;
        // Check if dropdown would overflow left side
        if (rect.right - menuWidth < 8) {
          // Align to left edge of viewport with padding
          setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            right: 'auto',
            left: 8,
          });
        } else if (viewportWidth <= 768) {
          // On mobile, use fixed positioning anchored to right of viewport
          setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            right: 12,
            left: 'auto',
          });
        } else {
          setDropdownStyle({});
        }
      }
    } else {
      setDropdownStyle({});
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Close search panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        setShowSearchPanel(false);
      }
    };
    if (showSearchPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchPanel]);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      const userRole = localStorage.getItem('role');

      if (userData && userData !== 'undefined' && userData !== 'null') {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }

      if (userRole && userRole !== 'undefined' && userRole !== 'null') {
        setRole(userRole);
      }

      const cartData = localStorage.getItem('cart');
      if (cartData && cartData !== 'undefined' && cartData !== 'null') {
        const cart = JSON.parse(cartData);
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } else {
        setCartCount(0);
      }

      const wishlistData = localStorage.getItem('wishlist');
      if (wishlistData && wishlistData !== 'undefined' && wishlistData !== 'null') {
        const wishlist = JSON.parse(wishlistData);
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      } else {
        setWishlistCount(0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setRole(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setRole(null);
      router.push('/login');
    }
  };

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

  const categoryIconMap: Record<string, React.ReactNode> = {
    'Cement': <GiBrickWall size={20} />,
    'Steel': <GiSteelClaws size={20} />,
    'Bricks': <GiClayBrick size={20} />,
    'Sand': <GiSandCastle size={20} />,
    'Paint': <GiPaintBucket size={20} />,
    'Tiles': <GiDominoTiles size={20} />,
    'Other': <FiPackage size={20} />,
  };

  const defaultCategories = [
    { id: 'Cement', name: 'Cement' },
    { id: 'Steel', name: 'Steel' },
    { id: 'Bricks', name: 'Bricks' },
    { id: 'Sand', name: 'Sand' },
    { id: 'Paint', name: 'Paint' },
    { id: 'Tiles', name: 'Tiles' }
  ];

  const [categories, setCategories] = useState(defaultCategories);

  const getCategoryIcon = (name: string) => {
    return categoryIconMap[name] || <FiPackage size={20} />;
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      const categoryList = response.data.categories || [];
      if (categoryList.length > 0) {
        setCategories(categoryList.map((cat: any) => ({
          id: cat.id || cat._id || cat.name,
          name: cat.name,
        })));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Mega-menu state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [megaMenuLoading, setMegaMenuLoading] = useState(false);
  const categoryCache = useRef<Record<string, any>>({});
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any>>({});

  const handleCategoryHover = useCallback(async (categoryId: string) => {
    setActiveCategory(categoryId);

    if (categoryCache.current[categoryId]) {
      setCategoryProducts((prev) => ({ ...prev, [categoryId]: categoryCache.current[categoryId] }));
      return;
    }

    setMegaMenuLoading(true);
    try {
      const data = await getProductsByCategory(categoryId);
      const products = Array.isArray(data) ? data : data.products || [];
      const grouped: Record<string, { distributorId: string; businessName: string; city: string; products: any[] }> = {};

      products.forEach((p: any) => {
        const dist = p.distributor;
        if (!dist) return;
        const name = dist.businessName || dist.name || 'Unknown';
        if (!grouped[name]) {
          grouped[name] = {
            distributorId: dist._id || '',
            businessName: name,
            city: dist.city || dist.address?.city || '',
            products: []
          };
        }
        grouped[name].products.push({
          _id: p._id,
          name: p.name,
          price: p.price,
          image: p.image || p.images?.[0] || ''
        });
      });

      categoryCache.current[categoryId] = grouped;
      setCategoryProducts((prev) => ({ ...prev, [categoryId]: grouped }));
    } catch (err) {
      console.error('Failed to fetch category products:', err);
    } finally {
      setMegaMenuLoading(false);
    }
  }, []);

  const handleMegaMenuOpen = useCallback(() => {
    setShowCategoryMenu(true);
    // Auto-select first category
    if (!activeCategory && categories.length > 0) {
      handleCategoryHover(categories[0].id);
    }
  }, [activeCategory, handleCategoryHover, categories]);

  const searchPlaceholders: Record<string, string> = {
    products: 'Search products by name...',
    categories: 'Search categories...',
    distributors: 'Search distributors by name, city...'
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (searchType === 'products') {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    } else if (searchType === 'categories') {
      const match = categories.find(
        (c) => c.name.toLowerCase().includes(q.toLowerCase())
      );
      router.push(`/products?category=${encodeURIComponent(match ? match.id : q)}`);
    } else {
      router.push(`/distributors?search=${encodeURIComponent(q)}`);
    }
    setSearchQuery('');
    setShowSearchPanel(false);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
    setShowCategoryMenu(false);
    setActiveCategory(null);
  };

  const handleMegaMenuClose = () => {
    setShowCategoryMenu(false);
    setActiveCategory(null);
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

              {/* Desktop Search Bar - hidden on mobile, replaced by mobile search below */}
              <div className="desktop-search-wrapper desktop-search">
                <div className="search-toggle-group">
                  {(['products', 'categories', 'distributors'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`search-toggle-btn${searchType === type ? ' active' : ''}`}
                      onClick={() => setSearchType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <form className="search-bar" onSubmit={handleSearch}>
                  <div className="search-input-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder={searchPlaceholders[searchType]}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="search-button">
                    Search
                  </button>
                </form>
              </div>

              {/* Google Translate */}
              <div className="header-translate">
                <GoogleTranslate />
              </div>

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

                        <div className="profile-dropdown" ref={profileRef}>
                          <button
                            className="header-action-btn"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                          >
                            <FiUser size={22} />
                            <span className="action-label">Profile</span>
                          </button>

                          {showProfileMenu && (
                            <div className="dropdown-menu" style={dropdownStyle}>
                              <Link href="/profile" onClick={() => setShowProfileMenu(false)}>
                                My Profile
                              </Link>
                              <Link href="/orders" onClick={() => setShowProfileMenu(false)}>
                                My Orders
                              </Link>
                              <Link href="/notifications" onClick={() => setShowProfileMenu(false)}>
                                <FiBell size={16} />
                                Notifications
                              </Link>
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

              {/* Mobile: Search Icon + Hamburger */}
              <div className="mobile-header-icons">
                <button
                  className="mobile-search-icon-btn"
                  onClick={() => setShowSearchPanel(!showSearchPanel)}
                  aria-label="Search"
                >
                  {showSearchPanel ? <FiX size={22} /> : <FiSearch size={22} />}
                </button>

                <button
                  className="mobile-menu-toggle"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="header-nav">
          <div className="container">
            <nav className="main-nav">
              <div
                className="nav-item categories-dropdown"
                onMouseEnter={handleMegaMenuOpen}
                onMouseLeave={handleMegaMenuClose}
              >
                <button className="categories-btn">
                  <FiMenu />
                  <span>All Categories</span>
                </button>

                {showCategoryMenu && (
                  <div className="mega-menu-container">
                    <div className="mega-menu-left">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={`mega-menu-category-item${activeCategory === category.id ? ' active' : ''}`}
                          onMouseEnter={() => handleCategoryHover(category.id)}
                          onClick={() => handleCategoryClick(category.id)}
                        >
                          <span className="mega-menu-category-icon">{getCategoryIcon(category.name)}</span>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mega-menu-right">
                      {megaMenuLoading && !categoryProducts[activeCategory || ''] ? (
                        <div className="mega-menu-skeleton-grid">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="mega-menu-skeleton-group">
                              <div className="mega-menu-skeleton-heading" />
                              <div className="mega-menu-skeleton-line" />
                              <div className="mega-menu-skeleton-line short" />
                              <div className="mega-menu-skeleton-line" />
                            </div>
                          ))}
                        </div>
                      ) : activeCategory && categoryProducts[activeCategory] ? (
                        Object.keys(categoryProducts[activeCategory]).length > 0 ? (
                          <div className="mega-menu-distributors-grid">
                            {Object.values(categoryProducts[activeCategory]).map((group: any) => (
                              <div key={group.distributorId} className="mega-menu-distributor-group">
                                <h4 className="distributor-name">
                                  <Link
                                    href={`/distributor/${group.distributorId}`}
                                    onClick={handleMegaMenuClose}
                                  >
                                    {group.businessName}
                                  </Link>
                                  {group.city && <span className="distributor-city">{group.city}</span>}
                                </h4>
                                <ul className="distributor-products">
                                  {group.products.slice(0, 5).map((product: any) => (
                                    <li key={product._id}>
                                      <Link
                                        href={`/products/${product._id}`}
                                        className="mega-menu-product-link"
                                        onClick={handleMegaMenuClose}
                                      >
                                        {product.name}
                                        {product.price > 0 && (
                                          <span className="mega-menu-product-price">
                                            ₹{product.price}
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mega-menu-empty">
                            No products found in this category yet.
                          </div>
                        )
                      ) : null}
                    </div>
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

        {/* Mobile Search Panel - Fixed overlay */}
        {showSearchPanel && (
          <div className="search-panel-overlay" onClick={() => setShowSearchPanel(false)}>
            <div
              className="search-dropdown-panel"
              ref={searchPanelRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="search-toggle-group">
                {(['products', 'categories', 'distributors'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`search-toggle-btn${searchType === type ? ' active' : ''}`}
                    onClick={() => setSearchType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <form className="search-panel-form" onSubmit={handleSearch}>
                <div className="search-panel-input-wrap">
                  <FiSearch className="search-panel-icon" />
                  <input
                    type="text"
                    placeholder={searchPlaceholders[searchType]}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="search-panel-submit">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMobileMenu(false);
              }
            }}
          >
            <div className="mobile-menu-content">
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, color: '#111827' }}>Menu</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  aria-label="Close menu"
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    minHeight: '32px',
                    minWidth: '32px',
                    flexShrink: 0,
                    marginRight: '35px',
                  }}
                >
                  <FiX size={18} />
                </button>
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
                    <span className="mega-menu-category-icon">{getCategoryIcon(category.name)}</span> {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <MobileBottomNav />
    </>
  );
}
