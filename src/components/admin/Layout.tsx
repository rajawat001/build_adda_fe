import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import SEO from '../SEO';
import { NotificationBell } from '../NotificationBell';
import Link from 'next/link';
import { FiUser, FiSearch } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title = 'Admin Panel' }: LayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
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
                <div className="search-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="global-search"
                  />
                </div>
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
