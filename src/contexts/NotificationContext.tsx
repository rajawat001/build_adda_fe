import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

export interface Notification {
  _id: string;
  type: 'order_placed' | 'order_approved' | 'order_rejected' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'price_update' | 'stock_update' | 'general';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  playNotificationSound: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  isNotificationEnabled: boolean;
  enableNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationIdRef = useRef<string | null>(null);

  // Initialize audio element
  useEffect(() => {
    // Create notification sound using the same file as distributor
    try {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
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
    }

    // Check if notifications are enabled (default to true for sound notifications)
    const storedPreference = localStorage.getItem('notificationsEnabled');
    const enabled = storedPreference !== null ? storedPreference === 'true' : true;
    setIsNotificationEnabled(enabled);

    // If not explicitly set, auto-enable sound notifications
    if (storedPreference === null) {
      localStorage.setItem('notificationsEnabled', 'true');
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!isNotificationEnabled || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log('Could not play notification sound:', error);
        // Fallback: Create a simple beep sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (fallbackError) {
          console.error('Fallback sound also failed:', fallbackError);
        }
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [isNotificationEnabled]);

  // Enable notifications
  const enableNotifications = useCallback(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setIsNotificationEnabled(true);
          localStorage.setItem('notificationsEnabled', 'true');
          toast.success('Notifications enabled!');
        } else {
          toast.error('Notification permission denied');
        }
      });
    } else {
      // Just enable sound notifications if browser doesn't support notifications
      setIsNotificationEnabled(true);
      localStorage.setItem('notificationsEnabled', 'true');
      toast.success('Sound notifications enabled!');
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const newNotifications = response.data.notifications || [];

      // Check for new notifications
      if (newNotifications.length > 0 && lastNotificationIdRef.current !== newNotifications[0]._id) {
        const latestNotification = newNotifications[0];

        // Only notify if this is a new notification (not on initial load)
        if (lastNotificationIdRef.current !== null && !latestNotification.read) {
          // Play sound
          playNotificationSound();

          // Show toast notification
          showToastNotification(latestNotification);

          // Show browser notification if supported and enabled
          showBrowserNotification(latestNotification);
        }

        lastNotificationIdRef.current = latestNotification._id;
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Generate mock notifications for demo purposes
      generateMockNotifications();
    }
  }, [playNotificationSound]);

  // Generate mock notifications for demo
  const generateMockNotifications = useCallback(() => {
    const mockNotifications: Notification[] = [
      {
        _id: '1',
        type: 'order_placed',
        title: 'New Order Received',
        message: 'Order #ORD-2024-001 has been placed',
        orderNumber: 'ORD-2024-001',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  // Show toast notification
  const showToastNotification = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);

    toast.info(
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  // Show browser notification
  const showBrowserNotification = (notification: Notification) => {
    if (!isNotificationEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const icon = getNotificationIcon(notification.type);
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png', // Add your logo path
      badge: '/logo.png',
      tag: notification._id,
      requireInteraction: false,
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']): string => {
    const icons: Record<Notification['type'], string> = {
      order_placed: '🛒',
      order_approved: '✅',
      order_rejected: '❌',
      order_confirmed: '📦',
      order_shipped: '🚚',
      order_delivered: '✓',
      price_update: '💰',
      stock_update: '📊',
      general: '🔔',
    };
    return icons[type] || '🔔';
  };

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      // Fallback to local update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      // Fallback to local update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      // Fallback to local update
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      // Fallback to local update
      setNotifications([]);
    }
  }, []);

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    return !!(user && role);
  };

  // Start polling for notifications
  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (!isAuthenticated()) {
      return;
    }

    // Fetch immediately
    fetchNotifications();

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        playNotificationSound,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        isNotificationEnabled,
        enableNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
