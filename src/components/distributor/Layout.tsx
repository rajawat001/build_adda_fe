import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import SEO from '../SEO';
import { NotificationBell } from '../NotificationBell';
import { FiUser, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const DistributorLayout = ({ children, title = 'Distributor Panel' }: LayoutProps) => {
  const router = useRouter();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    checkAuth();
    checkSubscriptionStatus();
  }, []);

  const checkAuth = () => {
    const role = localStorage.getItem('role');
    if (role !== 'distributor') {
      router.push('/login');
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      // Get profile to check approval status
      const profileRes = await api.get('/auth/profile');
      const isUserApproved = profileRes.data.user?.isApproved || false;
      setIsApproved(isUserApproved);

      // Get subscription status
      let hasActive = false;
      try {
        const subRes = await api.get('/subscriptions/my-subscription');
        const subscription = subRes.data.subscription;
        hasActive = subscription && subscription.status === 'active';
      } catch (subError: any) {
        // 404 means no active subscription, which is fine
        if (subError.response?.status !== 404) {
          console.error('Error fetching subscription:', subError);
        }
      }
      setHasActiveSubscription(hasActive);

      // If not approved or no active subscription, and not on subscription page, redirect
      const currentPath = router.pathname;
      if ((!isUserApproved || !hasActive) && currentPath !== '/distributor/subscription') {
        router.push('/distributor/subscription');
      }
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      // Only redirect if it's not an authorization error for non-approved distributor
      // (they should be allowed to access the subscription page)
      if (router.pathname !== '/distributor/subscription') {
        router.push('/distributor/subscription');
      }
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Show loading while checking subscription
  if (checkingSubscription) {
    return (
      <>
        <SEO title={title} description="Distributor management panel" />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary, #f5f7fa)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  // Check if on subscription page - allow access regardless of subscription status
  const isSubscriptionPage = router.pathname === '/distributor/subscription';

  // If not on subscription page and no active subscription, this will redirect via useEffect
  // But we still render the layout for the subscription page

  return (
    <>
      <SEO title={title} description="Distributor management panel" />

      <div className="distributor-layout">
        <Sidebar onLogout={handleLogout} />

        <main className="distributor-main">
          {/* Header Bar */}
          <div className="header-bar">
            <div className="header-content">
              <h1 className="page-title">{title}</h1>
              <div className="header-actions">
                <NotificationBell />
                <div className="user-avatar">
                  <FiUser className="avatar-icon" />
                </div>
              </div>
            </div>
          </div>

          <div className="main-content">
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        .distributor-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary, #f5f7fa);
        }

        .distributor-main {
          flex: 1;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .header-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: var(--bg-card, #ffffff);
          border-bottom: 1px solid var(--border-primary, #e5e7eb);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }

        :global([data-theme='dark']) .header-bar {
          background: rgba(26, 32, 44, 0.95);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
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

        .user-avatar {
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
        }

        .user-avatar:hover {
          transform: scale(1.05);
        }

        :global(.avatar-icon) {
          width: 20px;
          height: 20px;
        }

        .main-content {
          flex: 1;
          padding: 30px 40px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
          }

          .page-title {
            font-size: 1.25rem;
          }

          .main-content {
            padding: 20px 15px;
          }

          .user-avatar {
            width: 35px;
            height: 35px;
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
