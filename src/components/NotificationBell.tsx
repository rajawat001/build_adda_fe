import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
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
} from 'react-icons/fi';

export const NotificationBell: React.FC = () => {
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

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return <FiShoppingCart className="text-blue-500" />;
      case 'order_approved':
        return <FiCheckCircle className="text-green-500" />;
      case 'order_rejected':
        return <FiX className="text-red-500" />;
      case 'order_confirmed':
        return <FiPackage className="text-purple-500" />;
      case 'order_shipped':
        return <FiTruck className="text-blue-500" />;
      case 'order_delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'price_update':
        return <FiDollarSign className="text-yellow-500" />;
      case 'stock_update':
        return <FiPackage className="text-orange-500" />;
      default:
        return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification._id);
    if (notification.orderId) {
      router.push(`/distributor/order-details/${notification.orderId}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6 text-[var(--text-primary)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-primary)] z-50 overflow-hidden"
          style={{ animation: 'fadeIn 0.2s ease-in-out' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FiBell />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-white/30 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors flex items-center gap-1"
                      title="Mark all as read"
                    >
                      <FiCheck className="w-3 h-3" />
                      Mark all
                    </button>
                  )}
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors flex items-center gap-1"
                    title="Clear all"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enable Notifications Prompt */}
          {!isNotificationEnabled && (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-[var(--border-primary)]">
              <div className="flex items-start gap-3">
                <FiBell className="text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    Enable Notifications
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">
                    Get instant alerts for order updates
                  </p>
                  <button
                    onClick={enableNotifications}
                    className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Enable Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <FiBell className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3 opacity-50" />
                <p className="text-[var(--text-secondary)] text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-primary)]">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 transition-all cursor-pointer hover:bg-[var(--bg-secondary)] ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.read
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : 'bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className={`text-sm font-semibold ${
                              !notification.read
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[var(--text-secondary)]">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification._id);
                            }}
                            className="text-[var(--text-secondary)] hover:text-red-500 transition-colors p-1"
                            title="Delete"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] text-center">
              <button
                onClick={() => {
                  router.push('/distributor/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-[var(--primary-color)] hover:underline font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
