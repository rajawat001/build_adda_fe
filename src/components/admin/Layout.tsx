import { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import SEO from '../SEO';
import { NotificationBell } from '../NotificationBell';
import GoogleTranslate from '../GoogleTranslate';
import Link from 'next/link';
import { FiUser, FiSearch, FiUsers, FiShoppingCart, FiTruck, FiPackage } from 'react-icons/fi';
import api from '../../services/api';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

interface SearchResults {
  users: any[];
  distributors: any[];
  orders: any[];
  products: any[];
}

const AdminLayout = ({ children, title = 'Admin Panel' }: LayoutProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({ users: [], distributors: [], orders: [], products: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const checkAuth = () => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSearchResults({ users: [], distributors: [], orders: [], products: [] });
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setShowDropdown(true);
        const res = await api.get(`/admin/search?q=${encodeURIComponent(value.trim())}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleResultClick = (section: string) => {
    const query = searchQuery.trim();
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults({ users: [], distributors: [], orders: [], products: [] });
    router.push(`/admin/${section}?search=${encodeURIComponent(query)}`);
  };

  const hasResults = searchResults.users.length > 0 || searchResults.distributors.length > 0 || searchResults.orders.length > 0 || searchResults.products.length > 0;

  return (
    <>
      <SEO title={title} description="Admin management panel" />

      <div className="admin-layout">
        <Sidebar onLogout={handleLogout} />

        <main className="admin-main">
          {/* Header Bar */}
          <div className="header-bar">
            <div className="header-content">
              <h1 className="page-title">{title}</h1>
              <div className="header-actions">
                <div className="search-wrapper" ref={searchContainerRef}>
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search users, orders, products..."
                    className="global-search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchQuery.trim() && hasResults) setShowDropdown(true); }}
                    onKeyDown={handleKeyDown}
                  />
                  {showDropdown && (
                    <div className="search-dropdown">
                      {searchLoading ? (
                        <div className="search-loading">Searching...</div>
                      ) : !hasResults ? (
                        <div className="search-no-results">No results found</div>
                      ) : (
                        <>
                          {searchResults.users.length > 0 && (
                            <div className="search-category">
                              <div className="search-category-header">
                                <span><FiUsers size={14} /> Users</span>
                                <button onClick={() => handleResultClick('users')}>View all</button>
                              </div>
                              {searchResults.users.map((user: any) => (
                                <div key={user._id} className="search-result-item" onClick={() => handleResultClick('users')}>
                                  <div className="search-result-primary">{user.name}</div>
                                  <div className="search-result-secondary">{user.email}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {searchResults.orders.length > 0 && (
                            <div className="search-category">
                              <div className="search-category-header">
                                <span><FiShoppingCart size={14} /> Orders</span>
                                <button onClick={() => handleResultClick('orders')}>View all</button>
                              </div>
                              {searchResults.orders.map((order: any) => (
                                <div key={order._id} className="search-result-item" onClick={() => handleResultClick('orders')}>
                                  <div className="search-result-primary">#{order.orderNumber}</div>
                                  <div className="search-result-secondary">
                                    {order.user?.name || 'Guest'} &middot; &#8377;{order.totalAmount?.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {searchResults.distributors.length > 0 && (
                            <div className="search-category">
                              <div className="search-category-header">
                                <span><FiTruck size={14} /> Distributors</span>
                                <button onClick={() => handleResultClick('distributors')}>View all</button>
                              </div>
                              {searchResults.distributors.map((dist: any) => (
                                <div key={dist._id} className="search-result-item" onClick={() => handleResultClick('distributors')}>
                                  <div className="search-result-primary">{dist.businessName}</div>
                                  <div className="search-result-secondary">{dist.email}{dist.city ? ` \u00b7 ${dist.city}` : ''}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {searchResults.products.length > 0 && (
                            <div className="search-category">
                              <div className="search-category-header">
                                <span><FiPackage size={14} /> Products</span>
                                <button onClick={() => handleResultClick('products')}>View all</button>
                              </div>
                              {searchResults.products.map((product: any) => (
                                <div key={product._id} className="search-result-item" onClick={() => handleResultClick('products')}>
                                  <div className="search-result-primary">{product.name}</div>
                                  <div className="search-result-secondary">
                                    &#8377;{product.price?.toLocaleString('en-IN')}{product.brand ? ` \u00b7 ${product.brand}` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <GoogleTranslate />
                <NotificationBell />
                <Link href="/admin/settings" className="user-avatar">
                  <FiUser className="avatar-icon" />
                </Link>
              </div>
            </div>
          </div>

          <div className="main-content">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary, #f5f7fa);
        }

        .admin-main {
          flex: 1;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          margin-left: 260px;
          min-height: 100vh;
        }

        .header-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: #ffffff;
          border-bottom: 1px solid var(--border-primary, #e5e7eb);
          backdrop-filter: blur(10px);
        }

        :global([data-theme='dark']) .header-bar {
          background: #1e293b;
          border-bottom-color: #334155;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #1a202c);
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-wrapper {
          position: relative;
          display: none;
        }

        @media (min-width: 768px) {
          .search-wrapper {
            display: block;
          }
        }

        .search-wrapper :global(.search-icon) {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
          z-index: 1;
        }

        .global-search {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
          width: 250px;
          transition: all 0.2s;
        }

        .global-search:focus {
          outline: none;
          border-color: var(--primary-color, #667eea);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          width: 300px;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 380px;
          max-height: 480px;
          overflow-y: auto;
          background: #ffffff;
          border: 1px solid var(--border-primary, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          z-index: 50;
        }

        :global([data-theme='dark']) .search-dropdown {
          background: #1e293b;
          border-color: #334155;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .search-loading,
        .search-no-results {
          padding: 1.5rem;
          text-align: center;
          color: var(--text-secondary, #6b7280);
          font-size: 0.875rem;
        }

        .search-category {
          border-bottom: 1px solid var(--border-primary, #e5e7eb);
        }

        :global([data-theme='dark']) .search-category {
          border-bottom-color: #334155;
        }

        .search-category:last-child {
          border-bottom: none;
        }

        .search-category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--bg-secondary, #f9fafb);
        }

        :global([data-theme='dark']) .search-category-header {
          background: #0f172a;
          color: #94a3b8;
        }

        .search-category-header span {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .search-category-header button {
          background: none;
          border: none;
          color: var(--primary-color, #667eea);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }

        .search-category-header button:hover {
          text-decoration: underline;
        }

        .search-result-item {
          padding: 0.625rem 1rem;
          cursor: pointer;
          transition: background 0.15s;
        }

        .search-result-item:hover {
          background: var(--bg-secondary, #f3f4f6);
        }

        :global([data-theme='dark']) .search-result-item:hover {
          background: #334155;
        }

        .search-result-primary {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary, #1a202c);
          margin-bottom: 2px;
        }

        :global([data-theme='dark']) .search-result-primary {
          color: #e2e8f0;
        }

        .search-result-secondary {
          font-size: 0.75rem;
          color: var(--text-secondary, #6b7280);
        }

        :global([data-theme='dark']) .search-result-secondary {
          color: #94a3b8;
        }

        :global(.user-avatar) {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
          text-decoration: none;
          flex-shrink: 0;
        }

        :global(.user-avatar:hover) {
          transform: scale(1.05);
        }

        :global(.avatar-icon) {
          width: 20px;
          height: 20px;
        }

        .main-content {
          flex: 1;
          padding: 30px 40px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .admin-main {
            margin-left: 80px;
          }

          .header-content {
            padding: 1rem;
          }

          .page-title {
            font-size: 1.25rem;
          }

          .main-content {
            padding: 20px 15px;
          }

          :global(.user-avatar) {
            width: 35px;
            height: 35px;
          }

          .global-search {
            width: 150px;
          }

          .global-search:focus {
            width: 200px;
          }
        }

        :global(body) {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
      `}</style>
    </>
  );
};

export default AdminLayout;
