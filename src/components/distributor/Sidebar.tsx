import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { FiHome, FiPackage, FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon, FiBarChart2, FiCreditCard, FiX, FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SidebarProps {
  onLogout: () => void;
  /** Whether the sidebar drawer is open (mobile only) */
  isOpen?: boolean;
  /** Callback to close the sidebar (mobile only) */
  onClose?: () => void;
  /** Whether we're on mobile */
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

  // Handle swipe to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    // If swiped left more than 50px, close the drawer
    if (diff > 50 && onClose) {
      onClose();
    }
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
  }, [currentPath]);

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

  // Mobile Drawer
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            ref={sidebarRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="mobile-sidebar"
          >
            {/* Header with close button */}
            <div className="mobile-sidebar-header">
              <h2>Distributor Panel</h2>
              <button onClick={onClose} className="close-btn" aria-label="Close menu">
                <FiX />
              </button>
            </div>

            {/* Navigation */}
            <nav className="mobile-sidebar-nav">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.path}
                      className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Icon className="nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mobile-sidebar-footer">
              <button onClick={toggleTheme} className="mobile-footer-btn">
                {theme === 'light' ? (
                  <>
                    <FiMoon className="icon" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <FiSun className="icon" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>

              <button onClick={onLogout} className="mobile-footer-btn logout">
                <FiLogOut className="icon" />
                <span>Logout</span>
              </button>
            </div>

            <style jsx>{`
              .mobile-sidebar {
                position: fixed;
                left: 0;
                top: 0;
                bottom: 0;
                width: 280px;
                max-width: calc(100vw - 60px);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                flex-direction: column;
                z-index: 50;
                padding-top: env(safe-area-inset-top, 0px);
                padding-bottom: env(safe-area-inset-bottom, 0px);
                overflow-y: auto;
                overscroll-behavior: contain;
              }

              .mobile-sidebar-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              }

              .mobile-sidebar-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
              }

              .close-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 10px;
                color: white;
                cursor: pointer;
                transition: background 0.2s;
              }

              .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
              }

              .close-btn :global(svg) {
                width: 20px;
                height: 20px;
              }

              .mobile-sidebar-nav {
                flex: 1;
                padding: 16px 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
              }

              .mobile-sidebar-nav :global(.mobile-nav-item) {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 20px;
                color: rgba(255, 255, 255, 0.85);
                text-decoration: none;
                font-size: 15px;
                transition: all 0.2s;
                border-left: 3px solid transparent;
              }

              .mobile-sidebar-nav :global(.mobile-nav-item:active) {
                background: rgba(255, 255, 255, 0.15);
              }

              .mobile-sidebar-nav :global(.mobile-nav-item.active) {
                background: rgba(255, 255, 255, 0.15);
                color: white;
                border-left-color: white;
                font-weight: 600;
              }

              .mobile-sidebar-nav :global(.nav-icon) {
                width: 22px;
                height: 22px;
                flex-shrink: 0;
              }

              .mobile-sidebar-footer {
                padding: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                flex-direction: column;
                gap: 10px;
              }

              .mobile-footer-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 14px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
              }

              .mobile-footer-btn:active {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(0.98);
              }

              .mobile-footer-btn :global(.icon) {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
              }

              .mobile-footer-btn.logout {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
            `}</style>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
