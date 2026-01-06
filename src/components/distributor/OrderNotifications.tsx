import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiX, FiBell } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface NewOrder {
  _id: string;
  orderNumber: string;
  user: { name: string };
  totalAmount: number;
  items: Array<{ quantity: number }>;
  createdAt: string;
}

interface OrderNotificationsProps {
  onNewOrder?: () => void;
}

const OrderNotifications: React.FC<OrderNotificationsProps> = ({ onNewOrder }) => {
  const [newOrders, setNewOrders] = useState<NewOrder[]>([]);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isEnabled, setIsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    // Create notification sound
    try {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.7;

      // Preload the audio to ensure it's ready
      audioRef.current.load();

      // Enable audio after user interaction (required by browsers)
      const enableAudio = () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;
          }).catch(() => {
            // Audio will be enabled on next user interaction
          });
        }
      };

      // Listen for any user interaction to enable audio
      document.addEventListener('click', enableAudio, { once: true });
      document.addEventListener('keydown', enableAudio, { once: true });
    } catch (error) {
      console.log('Audio notification setup failed:', error);
      audioRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Poll for new orders
  useEffect(() => {
    if (!isEnabled) return;

    const checkForNewOrders = async () => {
      try {
        const response = await api.get('/distributor/orders', {
          params: {
            since: lastChecked.toISOString(),
            status: 'pending',
          },
        });

        const orders = response.data.orders || [];

        // Filter for truly new orders (created after last check)
        const recentOrders = orders.filter((order: NewOrder) => {
          const orderDate = new Date(order.createdAt);
          return orderDate > lastChecked;
        });

        if (recentOrders.length > 0) {
          // Play notification sound
          playNotificationSound();

          // Add new orders to state
          setNewOrders(prev => [...recentOrders, ...prev]);

          // Show toast notification
          toast.info(
            `${recentOrders.length} new order${recentOrders.length > 1 ? 's' : ''} received!`,
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );

          // Call callback if provided
          if (onNewOrder) {
            onNewOrder();
          }
        }

        setLastChecked(new Date());
      } catch (error: any) {
        // Handle rate limiting gracefully
        if (error.response?.status === 429) {
          console.log('Rate limit reached, will retry in 60 seconds');
        } else {
          console.error('Error checking for new orders:', error);
        }
      }
    };

    // Check immediately
    checkForNewOrders();

    // Then check every 60 seconds (reduced from 30 to avoid rate limiting)
    intervalRef.current = setInterval(checkForNewOrders, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          // Silently fail if sound file doesn't exist or can't play
          // User will still see visual notification
        });
      } catch (error) {
        // Audio not available, visual notification will still show
      }
    }
  };

  const dismissNotification = (orderId: string) => {
    setNewOrders(prev => prev.filter(order => order._id !== orderId));
  };

  const dismissAll = () => {
    setNewOrders([]);
  };

  const toggleNotifications = () => {
    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      toast.success('Order notifications enabled');
    } else {
      toast.info('Order notifications disabled');
    }
  };

  return (
    <>
      {/* Notification Toggle Button */}
      <div className="notification-toggle">
        <button
          onClick={toggleNotifications}
          className={`toggle-btn ${isEnabled ? 'active' : 'inactive'}`}
          title={isEnabled ? 'Disable notifications' : 'Enable notifications'}
        >
          <FiBell />
          {isEnabled ? ' On' : ' Off'}
        </button>
      </div>

      {/* Notification Popup Container */}
      <div className="notification-container">
        <AnimatePresence>
          {newOrders.length > 0 && (
            <motion.div
              className="notification-popup"
              initial={{ opacity: 0, y: -100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="notification-header">
                <div className="notification-title">
                  <FiShoppingCart />
                  <span>New Orders ({newOrders.length})</span>
                </div>
                <div className="notification-actions">
                  <button onClick={dismissAll} className="btn-dismiss-all">
                    Dismiss All
                  </button>
                  <button onClick={dismissAll} className="btn-close">
                    <FiX />
                  </button>
                </div>
              </div>

              <div className="notification-list">
                {newOrders.slice(0, 5).map((order) => (
                  <motion.div
                    key={order._id}
                    className="notification-item"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    layout
                  >
                    <div className="order-info">
                      <div className="order-number">#{order.orderNumber}</div>
                      <div className="order-customer">{order.user.name}</div>
                      <div className="order-details">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items • ₹
                        {order.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotification(order._id)}
                      className="btn-dismiss"
                      title="Dismiss"
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ))}
                {newOrders.length > 5 && (
                  <div className="notification-more">
                    +{newOrders.length - 5} more orders
                  </div>
                )}
              </div>

              <div className="notification-footer">
                <a href="/distributor/orders" className="btn-view-all">
                  View All Orders
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .notification-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s;
          font-size: 15px;
        }

        .toggle-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .toggle-btn.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
        }

        .toggle-btn.inactive {
          background: #e2e8f0;
          color: #718096;
        }

        .toggle-btn.inactive:hover {
          background: #cbd5e0;
        }

        .notification-container {
          position: fixed;
          top: 80px;
          right: 24px;
          z-index: 1000;
          max-width: 400px;
        }

        .notification-popup {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .notification-header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 18px;
        }

        .notification-actions {
          display: flex;
          gap: 8px;
        }

        .btn-dismiss-all {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-dismiss-all:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .btn-close {
          padding: 6px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .order-info {
          flex: 1;
        }

        .order-number {
          font-weight: 700;
          color: #667eea;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .order-customer {
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 4px;
        }

        .order-details {
          font-size: 13px;
          color: #718096;
        }

        .btn-dismiss {
          padding: 6px;
          background: #fee;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-dismiss:hover {
          background: #dc2626;
          color: white;
        }

        .notification-more {
          padding: 12px 20px;
          text-align: center;
          font-size: 13px;
          color: #667eea;
          font-weight: 600;
          background: #f8f9fa;
        }

        .notification-footer {
          padding: 16px 20px;
          border-top: 1px solid #f0f0f0;
          background: #f8f9fa;
        }

        .btn-view-all {
          display: block;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
        }

        .btn-view-all:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .notification-container {
            right: 12px;
            left: 12px;
            max-width: none;
          }

          .notification-toggle {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  );
};

export default OrderNotifications;
