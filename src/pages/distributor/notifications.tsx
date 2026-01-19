import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DistributorLayout from '../../components/distributor/Layout';
import { Card, Button, Badge } from '../../components/ui';
import { useNotifications } from '../../contexts/NotificationContext';
import { useIsMobile } from '../../hooks';
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
  const isMobile = useIsMobile();
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
      router.push(`/distributor/order-details/${notification.orderId}`);
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
    <DistributorLayout title="Notifications">
      <div className={`space-y-4 md:space-y-6 ${isMobile ? '' : 'p-6'}`}>
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FiBell className={`text-purple-500 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge variant="error" size={isMobile ? 'sm' : 'md'}>
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
          {!isMobile && (
            <p className="text-[var(--text-secondary)]">
              Stay updated with order and system notifications
            </p>
          )}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                leftIcon={<FiCheck />}
                onClick={markAllAsRead}
                className={isMobile ? 'flex-1 min-h-tap text-sm' : ''}
              >
                {isMobile ? 'Read All' : 'Mark All Read'}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="secondary"
                leftIcon={<FiTrash2 />}
                onClick={clearAllNotifications}
                className={isMobile ? 'flex-1 min-h-tap text-sm' : ''}
              >
                {isMobile ? 'Clear' : 'Clear All'}
              </Button>
            )}
          </div>
        </div>

        {/* Enable Notifications Banner */}
        {!isNotificationEnabled && (
          <Card className={isMobile ? 'p-0' : ''}>
            <div className={`flex ${isMobile ? 'flex-col p-4' : 'items-center p-4'} gap-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg`}>
              <div className="flex items-center gap-3">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <FiBell className="text-white" size={isMobile ? 18 : 24} />
                </div>
                <div className={isMobile ? 'flex-1' : ''}>
                  <h3 className={`font-semibold text-[var(--text-primary)] ${isMobile ? 'text-sm' : ''}`}>
                    Enable Push Notifications
                  </h3>
                  {isMobile && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      Get instant alerts for orders
                    </p>
                  )}
                </div>
              </div>
              {!isMobile && (
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Get instant alerts for order updates, approvals, and important events with sound notifications
                  </p>
                </div>
              )}
              <Button
                variant="primary"
                size={isMobile ? 'md' : 'sm'}
                onClick={enableNotifications}
                className={isMobile ? 'w-full min-h-tap' : ''}
              >
                Enable Notifications
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className={isMobile ? 'p-3' : ''}>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row items-center'} gap-3`}>
            {/* Status Filter - Horizontal scroll on mobile */}
            <div className={`${isMobile ? '-mx-3 px-3 overflow-x-auto hide-scrollbar' : ''}`}>
              <div className={`flex gap-2 ${isMobile ? 'min-w-max pb-1' : ''}`}>
                {['all', 'unread', 'read'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className={`${isMobile ? 'px-3 py-2 text-sm min-h-tap' : 'px-4 py-2'} rounded-xl font-medium transition-all whitespace-nowrap ${
                      filter === status
                        ? 'bg-[var(--primary-color)] text-white shadow-lg'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    {status === 'all' && 'All'}
                    {status === 'unread' && (isMobile ? `Unread (${unreadCount})` : `Unread (${unreadCount})`)}
                    {status === 'read' && (isMobile ? 'Read' : `Read (${notifications.length - unreadCount})`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className={isMobile ? 'w-full' : 'flex-1 flex justify-end'}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`${isMobile ? 'w-full min-h-tap' : ''} px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm`}
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
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className={isMobile ? 'p-4' : ''}>
            <div className={`text-center ${isMobile ? 'py-12' : 'py-20'}`}>
              <FiBell className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} text-[var(--text-secondary)] mx-auto mb-4 opacity-50`} />
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-[var(--text-primary)] mb-2`}>
                No notifications
              </h3>
              <p className={`text-[var(--text-secondary)] ${isMobile ? 'text-sm' : ''}`}>
                {filter === 'unread'
                  ? "You're all caught up!"
                  : typeFilter !== 'all'
                  ? `No ${getNotificationTypeLabel(typeFilter).toLowerCase()} notifications.`
                  : 'You have no notifications yet.'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification._id}
                hoverable
                className={`cursor-pointer transition-all ${isMobile ? 'p-0' : ''} ${
                  !notification.read
                    ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10'
                    : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`flex gap-3 ${isMobile ? 'p-3' : 'gap-4 p-4'}`}>
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-full flex items-center justify-center ${
                        !notification.read
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      {React.cloneElement(getNotificationIcon(notification.type) as React.ReactElement, {
                        size: isMobile ? 18 : 24
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold ${isMobile ? 'text-sm' : 'text-lg'} truncate ${
                              !notification.read
                                ? 'text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {!isMobile && (
                          <Badge variant="info" size="sm">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className={`text-[var(--text-secondary)] hover:text-red-500 transition-colors ${isMobile ? 'p-2 -mr-2 min-h-tap min-w-tap flex items-center justify-center' : 'p-2'}`}
                        title="Delete notification"
                      >
                        <FiTrash2 size={isMobile ? 16 : 18} />
                      </button>
                    </div>

                    <p className={`text-[var(--text-secondary)] ${isMobile ? 'text-xs line-clamp-2 mb-2' : 'mb-3'}`}>
                      {notification.message}
                    </p>

                    {notification.orderNumber && (
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--primary-color)] font-medium mb-2`}>
                        Order #{notification.orderNumber}
                      </p>
                    )}

                    <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between gap-4'}`}>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-secondary)]`}>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {!isMobile && (
                        <span className="text-xs text-[var(--text-secondary)]">
                          {format(new Date(notification.createdAt), 'MMM dd, yyyy \'at\' hh:mm a')}
                        </span>
                      )}
                      {!notification.read && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className={isMobile ? 'text-xs py-1 px-2' : ''}
                        >
                          {isMobile ? 'Read' : 'Mark as Read'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DistributorLayout>
  );
};

export default NotificationsPage;
