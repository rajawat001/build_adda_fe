import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  const menuItems = [
    { path: '/distributor/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/distributor/products', icon: '📦', label: 'Products' },
    { path: '/distributor/orders', icon: '🛒', label: 'Orders' },
    { path: '/distributor/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <aside className="distributor-sidebar">
      <div className="sidebar-header">
        <h2>Distributor Panel</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-logout">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
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
        }

        .nav-item {
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

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-left-color: white;
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-left-color: white;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 20px;
          margin-right: 15px;
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 15px;
          line-height: 1;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: auto;
        }

        .btn-logout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .btn-logout .nav-icon {
          margin-right: 15px;
        }

        .btn-logout:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .distributor-sidebar {
            width: 80px;
          }

          .sidebar-header h2 {
            font-size: 16px;
            text-align: center;
          }

          .nav-label {
            display: none;
          }

          .nav-item {
            justify-content: center;
            padding: 14px 10px;
          }

          .nav-icon {
            margin-right: 0;
          }

          .btn-logout .nav-label {
            display: none;
          }

          .btn-logout .nav-icon {
            margin-right: 0;
          }

          .btn-logout {
            justify-content: center;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
