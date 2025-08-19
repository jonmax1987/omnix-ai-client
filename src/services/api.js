// API service layer for OMNIX AI
// Enhanced with httpClient service for interceptors and retry logic
import httpService, { ApiError } from './httpClient';
import useUserStore from '../store/userStore';
// Socket.IO is imported dynamically when needed

/**
 * @typedef {import('../types/api.js').APIResponse} APIResponse
 * @typedef {import('../types/api.js').Product} Product
 * @typedef {import('../types/api.js').Alert} Alert
 * @typedef {import('../types/api.js').DashboardSummary} DashboardSummary
 * @typedef {import('../types/api.js').DashboardMetrics} DashboardMetrics
 * @typedef {import('../types/api.js').OrderRecommendation} OrderRecommendation
 * @typedef {import('../types/api.js').DemandForecast} DemandForecast
 * @typedef {import('../types/api.js').TrendAnalysis} TrendAnalysis
 */

// Legacy API Configuration (now managed by httpClient service)
const API_CONFIG = httpService.getConfig();

// Generic API methods (now using enhanced httpService)
const api = {
  get: (endpoint, params = {}) => httpService.get(endpoint, params),
  post: (endpoint, data) => httpService.post(endpoint, data),
  put: (endpoint, data) => httpService.put(endpoint, data),
  patch: (endpoint, data) => httpService.patch(endpoint, data),
  delete: (endpoint) => httpService.delete(endpoint),
  upload: (endpoint, formData) => httpService.upload(endpoint, formData)
};

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  setupTwoFactor: () => api.post('/auth/2fa/setup'),
  verifyTwoFactor: (code) => api.post('/auth/2fa/verify', { code }),
  disableTwoFactor: (code) => api.post('/auth/2fa/disable', { code })
};

// User Profile API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.upload('/user/avatar', formData);
  },
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (preferences) => api.patch('/user/preferences', preferences),
  getPermissions: () => api.get('/user/permissions'),
  getSessionHistory: (params = {}) => api.get('/user/sessions', params),
  deleteAccount: (password) => api.delete('/user/account', { password })
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', params),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.patch(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  deleteProducts: (ids) => api.post('/products/batch-delete', { ids }),
  importProducts: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/products/import', formData);
  },
  exportProducts: (params = {}) => api.get('/products/export', params),
  getProductHistory: (id, params = {}) => api.get(`/products/${id}/history`, params),
  bulkUpdate: (updates) => api.post('/products/batch-update', updates),
  getCategories: () => api.get('/products/categories'),
  getSuppliers: () => api.get('/products/suppliers'),
  getTags: () => api.get('/products/tags')
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params = {}) => api.get('/inventory', params),
  getInventoryItem: (productId) => api.get(`/inventory/${productId}`),
  adjustStock: (productId, adjustment) => 
    api.post(`/inventory/${productId}/adjust`, adjustment),
  transferStock: (data) => api.post('/inventory/transfer', data),
  getStockHistory: (productId, params = {}) => 
    api.get(`/inventory/${productId}/history`, params),
  getStockAlerts: (params = {}) => api.get('/inventory/alerts', params),
  dismissAlert: (alertId) => api.delete(`/inventory/alerts/${alertId}`),
  bulkAdjust: (adjustments) => api.post('/inventory/bulk-adjust', adjustments),
  getLocations: () => api.get('/inventory/locations'),
  createLocation: (data) => api.post('/inventory/locations', data),
  updateLocation: (id, data) => api.patch(`/inventory/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/inventory/locations/${id}`)
};

// Orders API
export const ordersAPI = {
  getOrders: (params = {}) => api.get('/orders', params),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.patch(`/orders/${id}`, data),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  fulfillOrder: (id, data) => api.post(`/orders/${id}/fulfill`, data),
  getOrderHistory: (id) => api.get(`/orders/${id}/history`),
  exportOrders: (params = {}) => api.get('/orders/export', params),
  getOrderStatistics: (params = {}) => api.get('/orders/statistics', params)
};

// Alerts API (aligned with backend spec)
export const alertsAPI = {
  getAlerts: (params = {}) => api.get('/alerts', params),
  getAlert: (id) => api.get(`/alerts/${id}`),
  createAlert: (data) => api.post('/alerts', data),
  dismissAlert: (id) => api.post(`/alerts/${id}/dismiss`), // Backend uses dismiss instead of acknowledge
  acknowledgeAlert: (id) => api.post(`/alerts/${id}/dismiss`), // Map to backend endpoint
  resolveAlert: (id, resolution) => api.post(`/alerts/${id}/resolve`, { resolution }),
  bulkAcknowledge: (ids) => api.post('/alerts/bulk-acknowledge', { ids }),
  bulkResolve: (ids, resolution) => api.post('/alerts/bulk-resolve', { ids, resolution }),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  getAlertStatistics: () => api.get('/alerts/statistics'),
  getAlertCategories: () => api.get('/alerts/categories'),
  createRule: (rule) => api.post('/alerts/rules', rule),
  updateRule: (id, rule) => api.patch(`/alerts/rules/${id}`, rule),
  deleteRule: (id) => api.delete(`/alerts/rules/${id}`),
  getRules: () => api.get('/alerts/rules')
};

// Dashboard API (matches backend spec)
export const dashboardAPI = {
  getSummary: (params = {}) => api.get('/dashboard/summary', params),
  getInventoryGraph: (params = {}) => {
    // Backend doesn't accept timeRange parameter, so don't pass it
    const { timeRange, ...backendParams } = params;
    return api.get('/dashboard/inventory-graph', backendParams);
  }
};

// Analytics API (preserving original functionality + extended capabilities)
export const analyticsAPI = {
  // Original methods (preserved exactly as they were)
  getDashboardMetrics: (params = {}) => api.get('/dashboard/summary', params), // Maps to backend endpoint
  getInventoryGraph: (params = {}) => {
    // Backend doesn't accept timeRange parameter, so don't pass it
    const { timeRange, ...backendParams } = params;
    return api.get('/dashboard/inventory-graph', backendParams);
  }, // Maps to backend endpoint
  // Legacy endpoints (may need backend implementation)
  getRevenueMetrics: (params = {}) => api.get('/analytics/revenue', params),
  getInventoryMetrics: (params = {}) => api.get('/analytics/inventory', params),
  getOrderMetrics: (params = {}) => api.get('/analytics/orders', params),
  getForecast: (params = {}) => api.get('/forecasts/demand', params), // Map to backend forecasts
  getTrends: (params = {}) => api.get('/forecasts/trends', params), // Map to backend forecasts
  getPerformance: (params = {}) => api.get('/analytics/performance', params),
  generateReport: (type, params = {}) => api.post(`/analytics/reports/${type}`, params),
  getReports: (params = {}) => api.get('/analytics/reports', params),
  downloadReport: (reportId) => api.get(`/analytics/reports/${reportId}/download`),
  deleteReport: (reportId) => api.delete(`/analytics/reports/${reportId}`),

  // Extended analytics capabilities (new methods)
  getDashboardSummary: (params = {}) => api.get('/dashboard/summary', params),
  getRevenueAnalytics: (params = {}) => api.get('/analytics/revenue', params),
  getRevenueForecast: (params = {}) => api.get('/analytics/revenue/forecast', params),

  // Customer analytics
  getCustomerSegmentation: (params = {}) => api.get('/analytics/customers/segmentation', params),
  getCustomerLifetimeValue: (params = {}) => api.get('/analytics/customers/lifetime-value', params),
  getChurnAnalysis: (params = {}) => api.get('/analytics/customers/churn-analysis', params),
  getSegmentTrends: (params = {}) => api.get('/analytics/customers/segment-trends', params),

  // Extended inventory analytics
  getInventoryAnalytics: (params = {}) => api.get('/analytics/inventory', params),
  getInventoryForecasting: (params = {}) => api.get('/analytics/inventory/forecasting', params),
  getInventoryOptimization: (params = {}) => api.get('/analytics/inventory/optimization', params),
  getInventoryAlerts: (params = {}) => api.get('/analytics/inventory/alerts', params),

  // Extended order analytics
  getOrderAnalytics: (params = {}) => api.get('/analytics/orders', params),
  getOrderPatterns: (params = {}) => api.get('/analytics/orders/patterns', params),
  getOrderSeasonality: (params = {}) => api.get('/analytics/orders/seasonality', params),

  // Product analytics
  getProductAnalytics: (params = {}) => api.get('/analytics/products', params),
  getProductRecommendations: (params = {}) => api.get('/analytics/products/recommendations', params),
  getProductPerformance: (params = {}) => api.get('/analytics/products/performance', params),
  getProductCorrelations: (params = {}) => api.get('/analytics/products/correlations', params),

  // Predictive analytics
  getDemandPredictions: (params = {}) => api.get('/analytics/predictions/demand', params),
  getRevenuePredictions: (params = {}) => api.get('/analytics/predictions/revenue', params),
  getChurnPredictions: (params = {}) => api.get('/analytics/predictions/churn', params),
  getInventoryPredictions: (params = {}) => api.get('/analytics/predictions/inventory', params),

  // Real-time analytics
  getRealTimeAnalytics: (params = {}) => api.get('/analytics/realtime', params),
  getRealTimeMetrics: (params = {}) => api.get('/analytics/realtime', params),

  // Extended report generation and export
  generateCustomReport: (params = {}) => api.post('/analytics/reports/generate', params),
  getReport: (reportId) => api.get(`/analytics/reports/${reportId}`),
  exportAnalytics: (type, params = {}) => api.get(`/analytics/export/${type}`, params)
};

// Recommendations API (matches backend spec)
export const recommendationsAPI = {
  getOrderRecommendations: (params = {}) => api.get('/recommendations/orders', params),
  getRecommendations: (params = {}) => api.get('/recommendations/orders', params), // Map existing calls
  getRecommendation: (id) => api.get(`/recommendations/${id}`),
  acceptRecommendation: (id) => api.post(`/recommendations/${id}/accept`),
  dismissRecommendation: (id) => api.post(`/recommendations/${id}/dismiss`),
  getRecommendationHistory: (params = {}) => api.get('/recommendations/history', params),
  getRecommendationSettings: () => api.get('/recommendations/settings'),
  updateRecommendationSettings: (settings) => 
    api.patch('/recommendations/settings', settings)
};

// Forecasting API (matches backend spec)
export const forecastsAPI = {
  getDemandForecasts: (params = {}) => api.get('/forecasts/demand', params),
  getTrendAnalysis: (params = {}) => api.get('/forecasts/trends', params)
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.patch('/settings', settings),
  getIntegrations: () => api.get('/settings/integrations'),
  updateIntegration: (id, data) => api.patch(`/settings/integrations/${id}`, data),
  testIntegration: (id) => api.post(`/settings/integrations/${id}/test`),
  getNotificationSettings: () => api.get('/settings/notifications'),
  updateNotificationSettings: (settings) => 
    api.patch('/settings/notifications', settings),
  getApiKeys: () => api.get('/settings/api-keys'),
  createApiKey: (data) => api.post('/settings/api-keys', data),
  revokeApiKey: (keyId) => api.delete(`/settings/api-keys/${keyId}`),
  getWebhooks: () => api.get('/settings/webhooks'),
  createWebhook: (webhook) => api.post('/settings/webhooks', webhook),
  updateWebhook: (id, webhook) => api.patch(`/settings/webhooks/${id}`, webhook),
  deleteWebhook: (id) => api.delete(`/settings/webhooks/${id}`),
  testWebhook: (id) => api.post(`/settings/webhooks/${id}/test`)
};

// System API
export const systemAPI = {
  getHealth: () => api.get('/system/health'),
  getStatus: () => api.get('/system/status'),
  getVersion: () => api.get('/system/version'),
  getLogs: (params = {}) => api.get('/system/logs', params),
  getMetrics: (params = {}) => api.get('/system/metrics', params),
  backup: () => api.post('/system/backup'),
  getBackups: () => api.get('/system/backups'),
  restoreBackup: (backupId) => api.post(`/system/backups/${backupId}/restore`),
  deleteBackup: (backupId) => api.delete(`/system/backups/${backupId}`)
};

// Socket.IO connection management
export class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
  }
  
  async connect() {
    // Check if WebSocket is disabled in production
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      console.log('WebSocket disabled - using HTTP polling fallback');
      return Promise.resolve();
    }
    
    // Check if already connected
    if (this.socket) {
      // Check connection based on socket type
      if (this.socket.connected !== undefined) {
        // Socket.IO connection
        if (this.socket.connected) return Promise.resolve();
      } else {
        // Raw WebSocket connection
        if (this.socket.readyState === WebSocket.OPEN) return Promise.resolve();
      }
    }
    
    if (this.isConnecting) {
      return this.connectionPromise || Promise.resolve();
    }
    
    this.isConnecting = true;
    const token = useUserStore.getState().token;
    
    // Create Socket.IO connection - handle both local and AWS WebSocket
    if (wsUrl.includes('amazonaws.com')) {
      // AWS API Gateway WebSocket - use raw WebSocket
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      this._setupRawWebSocket();
    } else if (wsUrl && wsUrl.includes('localhost')) {
      // Local development - use Socket.IO (dynamically import)
      const { io } = await import('socket.io-client');
      this.socket = io(wsUrl + '/ws', {
        auth: { token },
        transports: ['websocket'],
        forceNew: true
      });
      this._setupSocketIO();
    } else {
      // Invalid or missing WebSocket URL - should not happen due to early check
      console.error('Invalid WebSocket URL:', wsUrl);
      this.isConnecting = false;
      return Promise.reject(new Error('Invalid WebSocket URL'));
    }
    
    return this.connectionPromise;
  }
  
  disconnect() {
    if (this.socket) {
      if (this.socket.disconnect) {
        // Socket.IO connection
        this.socket.disconnect();
      } else {
        // Raw WebSocket connection
        this.socket.close();
      }
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnecting = false;
  }
  
  subscribe(channel, callback) {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) return;
    
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel).add(callback);
    
    // Send subscription message via Socket.IO
    this.send({ type: 'subscribe', channel });
  }
  
  unsubscribe(channel, callback) {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) return;
    
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).delete(callback);
      if (this.listeners.get(channel).size === 0) {
        this.listeners.delete(channel);
        this.send({ type: 'unsubscribe', channel });
      }
    }
  }
  
  send(data) {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl || !this.socket) return;
    
    // Handle different WebSocket types
    if (this.socket.emit) {
      // Socket.IO connection
      if (this.socket.connected) {
        this.socket.emit('message', data);
      }
    } else {
      // Raw WebSocket connection
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data));
      }
    }
  }
  
  handleMessage(data) {
    const { channel, type, payload, event } = data;
    
    // Handle different message formats from backend
    const messageChannel = channel || event || type;
    const messageData = payload || data;
    
    // Emit to specific channel listeners
    if (this.listeners.has(messageChannel)) {
      this.listeners.get(messageChannel).forEach(callback => {
        callback({ type: messageChannel, payload: messageData });
      });
    }
    
    // Also emit to global listeners for cross-cutting concerns
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(callback => {
        callback({ type: messageChannel, payload: messageData });
      });
    }
  }
  
  _setupRawWebSocket() {
    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket.onopen = () => {
        console.log('AWS WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        resolve();
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('AWS WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        if (event.code !== 1000) { // Not a normal closure
          this.attemptReconnect();
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('AWS WebSocket error:', error);
        this.isConnecting = false;
        reject(error);
      };
    });
  }
  
  _setupSocketIO() {
    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        resolve();
      });
      
      this.socket.on('message', (data) => {
        this.handleMessage(data);
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        this.isConnecting = false;
        if (reason === 'io server disconnect') {
          // Reconnection will be handled by Socket.IO
          this.socket.connect();
        } else {
          this.attemptReconnect();
        }
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.isConnecting = false;
        reject(error);
      });
      
      // Handle specific event channels
      ['products', 'dashboard', 'alerts', 'orders', 'notifications'].forEach(channel => {
        this.socket.on(channel, (data) => {
          this.handleMessage({ channel, payload: data });
        });
      });
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }
}

// Export singleton WebSocket instance
export const wsService = new WebSocketService();

// Export main API object and HttpService for advanced usage
export default api;
export { httpService };