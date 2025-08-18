// API service layer for OMNIX AI
import useUserStore from '../store/userStore';

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

// API Configuration  
const API_CONFIG = {
  baseURL: (import.meta.env.VITE_API_BASE_URL) 
    ? (import.meta.env.VITE_API_BASE_URL + '/v1')  // Use environment variable if set (production)
    : (import.meta.env.DEV ? '/api' : 'https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1'),  // Fallback logic
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Debug API configuration (disabled for cleaner console)
// if (typeof window !== 'undefined' && import.meta.env.DEV) {
//   console.group('🔧 API Configuration Debug');
//   console.log('🌍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
//   console.log('📡 Final baseURL:', API_CONFIG.baseURL);
//   console.log('🎯 Example endpoint:', `${API_CONFIG.baseURL}/dashboard/summary`);
//   console.groupEnd();
// }

// Request/Response interceptors
const createApiHeaders = () => {
  const token = useUserStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  // Add API Key if available and not a placeholder
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey && apiKey !== 'your_api_key_here_if_required') {
    headers['X-API-Key'] = apiKey;
  }
  
  // Add Bearer token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Enhanced fetch with retry logic
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const config = {
    headers: createApiHeaders(),
    ...options,
    timeout: API_CONFIG.timeout
  };
  
  let lastError;
  
  for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      // API Request Logging (enabled for debugging)
      if (import.meta.env.DEV) {
        console.group(`🔄 API Request [Attempt ${attempt}]`);
        console.log('📤 URL:', url);
        console.log('📋 Method:', config.method || 'GET');
        console.log('📝 Headers:', config.headers);
        if (config.body) {
          console.log('📦 Body:', typeof config.body === 'string' ? JSON.parse(config.body) : config.body);
        }
        console.groupEnd();
      }
      
      const requestStart = performance.now();
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      const requestDuration = performance.now() - requestStart;
      
      clearTimeout(timeoutId);
      
      // API Response Logging (enabled for debugging)
      if (import.meta.env.DEV) {
        console.group(`📡 API Response [${response.status}] - ${requestDuration.toFixed(2)}ms`);
        console.log('✅ Status:', response.status, response.statusText);
        console.log('📝 Headers:', Object.fromEntries(response.headers.entries()));
        console.groupEnd();
      }
      
      // Handle token expiration
      if (response.status === 401) {
        const userStore = useUserStore.getState();
        const refreshed = await userStore.refreshSession();
        
        if (refreshed && attempt < API_CONFIG.retryAttempts) {
          // Retry with new token
          config.headers = createApiHeaders();
          continue;
        } else {
          userStore.logout();
          throw new ApiError('Authentication failed', 401, 'UNAUTHORIZED');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code || 'API_ERROR',
          errorData
        );
      }
      
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Log successful response data (disabled for cleaner console)
        // if (import.meta.env.DEV) {
        //   console.group(`📦 API Response Data`);
        //   console.log('🔍 Raw Data:', data);
        //   console.groupEnd();
        // }
        
        // Handle backend response format transformation
        const transformedData = transformBackendResponse(data, endpoint);
        
        // Log transformed data if different (disabled for cleaner console)
        // if (import.meta.env.DEV && transformedData !== data) {
        //   console.group(`🔄 Transformed Data`);
        //   console.log('✨ Transformed:', transformedData);
        //   console.groupEnd();
        // }
        
        return transformedData;
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      
      // Log API errors in development (keep for debugging)
      if (import.meta.env.DEV && error.status >= 400) {
        console.error(`API Error [${attempt}]:`, error.message, error.status || 'N/A');
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      if (attempt === API_CONFIG.retryAttempts || error.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * attempt));
    }
  }
  
  throw lastError;
};

// Response transformation utility
const transformBackendResponse = (data, endpoint) => {
  // Transform backend's {data: [...], pagination: {...}} to client expected format
  if (data && typeof data === 'object' && data.data) {
    // Products endpoint transformation
    if (endpoint.includes('/products')) {
      return {
        products: data.data,
        pagination: data.pagination || data.meta,
        ...(data.meta && { meta: data.meta })
      };
    }
    
    // Dashboard summary transformation
    if (endpoint.includes('/dashboard/summary')) {
      return {
        revenue: {
          current: data.data.totalInventoryValue || 0,
          previous: 0, // Backend doesn't provide this yet
          change: 0,
          trend: 'neutral'
        },
        inventory: {
          totalValue: data.data.totalInventoryValue || 0,
          totalItems: data.data.totalItems || 0,
          lowStockItems: data.data.lowStockItems || 0,
          outOfStockItems: 0 // Backend doesn't provide this yet
        },
        alerts: {
          critical: 0, // Will be populated from alerts endpoint
          warning: 0,
          info: 0,
          total: 0
        },
        categoryBreakdown: data.data.categoryBreakdown || []
      };
    }
    
    // Alerts endpoint transformation
    if (endpoint.includes('/alerts')) {
      return {
        alerts: data.data,
        pagination: data.pagination || data.meta
      };
    }
    
    // Recommendations endpoint transformation
    if (endpoint.includes('/recommendations')) {
      return {
        recommendations: data.data,
        pagination: data.pagination || data.meta
      };
    }
    
    // Forecasts endpoint transformation
    if (endpoint.includes('/forecasts')) {
      return {
        forecasts: data.data,
        pagination: data.pagination || data.meta
      };
    }
    
    // Auth endpoints - preserve the original structure
    if (endpoint.includes('/auth/')) {
      return data;
    }
    
    // Default transformation - return data directly
    return data.data;
  }
  
  // Return original data if no transformation needed
  return data;
};

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, code, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// Generic API methods
const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  },
  
  post: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  put: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  patch: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  delete: (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  },
  
  upload: (endpoint, formData) => {
    return apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useUserStore.getState().token}`
      },
      body: formData
    });
  }
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

// Analytics API (mapped to backend endpoints where available)
export const analyticsAPI = {
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
  deleteReport: (reportId) => api.delete(`/analytics/reports/${reportId}`)
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

// WebSocket connection management
export class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
  }
  
  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    
    if (this.isConnecting) {
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
    const token = useUserStore.getState().token;
    
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);
    
    return new Promise((resolve, reject) => {
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        reject(error);
      };
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
  
  subscribe(channel, callback) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel).add(callback);
    
    // Send subscription message
    this.send({ type: 'subscribe', channel });
  }
  
  unsubscribe(channel, callback) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).delete(callback);
      if (this.listeners.get(channel).size === 0) {
        this.listeners.delete(channel);
        this.send({ type: 'unsubscribe', channel });
      }
    }
  }
  
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
  
  handleMessage(data) {
    const { channel, type, payload } = data;
    
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).forEach(callback => {
        callback({ type, payload });
      });
    }
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

// Export API error class
export { ApiError };

// Export main API object
export default api;