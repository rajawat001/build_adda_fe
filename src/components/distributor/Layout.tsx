import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import SEO from '../SEO';
import { NotificationBell } from '../NotificationBell';
import GoogleTranslate from '../GoogleTranslate';
import Link from 'next/link';
import { FiUser, FiMenu, FiBell } from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import api from '../../services/api';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const MobileNotificationBell = () => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => router.push('/distributor/notifications')}
      aria-label="Notifications"
      style={{
        position: 'relative',
        padding: '8px',
        borderRadius: '8px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1a202c',
      }}
    >
      <FiBell style={{ width: '22px', height: '22px' }} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '0',
          right: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '18px',
          height: '18px',
          padding: '0 4px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'white',
          backgroundColor: '#ef4444',
          borderRadius: '9999px',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

const DistributorLayout = ({ children, title = 'Distributor Panel' }: LayoutProps) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isWalletLocked, setIsWalletLocked] = useState(false);
  const [planType, setPlanType] = useState<string>('none');

  useEffect(() => {
    checkAuth();
    checkSubscriptionStatus();
  }, []);

  // Close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const checkAuth = () => {
    const role = localStorage.getItem('role');
    if (role !== 'distributor') {
      router.push('/login');
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      // Get profile to check approval status and plan type
      const profileRes = await api.get('/auth/profile');
      const user = profileRes.data.user;
      const isUserApproved = user?.isApproved || false;
      const userPlanType = user?.planType || 'none';
      const userWalletLocked = user?.isWalletLocked || false;

      setIsApproved(isUserApproved);
      setPlanType(userPlanType);
      setIsWalletLocked(userWalletLocked);

      // Commission plan distributors: approved via plan selection, no subscription needed
      if (userPlanType === 'commission' && isUserApproved) {
        setHasActiveSubscription(true); // treat as "has active plan" for layout purposes
        setCheckingSubscription(false);
        return;
      }

      // Get subscription status for subscription-plan distributors
      let hasActive = false;
      try {
        const subRes = await api.get('/subscriptions/my-subscription');
        const subscription = subRes.data.subscription;
        hasActive = subscription && subscription.status === 'active';
      } catch (subError: any) {
        if (subError.response?.status !== 404) {
          console.error('Error fetching subscription:', subError);
        }
      }
      setHasActiveSubscription(hasActive);

      // Redirect logic for non-approved/no-plan distributors
      const currentPath = router.pathname;
      const allowedPaths = ['/distributor/subscription', '/distributor/plan-selection', '/distributor/wallet', '/distributor/commission-payment'];
      const isOnAllowedPath = allowedPaths.some(p => currentPath.startsWith(p));

      if (!isUserApproved && !isOnAllowedPath) {
        // Not approved: go to plan selection
        router.push('/distributor/plan-selection');
      } else if (isUserApproved && userPlanType === 'none' && !isOnAllowedPath) {
        // Approved but no plan selected: go to plan selection
        router.push('/distributor/plan-selection');
      }
      // Note: approved distributors with expired/missing subscriptions can still
      // access the dashboard — a renewal banner is shown instead of blocking access
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      // Only redirect on auth failure (401), not on transient network errors
      if (error.response?.status === 401) {
        router.push('/login');
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

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

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

  return (
    <>
      <SEO title={title} description="Distributor management panel" />

      <div className="distributor-layout">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar onLogout={handleLogout} isMobile={false} />}

        {/* Mobile Sidebar Drawer */}
        {isMobile && (
          <Sidebar
            onLogout={handleLogout}
            isMobile={true}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
        )}

        <main className="distributor-main">
          {/* Header Bar */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
              maxWidth: '1400px',
              margin: '0 auto',
              gap: '0.75rem',
            }}>
              {/* Hamburger Menu - Mobile Only */}
              {isMobile && (
                <button
                  onClick={openSidebar}
                  aria-label="Open menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#1a202c',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <FiMenu style={{ width: '24px', height: '24px' }} />
                </button>
              )}

              <h1 style={{
                fontSize: isMobile ? '1.125rem' : '1.5rem',
                fontWeight: 700,
                color: '#1a202c',
                margin: 0,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: isMobile ? 'center' : 'left',
              }}>{title}</h1>

              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '0.75rem',
                flexShrink: 0,
              }}>
                <GoogleTranslate />
                {isMobile ? (
                  <MobileNotificationBell />
                ) : (
                  <NotificationBell />
                )}
                <Link href="/distributor/profile" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}>
                  <FiUser style={{ width: '20px', height: '20px' }} />
                </Link>
              </div>
            </div>
          </div>

          <div className="main-content">
            {isWalletLocked && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '0.875rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '1.25rem' }}>&#128274;</span>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>Account Locked</div>
                  <div style={{ color: '#b91c1c', fontSize: '0.813rem' }}>Your account is locked due to unpaid commission. Clear your dues to continue.</div>
                </div>
                <button
                  onClick={() => router.push('/distributor/commission-payment')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.813rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Pay Now
                </button>
              </div>
            )}
            {isApproved && planType === 'subscription' && !hasActiveSubscription && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '0.875rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '1.25rem' }}>&#9888;&#65039;</span>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.875rem' }}>Subscription Expired</div>
                  <div style={{ color: '#a16207', fontSize: '0.813rem' }}>Your subscription has expired. Renew now to continue receiving orders.</div>
                </div>
                <button
                  onClick={() => router.push('/distributor/subscription')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.813rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Renew Now
                </button>
              </div>
            )}
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
          min-width: 0;
          margin-left: 260px;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          padding: 30px 40px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .distributor-main {
            margin-left: 0;
          }

          .main-content {
            padding: 1rem;
          }
        }

        @media (max-width: 375px) {
          .main-content {
            padding: 0.875rem;
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
