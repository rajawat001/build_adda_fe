import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiFolder,
  FiTag,
  FiShield,
  FiMail,
  FiMessageSquare,
  FiStar,
  FiActivity,
  FiSettings,
  FiLogOut,
  FiTruck,
  FiCreditCard,
  FiUserCheck
} from 'react-icons/fi';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const allMenuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard', permission: null },
    { icon: FiUsers, label: 'Users', path: '/admin/users', permission: 'users.view' },
    { icon: FiTruck, label: 'Distributors', path: '/admin/distributors', permission: 'distributors.view' },
    { icon: FiPackage, label: 'Products', path: '/admin/products', permission: 'products.view' },
    { icon: FiShoppingCart, label: 'Orders', path: '/admin/orders', permission: 'orders.view' },
    { icon: FiFolder, label: 'Categories', path: '/admin/categories', permission: 'categories.view' },
    { icon: FiTag, label: 'Coupons', path: '/admin/coupons', permission: 'coupons.view' },
    { icon: FiCreditCard, label: 'Subscriptions', path: '/admin/subscription-plans', permission: 'subscriptions.view' },
    { icon: FiShield, label: 'Roles', path: '/admin/roles', permission: 'roles.view' },
    { icon: FiUserCheck, label: 'Admin Users', path: '/admin/admin-users', permission: 'roles.view' },
    { icon: FiMail, label: 'Email Templates', path: '/admin/email-templates', permission: 'emailTemplates.view' },
    { icon: FiStar, label: 'Reviews', path: '/admin/reviews', permission: 'reviews.view' },
    { icon: FiMessageSquare, label: 'Messages', path: '/admin/contacts', permission: 'contacts.view' },
    { icon: FiActivity, label: 'Activity Logs', path: '/admin/activity-logs', permission: 'activityLogs.view' },
    { icon: FiSettings, label: 'Settings', path: '/admin/settings', permission: 'settings.view' },
  ];

  const menuItems = allMenuItems.filter(item =>
    item.permission === null || hasPermission(item.permission)
  );

  const isActive = (path: string) => router.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/admin/dashboard" className="logo-link">
          <h2 className="logo">BuildAdda</h2>
          <span className="logo-subtitle">Admin</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <FiLogOut className="logout-icon" />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-link {
          text-decoration: none;
          color: white;
          display: block;
        }

        .logo {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .logo-subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          display: block;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .sidebar-nav :global(.nav-item) {
          display: flex;
          align-items: center;
          padding: 0.875rem 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
          border-left: 3px solid transparent;
        }

        .sidebar-nav :global(.nav-item:hover) {
          background: rgba(255, 255, 255, 0.1);
          border-left-color: white;
        }

        .sidebar-nav :global(.nav-item.active) {
          background: rgba(255, 255, 255, 0.15);
          border-left-color: white;
          color: white;
          font-weight: 600;
        }

        .sidebar-nav :global(.nav-icon) {
          width: 20px;
          height: 20px;
          margin-right: 0.875rem;
          flex-shrink: 0;
        }

        .sidebar-nav :global(.nav-label) {
          font-size: 0.938rem;
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.938rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .logout-btn :global(.logout-icon) {
          width: 18px;
          height: 18px;
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 80px;
          }

          .sidebar-header {
            padding: 1.5rem 1rem;
          }

          .logo {
            font-size: 1.25rem;
            text-align: center;
          }

          .logo-subtitle {
            display: none;
          }

          .sidebar-nav :global(.nav-item) {
            padding: 0.875rem;
            justify-content: center;
          }

          .sidebar-nav :global(.nav-icon) {
            margin-right: 0;
          }

          .sidebar-nav :global(.nav-label) {
            display: none;
          }

          .logout-btn span {
            display: none;
          }

          .logout-btn {
            padding: 0.75rem;
            justify-content: center;
          }

          .logout-btn :global(.logout-icon) {
            margin-right: 0;
          }
        }

        /* Scrollbar styling */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
