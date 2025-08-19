import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useNotificationStore = create(
  devtools(
    (set, get) => ({
      notifications: [],
      maxNotifications: 10,
      autoHideDuration: 5000,
      
      // Add a new notification
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
          id,
          timestamp: new Date().toISOString(),
          read: false,
          ...notification
        };
        
        set(state => {
          const notifications = [newNotification, ...state.notifications];
          // Keep only the latest maxNotifications
          return {
            notifications: notifications.slice(0, state.maxNotifications)
          };
        });
        
        // Auto-hide notification after duration
        if (notification.autoHide !== false) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration || get().autoHideDuration);
        }
        
        // Show browser notification if enabled
        if (notification.showBrowserNotification && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon-192.svg',
              badge: '/badge-72.svg',
              tag: id
            });
          }
        }
        
        return id;
      },
      
      // Remove a notification
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      // Mark notification as read
      markAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }));
      },
      
      // Mark all notifications as read
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        }));
      },
      
      // Clear all notifications
      clearAll: () => {
        set({ notifications: [] });
      },
      
      // Get unread count
      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length;
      },
      
      // Request browser notification permission
      requestPermission: async () => {
        if ('Notification' in window && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      }
    }),
    {
      name: 'notification-store'
    }
  )
);