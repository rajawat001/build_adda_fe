import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import SEO from '../SEO';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const DistributorLayout = ({ children, title = 'Distributor Panel' }: LayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const role = localStorage.getItem('role');
    if (role !== 'distributor') {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <>
      <SEO title={title} description="Distributor management panel" />

      <div className="distributor-layout">
        <Sidebar onLogout={handleLogout} />

        <main className="distributor-main">
          <div className="main-content">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .distributor-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }

        .distributor-main {
          flex: 1;
          overflow-x: hidden;
        }

        .main-content {
          padding: 30px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 20px 15px;
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

export default DistributorLayout;
