/**
 * OMNIX AI - Notification Store
 * State management for push notifications, preferences, and delivery tracking
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useNotificationStore = create(
  persist(
    immer((set, get) => ({
      // Notification state
      notifications: [],
      unreadCount: 0,
      isInitialized: false,
      permission: 'default',
      isSubscribed: false,
      
      // User preferences
      preferences: {
        replenishment: {
          enabled: true,
          timing: 'optimal',
          daysBeforeEmpty: 3,
          quietHours: { start: 22, end: 8 },
          frequency: 'smart'
        },
        deals: {
          enabled: true,
          categories: [],
          minDiscount: 20,
          maxPerDay: 5,
          personalizedOnly: true
        },
        priceDrops: {
          enabled: true,
          watchlist: [],
          minDropPercentage: 15,
          immediateAlert: true
        },
        newProducts: {
          enabled: false,
          categories: [],
          aiRecommendationsOnly: true,
          maxPerWeek: 3
        },
        loyalty: {
          enabled: true,
          milestoneAlerts: true,
          expirationWarnings: true,
          specialOffers: true
        },
        delivery: {
          webPush: true,
          inApp: true,
          email: false,
          sms: false
        }
      },
      
      // Analytics & AI insights
      analytics: {
        deliveryStats: {
          sent: 0,
          delivered: 0,
          clicked: 0,
          dismissed: 0
        },
        engagementScore: 0,
        optimalTiming: {
          timeOfDay: 14,
          dayOfWeek: [1, 2, 3, 4, 5],
          confidence: 0.7
        },
        categoryPreferences: {},
        responsePatterns: {}
      },

      // Actions
      initializeNotifications: async () => {
        // Implementation will be added when service is imported
        return true;
      },

      updateAnalytics: (eventType, data) => {
        set((state) => {
          switch (eventType) {
            case 'delivered':
              state.analytics.deliveryStats.delivered += 1;
              break;
            case 'clicked':
              state.analytics.deliveryStats.clicked += 1;
              break;
            case 'dismissed':
              state.analytics.deliveryStats.dismissed += 1;
              break;
          }
          
          const stats = state.analytics.deliveryStats;
          const totalDelivered = stats.delivered || 1;
          state.analytics.engagementScore = (
            (stats.clicked * 0.7 + stats.delivered * 0.3 - stats.dismissed * 0.1) / totalDelivered
          ) * 100;
        });
      }
    })),
    {
      name: 'omnix-notifications',
      partialize: (state) => ({
        preferences: state.preferences,
        analytics: state.analytics,
        isSubscribed: state.isSubscribed,
        permission: state.permission
      })
    }
  )
);

export default useNotificationStore;