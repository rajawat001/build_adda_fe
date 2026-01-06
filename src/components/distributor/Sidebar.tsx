import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../contexts/ThemeContext';
import { FiHome, FiPackage, FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const currentPath = router.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  const menuItems = [
    { path: '/distributor/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/distributor/products', icon: FiPackage, label: 'Products' },
    { path: '/distributor/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/distributor/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/distributor/profile', icon: FiUser, label: 'Profile' },
  ];

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
        {/* Dark Mode Toggle */}
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

        {/* Logout Button */}
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

        @media (max-width: 768px) {
          .distributor-sidebar {
            width: 80px;
          }

          .sidebar-header h2 {
            font-size: 12px;
            text-align: center;
            word-break: break-word;
          }

          .sidebar-nav :global(.nav-label) {
            display: none;
          }

          .sidebar-nav :global(.nav-item) {
            justify-content: center;
            padding: 14px 10px;
          }

          .sidebar-nav :global(.nav-icon) {
            margin-right: 0;
          }

          .btn-theme-toggle :global(.label),
          .btn-logout :global(.label) {
            display: none;
          }

          .btn-theme-toggle,
          .btn-logout {
            justify-content: center;
            padding: 12px;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
