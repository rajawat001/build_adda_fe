import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { FiHome, FiPackage, FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon, FiBarChart2, FiCreditCard, FiX, FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SidebarProps {
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar = ({ onLogout, isOpen = false, onClose, isMobile = false }: SidebarProps) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const currentPath = router.pathname;
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef(0);

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  const menuItems = [
    { path: '/distributor/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/distributor/products', icon: FiPackage, label: 'Products' },
    { path: '/distributor/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/distributor/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/distributor/subscription', icon: FiCreditCard, label: 'Subscription' },
    { path: '/distributor/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/distributor/profile', icon: FiUser, label: 'Profile' },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50 && onClose) {
      onClose();
    }
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && onClose) {
      const handleRouteChange = () => {
        onClose();
      };
      
      router.events.on('routeChangeStart', handleRouteChange);
      return () => {
        router.events.off('routeChangeStart', handleRouteChange);
      };
    }
  }, [isMobile, onClose, router.events]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobile, isOpen]);

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <aside className="distributor-sidebar">
        <div className="sidebar-header">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Distributor Panel
          </motion.h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleTheme} className="btn-theme-toggle">
            {theme === 'light' ? (
              <>
                <FiMoon className="icon" />
                <span className="label">Dark Mode</span>
              </>
            ) : (
              <>
                <FiSun className="icon" />
                <span className="label">Light Mode</span>
              </>
            )}
          </button>

          <button onClick={onLogout} className="btn-logout">
            <FiLogOut className="icon" />
            <span className="label">Logout</span>
          </button>
        </div>

        <style jsx>{`
          .distributor-sidebar {
            width: 260px;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            z-index: 100;
            flex-shrink: 0;
          }

          .sidebar-header {
            padding: 30px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .sidebar-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .sidebar-nav {
            flex: 1;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .sidebar-nav :global(.nav-item) {
            display: flex;
            align-items: center;
            padding: 14px 25px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border-left: 3px solid transparent;
            white-space: nowrap;
          }

          .sidebar-nav :global(.nav-item:hover) {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-left-color: white;
          }

          .sidebar-nav :global(.nav-item.active) {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border-left-color: white;
            font-weight: 600;
          }

          .sidebar-nav :global(.nav-icon) {
            font-size: 20px;
            margin-right: 15px;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
          }

          .sidebar-nav :global(.nav-label) {
            font-size: 15px;
            line-height: 1;
          }

          .sidebar-footer {
            padding: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .btn-theme-toggle,
          .btn-logout {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            gap: 12px;
          }

          .btn-theme-toggle :global(.icon),
          .btn-logout :global(.icon) {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }

          .btn-theme-toggle :global(.label),
          .btn-logout :global(.label) {
            flex: 1;
            text-align: left;
          }

          .btn-theme-toggle:hover,
          .btn-logout:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }
        `}</style>
      </aside>
    );
  }

  return (
    <>
      {/* Backdrop - Always render when open, no AnimatePresence wrapper */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9998,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Drawer - Always render when open */}
      {isOpen && (
        <aside
          ref={sidebarRef}
          className="mobile-sidebar"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            maxWidth: 'calc(100vw - 60px)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.5)',
            transform: 'translateX(0)',
            transition: 'transform 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: 'white',
            }}>
              Distributor Panel
            </h2>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              aria-label="Close menu"
            >
              <FiX />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{
            flex: 1,
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isMobile) {
                      onClose?.();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 20px',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '15px',
                    transition: 'all 0.2s',
                    borderLeft: active ? '3px solid white' : '3px solid transparent',
                    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <Icon style={{ width: '22px', height: '22px', flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {theme === 'light' ? (
                <>
                  <FiMoon style={{ width: '20px', height: '20px' }} />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <FiSun style={{ width: '20px', height: '20px' }} />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <FiLogOut style={{ width: '20px', height: '20px' }} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;