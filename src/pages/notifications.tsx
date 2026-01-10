import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiX,
  FiTrash2,
  FiPackage,
  FiTruck,
  FiDollarSign,
  FiShoppingCart,
  FiAlertCircle,
  FiFilter,
} from 'react-icons/fi';

const NotificationsPage = () => {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isNotificationEnabled,
    enableNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <FiShoppingCart className="text-blue-500" size={24} />;
      case 'order_approved':
        return <FiCheckCircle className="text-green-500" size={24} />;
      case 'order_rejected':
        return <FiX className="text-red-500" size={24} />;
      case 'order_confirmed':
        return <FiPackage className="text-purple-500" size={24} />;
      case 'order_shipped':
        return <FiTruck className="text-blue-500" size={24} />;
      case 'order_delivered':
        return <FiCheckCircle className="text-green-500" size={24} />;
      case 'price_update':
        return <FiDollarSign className="text-yellow-500" size={24} />;
      case 'stock_update':
        return <FiPackage className="text-orange-500" size={24} />;
      default:
        return <FiAlertCircle className="text-gray-500" size={24} />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      order_placed: 'Order Placed',
      order_approved: 'Order Approved',
      order_rejected: 'Order Rejected',
      order_confirmed: 'Order Confirmed',
      order_shipped: 'Order Shipped',
      order_delivered: 'Order Delivered',
      price_update: 'Price Update',
      stock_update: 'Stock Update',
      general: 'General',
    };
    return labels[type] || 'Notification';
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification._id);
    if (notification.orderId) {
      router.push(`/orders`); // Route to orders page where users can view order details
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  // Get unique notification types
  const notificationTypes = Array.from(new Set(notifications.map((n) => n.type)));

  return (
    <>
      <SEO title="Notifications - BuildAdda" description="View all your order notifications" />
      <Header />

      <div className="notifications-page">
        <div className="container">
          <div className="notifications-content">
            {/* Header */}
            <div className="notifications-header">
              <div>
                <h1 className="notifications-title">
                  <FiBell />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge-new">{unreadCount} new</span>
                  )}
                </h1>
                <p className="notifications-subtitle">
                  Stay updated with your order notifications
                </p>
              </div>
              <div className="header-actions">
                {unreadCount > 0 && (
                  <button className="btn btn-secondary" onClick={markAllAsRead}>
                    <FiCheck /> Mark All Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button className="btn btn-secondary" onClick={clearAllNotifications}>
                    <FiTrash2 /> Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Enable Notifications Banner */}
            {!isNotificationEnabled && (
              <div className="enable-notifications-banner">
                <div className="banner-icon">
                  <FiBell size={24} />
                </div>
                <div className="banner-content">
                  <h3>Enable Push Notifications</h3>
                  <p>
                    Get instant alerts for order updates and important events with sound notifications
                  </p>
                  <button className="btn btn-primary" onClick={enableNotifications}>
                    Enable Notifications
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filters-card">
              <div className="filter-label">
                <FiFilter />
                <span>Filter:</span>
              </div>

              {/* Status Filter */}
              <div className="status-filters">
                {(['all', 'unread', 'read'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`filter-btn ${filter === status ? 'active' : ''}`}
                  >
                    {status === 'all' && 'All'}
                    {status === 'unread' && `Unread (${unreadCount})`}
                    {status === 'read' && `Read (${notifications.length - unreadCount})`}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <div className="type-filter">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {getNotificationTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <FiBell size={80} />
                <h3>No notifications</h3>
                <p>
                  {filter === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : typeFilter !== 'all'
                    ? `No ${getNotificationTypeLabel(typeFilter).toLowerCase()} notifications found.`
                    : 'You have no notifications yet.'}
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-card ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="notification-content">
                      <div className="notification-header">
                        <div>
                          <div className="title-row">
                            <h3>{notification.title}</h3>
                            {!notification.read && <div className="unread-dot" />}
                          </div>
                          <span className="notification-type">
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="delete-btn"
                          title="Delete notification"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      <p className="notification-message">{notification.message}</p>

                      {notification.orderNumber && (
                        <p className="order-number">Order #{notification.orderNumber}</p>
                      )}

                      <div className="notification-footer">
                        <div className="time-info">
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="full-date">
                            {format(new Date(notification.createdAt), 'MMM dd, yyyy \'at\' hh:mm a')}
                          </span>
                        </div>
                        {!notification.read && (
                          <button
                            className="btn btn-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .notifications-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: 2rem 0;
        }

        .notifications-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .notifications-title {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .badge-new {
          display: inline-block;
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .notifications-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .enable-notifications-banner {
          background: linear-gradient(to right, #eff6ff, #faf5ff);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        :global([data-theme='dark']) .enable-notifications-banner {
          background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
        }

        .banner-icon {
          width: 48px;
          height: 48px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .banner-content h3 {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .banner-content p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .filters-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .status-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: var(--bg-tertiary);
        }

        .filter-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-primary);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .no-notifications {
          text-align: center;
          padding: 5rem 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
        }

        .no-notifications svg {
          color: var(--text-secondary);
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        .no-notifications h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .no-notifications p {
          color: var(--text-secondary);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-card {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .notification-card.unread {
          border-left: 4px solid #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .notification-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-card.unread .notification-icon {
          background: rgba(59, 130, 246, 0.1);
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .notification-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .notification-card.unread h3 {
          color: var(--text-primary);
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .notification-type {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .delete-btn {
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }

        .delete-btn:hover {
          color: #ef4444;
        }

        .notification-message {
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        .order-number {
          color: var(--primary-color);
          font-weight: 500;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .notification-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .full-date {
          font-size: 0.75rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        .btn-small {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .notifications-header {
            flex-direction: column;
          }

          .filters-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-filters {
            width: 100%;
          }

          .type-filter {
            width: 100%;
          }

          .filter-select {
            width: 100%;
          }

          .notification-card {
            flex-direction: column;
          }

          .time-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </>
  );
};

export default NotificationsPage;
