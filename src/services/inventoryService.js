// Inventory Management Service
// Implementation of API-004: Inventory management service
import httpService from './httpClient';
import { ApiError } from './httpClient';

/**
 * Inventory Management Service
 * Comprehensive service layer for inventory management, forecasting, and optimization
 */
class InventoryService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3 * 60 * 1000; // 3 minutes for inventory data
    this.subscriptions = new Map();
    this.forecastCache = new Map();
    this.forecastCacheTimeout = 15 * 60 * 1000; // 15 minutes for forecasts
  }

  /**
   * Get inventory overview and summary
   * @param {Object} params - Query parameters
   * @param {string} params.timeRange - Time range for analytics (7d, 30d, 90d)
   * @param {boolean} params.includeMetrics - Include calculated metrics
   * @param {boolean} params.includeAlerts - Include stock alerts
   * @returns {Promise<Object>} Inventory overview
   */
  async getInventoryOverview(params = {}) {
    const { 
      timeRange = '30d', 
      includeMetrics = true, 
      includeAlerts = true,
      useCache = true 
    } = params;
    
    const cacheKey = `inventory_overview_${timeRange}`;
    
    if (useCache && this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockInventoryOverview(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [overview, metrics, alerts] = await Promise.allSettled([
          httpService.get('/inventory', {
            summary: true,
            timeRange,
            includeCategories: true,
            includeLocations: true
          }),
          includeMetrics ? httpService.get('/analytics/inventory', {
            timeRange,
            includeMetrics: true,
            includeTrends: true
          }) : Promise.resolve(null),
          includeAlerts ? httpService.get('/inventory/alerts', {
            severity: ['critical', 'warning', 'info'],
            includeHistorical: false
          }) : Promise.resolve(null)
        ]);

        const result = {
          overview: overview.status === 'fulfilled' ? overview.value : null,
          metrics: metrics.status === 'fulfilled' ? metrics.value : null,
          alerts: alerts.status === 'fulfilled' ? alerts.value : null,
          insights: this.generateInventoryInsights(overview.value, metrics.value, alerts.value),
          lastUpdated: Date.now()
        };

        this.setCachedData(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Inventory overview fetch failed', apiError);
      }
    }
  }

  /**
   * Get detailed inventory list with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory list
   */
  async getInventoryList(params = {}) {
    const {
      page = 1,
      limit = 50,
      sortBy = 'lastUpdated',
      sortOrder = 'desc',
      category = null,
      location = null,
      status = null,
      search = '',
      lowStockOnly = false,
      includeHistory = false
    } = params;

    try {
      const inventoryData = await httpService.get('/inventory', {
        page,
        limit,
        sortBy,
        sortOrder,
        category,
        location,
        status,
        search,
        lowStockOnly,
        includeHistory,
        includeMetrics: true
      });

      return {
        ...inventoryData,
        items: inventoryData.items?.map(item => ({
          ...item,
          healthScore: this.calculateItemHealthScore(item),
          recommendations: this.generateItemRecommendations(item),
          riskLevel: this.assessStockRisk(item)
        })),
        insights: this.generateListInsights(inventoryData.items)
      };
    } catch (error) {
      throw this.handleInventoryError('Inventory list fetch failed', error);
    }
  }

  /**
   * Get specific inventory item details
   * @param {string} productId - Product ID
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Item details
   */
  async getInventoryItem(productId, params = {}) {
    const { 
      includeHistory = true, 
      includeForecasting = true,
      includeRecommendations = true 
    } = params;

    try {
      const [item, history, forecasting, recommendations] = await Promise.allSettled([
        httpService.get(`/inventory/${productId}`),
        includeHistory ? httpService.get(`/inventory/${productId}/history`, {
          timeRange: '90d',
          includeAdjustments: true,
          includeTransfers: true
        }) : Promise.resolve(null),
        includeForecasting ? this.getItemForecasting(productId) : Promise.resolve(null),
        includeRecommendations ? this.getItemRecommendations(productId) : Promise.resolve(null)
      ]);

      const itemData = item.status === 'fulfilled' ? item.value : null;
      
      if (!itemData) {
        throw new ApiError('Item not found', 404, 'ITEM_NOT_FOUND');
      }

      const result = {
        ...itemData,
        history: history.status === 'fulfilled' ? history.value : null,
        forecasting: forecasting.status === 'fulfilled' ? forecasting.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
        healthScore: this.calculateItemHealthScore(itemData),
        riskAssessment: this.performRiskAssessment(itemData),
        insights: this.generateItemInsights(itemData)
      };

      return result;
    } catch (error) {
      throw this.handleInventoryError('Inventory item fetch failed', error);
    }
  }

  /**
   * Adjust inventory stock levels
   * @param {string} productId - Product ID
   * @param {Object} adjustment - Stock adjustment data
   * @returns {Promise<Object>} Adjustment response
   */
  async adjustStock(productId, adjustment) {
    const {
      quantity,
      type = 'manual', // 'manual', 'sale', 'purchase', 'transfer', 'adjustment'
      reason = '',
      location = null,
      batchNumber = null,
      expiryDate = null,
      cost = null,
      notes = ''
    } = adjustment;

    try {
      // Validate adjustment
      this.validateStockAdjustment(adjustment);

      const response = await httpService.post(`/inventory/${productId}/adjust`, {
        quantity,
        type,
        reason,
        location,
        batchNumber,
        expiryDate,
        cost,
        notes,
        timestamp: Date.now()
      });

      // Clear relevant cache entries
      this.clearCache('inventory');

      return {
        ...response,
        insights: this.generateAdjustmentInsights(response),
        recommendations: this.generatePostAdjustmentRecommendations(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Stock adjustment failed', error);
    }
  }

  /**
   * Bulk adjust multiple inventory items
   * @param {Array} adjustments - Array of adjustment objects
   * @returns {Promise<Object>} Bulk adjustment response
   */
  async bulkAdjustStock(adjustments) {
    try {
      // Validate all adjustments
      adjustments.forEach(adj => this.validateStockAdjustment(adj));

      const response = await httpService.post('/inventory/bulk-adjust', {
        adjustments: adjustments.map(adj => ({
          ...adj,
          timestamp: Date.now()
        }))
      });

      // Clear cache
      this.clearCache('inventory');

      return {
        ...response,
        summary: this.generateBulkAdjustmentSummary(response),
        insights: this.generateBulkAdjustmentInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Bulk stock adjustment failed', error);
    }
  }

  /**
   * Transfer stock between locations
   * @param {Object} transfer - Transfer data
   * @returns {Promise<Object>} Transfer response
   */
  async transferStock(transfer) {
    const {
      productId,
      fromLocation,
      toLocation,
      quantity,
      reason = '',
      expectedDate = null,
      notes = ''
    } = transfer;

    try {
      this.validateStockTransfer(transfer);

      const response = await httpService.post('/inventory/transfer', {
        productId,
        fromLocation,
        toLocation,
        quantity,
        reason,
        expectedDate,
        notes,
        initiatedAt: Date.now()
      });

      // Clear cache
      this.clearCache('inventory');

      return {
        ...response,
        insights: this.generateTransferInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Stock transfer failed', error);
    }
  }

  /**
   * Get inventory forecasting and predictions
   * @param {Object} params - Forecasting parameters
   * @returns {Promise<Object>} Forecasting data
   */
  async getInventoryForecasting(params = {}) {
    const {
      timeHorizon = '60d',
      includeReorderPoints = true,
      includeSeasonality = true,
      includeOptimization = true,
      productIds = null,
      categories = null
    } = params;

    const cacheKey = `forecasting_${timeHorizon}_${JSON.stringify({ productIds, categories })}`;
    
    if (this.getForecastCache(cacheKey)) {
      return this.getForecastCache(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockInventoryForecasting(params);
      this.setForecastCache(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock forecasting data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [forecasting, reorderPoints, seasonality, optimization] = await Promise.allSettled([
          httpService.get('/analytics/inventory/forecasting', {
            timeHorizon,
            productIds,
            categories,
            includeConfidence: true,
            includeScenarios: true
          }),
          includeReorderPoints ? httpService.get('/analytics/inventory/reorder-points', {
            productIds,
            categories,
            includeRecommendations: true
          }) : Promise.resolve(null),
          includeSeasonality ? httpService.get('/analytics/inventory/seasonality', {
            timeRange: '1y',
            productIds,
            categories
          }) : Promise.resolve(null),
          includeOptimization ? httpService.get('/analytics/inventory/optimization', {
            includeRecommendations: true,
            includeCostAnalysis: true,
            productIds,
            categories
          }) : Promise.resolve(null)
        ]);

        const result = {
          forecasting: forecasting.status === 'fulfilled' ? forecasting.value : null,
          reorderPoints: reorderPoints.status === 'fulfilled' ? reorderPoints.value : null,
          seasonality: seasonality.status === 'fulfilled' ? seasonality.value : null,
          optimization: optimization.status === 'fulfilled' ? optimization.value : null,
          insights: this.generateForecastingInsights(forecasting.value, reorderPoints.value),
          recommendations: this.generateForecastingRecommendations(forecasting.value),
          generatedAt: Date.now()
        };

        this.setForecastCache(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Inventory forecasting failed', apiError);
      }
    }
  }

  /**
   * Get inventory alerts and notifications
   * @param {Object} params - Alert parameters
   * @returns {Promise<Object>} Alerts data
   */
  async getInventoryAlerts(params = {}) {
    const {
      severity = ['critical', 'warning'],
      category = null,
      location = null,
      includeHistorical = false,
      limit = 100
    } = params;

    try {
      const alerts = await httpService.get('/inventory/alerts', {
        severity,
        category,
        location,
        includeHistorical,
        limit,
        includeMetadata: true
      });

      return {
        ...alerts,
        categorized: this.categorizeAlerts(alerts.alerts || []),
        prioritized: this.prioritizeAlerts(alerts.alerts || []),
        actionItems: this.generateAlertActionItems(alerts.alerts || []),
        insights: this.generateAlertInsights(alerts.alerts || [])
      };
    } catch (error) {
      throw this.handleInventoryError('Inventory alerts fetch failed', error);
    }
  }

  /**
   * Create custom inventory alert rule
   * @param {Object} rule - Alert rule configuration
   * @returns {Promise<Object>} Rule creation response
   */
  async createAlertRule(rule) {
    const {
      name,
      description,
      conditions,
      severity = 'warning',
      channels = ['dashboard'],
      isActive = true
    } = rule;

    try {
      this.validateAlertRule(rule);

      const response = await httpService.post('/inventory/alert-rules', {
        name,
        description,
        conditions,
        severity,
        channels,
        isActive,
        createdAt: Date.now()
      });

      return {
        ...response,
        insights: this.generateRuleInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Alert rule creation failed', error);
    }
  }

  /**
   * Get inventory optimization recommendations
   * @param {Object} params - Optimization parameters
   * @returns {Promise<Object>} Optimization recommendations
   */
  async getOptimizationRecommendations(params = {}) {
    const {
      type = 'all', // 'stock_levels', 'reorder_points', 'safety_stock', 'cost', 'all'
      priority = 'high',
      includeImpactAnalysis = true,
      includeImplementationPlan = true
    } = params;

    const cacheKey = `optimization_${type}_${priority}`;
    
    if (this.getCachedData(cacheKey)) {
      return this.getCachedData(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockOptimizationRecommendations(params);
      this.setCachedData(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock optimization data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [recommendations, impactAnalysis, implementationPlan] = await Promise.allSettled([
          httpService.get('/analytics/inventory/optimization', {
            type,
            priority,
            includeRecommendations: true,
            includeReasoning: true
          }),
          includeImpactAnalysis ? httpService.get('/analytics/inventory/impact-analysis', {
            type,
            includeFinancial: true,
            includeOperational: true
          }) : Promise.resolve(null),
          includeImplementationPlan ? this.generateImplementationPlan(type) : Promise.resolve(null)
        ]);

        const result = {
          recommendations: recommendations.status === 'fulfilled' ? 
            this.processOptimizationRecommendations(recommendations.value) : null,
          impactAnalysis: impactAnalysis.status === 'fulfilled' ? impactAnalysis.value : null,
          implementationPlan: implementationPlan.status === 'fulfilled' ? implementationPlan.value : null,
          prioritizedActions: this.prioritizeOptimizationActions(recommendations.value),
          insights: this.generateOptimizationInsights(recommendations.value)
        };

        this.setCachedData(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Optimization recommendations fetch failed', apiError);
      }
    }
  }

  /**
   * Get inventory locations
   * @param {Object} params - Location parameters
   * @returns {Promise<Object>} Locations data
   */
  async getLocations(params = {}) {
    const {
      includeMetrics = true,
      includeCapacity = true,
      includeAlerts = true
    } = params;

    try {
      const [locations, metrics, alerts] = await Promise.allSettled([
        httpService.get('/inventory/locations'),
        includeMetrics ? httpService.get('/analytics/inventory/locations', {
          includeUtilization: true,
          includePerformance: true
        }) : Promise.resolve(null),
        includeAlerts ? httpService.get('/inventory/alerts', {
          groupBy: 'location',
          severity: ['critical', 'warning']
        }) : Promise.resolve(null)
      ]);

      const result = {
        locations: locations.status === 'fulfilled' ? locations.value : null,
        metrics: metrics.status === 'fulfilled' ? metrics.value : null,
        alerts: alerts.status === 'fulfilled' ? alerts.value : null,
        insights: this.generateLocationInsights(locations.value, metrics.value)
      };

      return result;
    } catch (error) {
      throw this.handleInventoryError('Locations fetch failed', error);
    }
  }

  /**
   * Create new inventory location
   * @param {Object} location - Location data
   * @returns {Promise<Object>} Creation response
   */
  async createLocation(location) {
    const {
      name,
      description = '',
      type = 'warehouse',
      capacity = null,
      address = null,
      contactInfo = null,
      isActive = true
    } = location;

    try {
      this.validateLocation(location);

      const response = await httpService.post('/inventory/locations', {
        name,
        description,
        type,
        capacity,
        address,
        contactInfo,
        isActive,
        createdAt: Date.now()
      });

      // Clear locations cache
      this.clearCache('location');

      return {
        ...response,
        insights: this.generateLocationCreationInsights(response)
      };
    } catch (error) {
      throw this.handleInventoryError('Location creation failed', error);
    }
  }

  // Data processing and analysis methods

  /**
   * Calculate item health score
   * @param {Object} item - Inventory item
   * @returns {number} Health score (0-1)
   */
  calculateItemHealthScore(item) {
    if (!item) return 0;

    let score = 0.5;
    
    // Stock level health
    if (item.currentStock > item.reorderPoint * 2) score += 0.2;
    else if (item.currentStock <= item.reorderPoint) score -= 0.3;
    
    // Turnover rate health
    if (item.turnoverRate > 8) score += 0.15;
    else if (item.turnoverRate < 2) score -= 0.15;
    
    // Age of inventory
    if (item.averageAge < 30) score += 0.1;
    else if (item.averageAge > 90) score -= 0.2;
    
    // Demand consistency
    if (item.demandVariability < 0.3) score += 0.15;
    else if (item.demandVariability > 0.7) score -= 0.15;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess stock risk level
   * @param {Object} item - Inventory item
   * @returns {string} Risk level
   */
  assessStockRisk(item) {
    if (!item) return 'unknown';

    const stockRatio = item.currentStock / (item.reorderPoint || 1);
    const demandRate = item.averageDailyDemand || 0;
    const leadTime = item.averageLeadTime || 7;

    if (stockRatio < 0.5 || (demandRate * leadTime > item.currentStock)) {
      return 'critical';
    } else if (stockRatio < 1 || (demandRate * leadTime * 1.5 > item.currentStock)) {
      return 'high';
    } else if (stockRatio < 1.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate item recommendations
   * @param {Object} item - Inventory item
   * @returns {Array} Recommendations
   */
  generateItemRecommendations(item) {
    const recommendations = [];

    if (!item) return recommendations;

    const riskLevel = this.assessStockRisk(item);
    
    if (riskLevel === 'critical') {
      recommendations.push({
        type: 'urgent_reorder',
        priority: 'high',
        description: 'Immediate reorder required to prevent stockout',
        action: 'Create emergency purchase order',
        impact: 'Prevents revenue loss from stockouts'
      });
    }

    if (item.turnoverRate < 2) {
      recommendations.push({
        type: 'slow_moving',
        priority: 'medium',
        description: 'Item has low turnover rate',
        action: 'Consider promotion or markdown',
        impact: 'Improves cash flow and reduces carrying costs'
      });
    }

    if (item.demandVariability > 0.7) {
      recommendations.push({
        type: 'demand_variability',
        priority: 'medium',
        description: 'High demand variability detected',
        action: 'Implement dynamic safety stock calculation',
        impact: 'Reduces stockout risk while minimizing excess inventory'
      });
    }

    return recommendations;
  }

  /**
   * Generate inventory insights
   * @param {Object} overview - Inventory overview
   * @param {Object} metrics - Inventory metrics
   * @param {Object} alerts - Inventory alerts
   * @returns {Array} Insights
   */
  generateInventoryInsights(overview, metrics, alerts) {
    const insights = [];

    if (overview?.summary) {
      const { totalValue, totalItems, lowStockItems } = overview.summary;
      
      if (lowStockItems > 0) {
        const percentage = ((lowStockItems / totalItems) * 100).toFixed(1);
        insights.push({
          type: 'warning',
          metric: 'low_stock_percentage',
          value: `${percentage}%`,
          description: `${lowStockItems} items (${percentage}%) are running low on stock`,
          priority: lowStockItems > totalItems * 0.1 ? 'high' : 'medium'
        });
      }
    }

    if (metrics?.turnoverRate) {
      const turnoverHealth = metrics.turnoverRate > 6 ? 'excellent' : 
                           metrics.turnoverRate > 4 ? 'good' : 
                           metrics.turnoverRate > 2 ? 'average' : 'poor';
      
      insights.push({
        type: turnoverHealth === 'poor' ? 'warning' : 'info',
        metric: 'inventory_turnover',
        value: metrics.turnoverRate.toFixed(1),
        description: `Inventory turnover rate is ${turnoverHealth}`,
        priority: turnoverHealth === 'poor' ? 'high' : 'low'
      });
    }

    if (alerts?.alerts?.length > 0) {
      const criticalAlerts = alerts.alerts.filter(a => a.severity === 'critical').length;
      if (criticalAlerts > 0) {
        insights.push({
          type: 'alert',
          metric: 'critical_alerts',
          value: criticalAlerts,
          description: `${criticalAlerts} critical inventory alerts require immediate attention`,
          priority: 'critical'
        });
      }
    }

    return insights;
  }

  // Validation methods

  /**
   * Validate stock adjustment
   * @param {Object} adjustment - Stock adjustment
   * @throws {ApiError} Validation error
   */
  validateStockAdjustment(adjustment) {
    if (!adjustment.quantity || isNaN(adjustment.quantity)) {
      throw new ApiError('Valid quantity is required', 400, 'INVALID_QUANTITY');
    }

    if (!adjustment.type || !['manual', 'sale', 'purchase', 'transfer', 'adjustment'].includes(adjustment.type)) {
      throw new ApiError('Valid adjustment type is required', 400, 'INVALID_TYPE');
    }

    if (adjustment.quantity < 0 && !adjustment.reason) {
      throw new ApiError('Reason is required for stock reductions', 400, 'REASON_REQUIRED');
    }
  }

  /**
   * Validate stock transfer
   * @param {Object} transfer - Stock transfer
   * @throws {ApiError} Validation error
   */
  validateStockTransfer(transfer) {
    if (!transfer.productId) {
      throw new ApiError('Product ID is required', 400, 'PRODUCT_ID_REQUIRED');
    }

    if (!transfer.fromLocation || !transfer.toLocation) {
      throw new ApiError('Both from and to locations are required', 400, 'LOCATIONS_REQUIRED');
    }

    if (transfer.fromLocation === transfer.toLocation) {
      throw new ApiError('From and to locations cannot be the same', 400, 'SAME_LOCATION');
    }

    if (!transfer.quantity || transfer.quantity <= 0) {
      throw new ApiError('Valid positive quantity is required', 400, 'INVALID_QUANTITY');
    }
  }

  /**
   * Validate alert rule
   * @param {Object} rule - Alert rule
   * @throws {ApiError} Validation error
   */
  validateAlertRule(rule) {
    if (!rule.name || rule.name.trim().length === 0) {
      throw new ApiError('Rule name is required', 400, 'NAME_REQUIRED');
    }

    if (!rule.conditions || !Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      throw new ApiError('At least one condition is required', 400, 'CONDITIONS_REQUIRED');
    }

    if (!['critical', 'warning', 'info'].includes(rule.severity)) {
      throw new ApiError('Valid severity level is required', 400, 'INVALID_SEVERITY');
    }
  }

  /**
   * Validate location
   * @param {Object} location - Location data
   * @throws {ApiError} Validation error
   */
  validateLocation(location) {
    if (!location.name || location.name.trim().length === 0) {
      throw new ApiError('Location name is required', 400, 'NAME_REQUIRED');
    }

    if (location.type && !['warehouse', 'store', 'distribution_center', 'factory'].includes(location.type)) {
      throw new ApiError('Valid location type is required', 400, 'INVALID_TYPE');
    }
  }

  // Cache management methods

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Clean old entries
    if (this.cache.size > 50) {
      const oldEntries = Array.from(this.cache.entries())
        .filter(([_, value]) => Date.now() - value.timestamp > this.cacheTimeout);
      
      oldEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Get forecast cache data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached forecast data
   */
  getForecastCache(key) {
    const cached = this.forecastCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.forecastCacheTimeout) {
      return cached.data;
    }
    this.forecastCache.delete(key);
    return null;
  }

  /**
   * Set forecast cache data
   * @param {string} key - Cache key
   * @param {Object} data - Forecast data to cache
   */
  setForecastCache(key, data) {
    this.forecastCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   * @param {string} pattern - Pattern to match keys
   */
  clearCache(pattern = null) {
    if (pattern) {
      const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Handle inventory-specific errors
   * @param {string} message - Error message
   * @param {Error} originalError - Original error
   * @returns {ApiError} Formatted error
   */
  handleInventoryError(message, originalError) {
    if (originalError instanceof ApiError) {
      return new ApiError(
        `${message}: ${originalError.message}`,
        originalError.status,
        originalError.code,
        originalError.data
      );
    }
    
    return new ApiError(
      message,
      500,
      'INVENTORY_ERROR',
      { originalError: originalError.message }
    );
  }

  // Placeholder methods for additional functionality
  // These would be fully implemented based on specific business requirements

  getItemForecasting(productId) {
    return Promise.resolve({ productId, forecast: 'placeholder' });
  }

  getItemRecommendations(productId) {
    return Promise.resolve([{ type: 'placeholder', productId }]);
  }

  performRiskAssessment(item) {
    return { riskLevel: this.assessStockRisk(item), factors: [] };
  }

  generateItemInsights(item) {
    return this.generateItemRecommendations(item);
  }

  generateAdjustmentInsights(response) {
    return [{ type: 'success', description: 'Stock adjustment completed successfully' }];
  }

  generatePostAdjustmentRecommendations(response) {
    return [{ type: 'monitor', description: 'Monitor stock levels for next 7 days' }];
  }

  generateBulkAdjustmentSummary(response) {
    return { successful: response.successful?.length || 0, failed: response.failed?.length || 0 };
  }

  generateBulkAdjustmentInsights(response) {
    return [{ type: 'summary', description: 'Bulk adjustment completed' }];
  }

  generateTransferInsights(response) {
    return [{ type: 'transfer', description: 'Stock transfer initiated successfully' }];
  }

  generateForecastingInsights(forecasting, reorderPoints) {
    return [{ type: 'forecasting', description: 'Forecasting data available' }];
  }

  generateForecastingRecommendations(forecasting) {
    return [{ type: 'forecast_recommendation', description: 'Review forecasting recommendations' }];
  }

  categorizeAlerts(alerts) {
    return alerts.reduce((acc, alert) => {
      acc[alert.category] = acc[alert.category] || [];
      acc[alert.category].push(alert);
      return acc;
    }, {});
  }

  prioritizeAlerts(alerts) {
    return alerts.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1 };
      return (priority[b.severity] || 0) - (priority[a.severity] || 0);
    });
  }

  generateAlertActionItems(alerts) {
    return alerts.map(alert => ({
      alertId: alert.id,
      action: `Address ${alert.severity} alert: ${alert.message}`,
      priority: alert.severity
    }));
  }

  generateAlertInsights(alerts) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    return criticalCount > 0 ? [
      { type: 'alert', description: `${criticalCount} critical alerts need immediate attention` }
    ] : [];
  }

  generateRuleInsights(response) {
    return [{ type: 'rule_created', description: 'Alert rule created successfully' }];
  }

  processOptimizationRecommendations(recommendations) {
    return recommendations;
  }

  prioritizeOptimizationActions(recommendations) {
    return recommendations?.actions?.sort((a, b) => 
      (b.priority_score || 0) - (a.priority_score || 0)) || [];
  }

  generateOptimizationInsights(recommendations) {
    return [{ type: 'optimization', description: 'Optimization recommendations available' }];
  }

  generateImplementationPlan(type) {
    return Promise.resolve({ type, plan: 'Implementation plan placeholder' });
  }

  generateLocationInsights(locations, metrics) {
    return [{ type: 'location_info', description: 'Location data available' }];
  }

  generateLocationCreationInsights(response) {
    return [{ type: 'location_created', description: 'New location created successfully' }];
  }

  generateListInsights(items) {
    if (!items || items.length === 0) return [];
    const lowStockCount = items.filter(item => 
      this.assessStockRisk(item) === 'critical' || this.assessStockRisk(item) === 'high').length;
    
    return lowStockCount > 0 ? [
      { type: 'warning', description: `${lowStockCount} items need immediate attention` }
    ] : [];
  }

  /**
   * Generate mock inventory overview data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockInventoryOverview(params = {}) {
    return {
      overview: {
        overallHealth: 75,
        totalValue: 450000,
        totalItems: 1245,
        categories: [
          {
            id: 'electronics',
            name: 'Electronics',
            icon: 'laptop',
            health: 85,
            stockLevel: 92,
            turnoverRate: 78,
            expiredItems: 0,
            lowStockItems: 3,
            issues: [
              { type: 'low-stock', text: '3 items below reorder point', severity: 'medium' }
            ]
          },
          {
            id: 'clothing',
            name: 'Clothing',
            icon: 'shirt',
            health: 68,
            stockLevel: 76,
            turnoverRate: 65,
            expiredItems: 5,
            lowStockItems: 12,
            issues: [
              { type: 'low-stock', text: '12 items below reorder point', severity: 'warning' },
              { type: 'expired', text: '5 expired items need attention', severity: 'high' }
            ]
          },
          {
            id: 'groceries',
            name: 'Groceries',
            icon: 'shopping-cart',
            health: 72,
            stockLevel: 68,
            turnoverRate: 85,
            expiredItems: 15,
            lowStockItems: 23,
            issues: [
              { type: 'expired', text: '15 expired items need removal', severity: 'critical' },
              { type: 'low-stock', text: '23 items critically low', severity: 'high' }
            ]
          }
        ]
      },
      alerts: {
        alerts: [
          {
            id: 'alert-1',
            title: 'Critical Stock Level',
            message: 'Multiple items are below critical threshold',
            severity: 'critical',
            type: 'stock',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            items: ['Milk 1L', 'Bread Loaf', 'Eggs 12pk']
          },
          {
            id: 'alert-2',
            title: 'Expiring Soon',
            message: 'Items expiring within 3 days',
            severity: 'warning',
            type: 'expiration',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            items: ['Yogurt', 'Cheese', 'Fresh Meat']
          }
        ]
      },
      insights: [
        {
          type: 'optimization',
          title: 'Stock Optimization Opportunity',
          description: 'Consider rebalancing inventory across categories',
          impact: 'medium',
          actionable: true
        },
        {
          type: 'trend',
          title: 'Seasonal Demand Increase',
          description: 'Electronics showing 15% higher demand',
          impact: 'high',
          actionable: false
        }
      ]
    };
  }

  /**
   * Generate mock inventory forecasting data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockInventoryForecasting(params = {}) {
    return {
      forecasting: {
        products: [
          {
            id: 'product-1',
            name: 'Premium Coffee Beans',
            currentStock: 45,
            predictedOutDate: '2025-01-25',
            daysRemaining: 8,
            suggestedOrder: '150 units',
            confidence: 94,
            urgency: 'critical',
            supplier: 'Coffee Masters Inc.'
          },
          {
            id: 'product-2',
            name: 'Organic Milk 1L',
            currentStock: 28,
            predictedOutDate: '2025-01-28',
            daysRemaining: 11,
            suggestedOrder: '200 units',
            confidence: 89,
            urgency: 'warning',
            supplier: 'Fresh Dairy Co.'
          },
          {
            id: 'product-3',
            name: 'Wireless Headphones',
            currentStock: 156,
            predictedOutDate: '2025-02-15',
            daysRemaining: 29,
            suggestedOrder: '75 units',
            confidence: 78,
            urgency: 'normal',
            supplier: 'Tech Supplies Ltd.'
          }
        ]
      }
    };
  }

  /**
   * Get seasonal demand forecasting data
   * @param {Object} params - Forecasting parameters
   * @returns {Promise<Object>} Seasonal forecasting data
   */
  async getSeasonalForecasting(params = {}) {
    const {
      timeHorizon = '12m',
      categories = null,
      includeHistorical = true,
      includePatterns = true,
      includePredictions = true
    } = params;

    const cacheKey = `seasonal_forecasting_${timeHorizon}_${JSON.stringify({ categories })}`;
    
    if (this.getForecastCache(cacheKey)) {
      return this.getForecastCache(cacheKey);
    }

    // TODO: Replace with real API calls once backend endpoints are implemented
    // For now, return mock data to prevent 404 errors
    try {
      const mockData = this.getMockSeasonalForecasting(params);
      this.setForecastCache(cacheKey, mockData);
      return mockData;
    } catch (error) {
      console.warn('Mock seasonal forecasting data failed, falling back to real API calls:', error);
      
      try {
        // Fallback to real API calls if mock fails
        const [forecasting, patterns, predictions] = await Promise.allSettled([
          httpService.get('/analytics/inventory/seasonal-forecasting', {
            timeHorizon,
            categories,
            includeHistorical,
            includeConfidence: true
          }),
          includePatterns ? httpService.get('/analytics/seasonal-patterns', {
            timeHorizon,
            categories,
            includeCorrelations: true
          }) : Promise.resolve(null),
          includePredictions ? httpService.get('/analytics/demand-predictions', {
            timeHorizon,
            categories,
            includeScenarios: true
          }) : Promise.resolve(null)
        ]);

        const result = {
          forecasting: forecasting.status === 'fulfilled' ? forecasting.value : null,
          patterns: patterns.status === 'fulfilled' ? patterns.value : null,
          predictions: predictions.status === 'fulfilled' ? predictions.value : null,
          insights: this.generateSeasonalInsights(forecasting.value, patterns.value),
          recommendations: this.generateSeasonalRecommendations(forecasting.value),
          generatedAt: Date.now()
        };

        this.setForecastCache(cacheKey, result);
        return result;
      } catch (apiError) {
        throw this.handleInventoryError('Seasonal forecasting fetch failed', apiError);
      }
    }
  }

  /**
   * Generate mock optimization recommendations data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockOptimizationRecommendations(params = {}) {
    const { type = 'all' } = params;
    
    const allRecommendations = [
      {
        id: 'opt-1',
        type: 'stock_levels',
        priority: 'critical',
        title: 'Optimize Stock Levels for Electronics',
        description: 'Current stock levels for smartphones and tablets are suboptimal. AI analysis suggests adjusting inventory levels to reduce holding costs while maintaining service levels.',
        confidence: 94,
        affectedProducts: 23,
        estimatedSavings: 24500,
        implementationEffort: 'Medium',
        impact: {
          costSavings: '$24,500',
          inventoryReduction: '15%',
          serviceLevel: '97%',
          paybackPeriod: '2.3 months'
        },
        actions: [
          'Reduce iPhone 15 stock by 20 units',
          'Increase Samsung Galaxy stock by 12 units',
          'Implement dynamic reorder points'
        ],
        reasoning: 'Machine learning analysis of sales velocity and demand patterns',
        category: 'electronics'
      },
      {
        id: 'opt-2',
        type: 'reorder_points',
        priority: 'high',
        title: 'Adjust Reorder Points for Seasonal Items',
        description: 'Historical demand patterns indicate reorder points for seasonal items should be adjusted to prevent stockouts during peak periods.',
        confidence: 89,
        affectedProducts: 45,
        estimatedSavings: 18200,
        implementationEffort: 'Low',
        impact: {
          stockoutReduction: '78%',
          serviceImprovement: '12%',
          customerSatisfaction: '+8.5%',
          revenueIncrease: '$18,200'
        },
        actions: [
          'Increase winter clothing reorder points by 30%',
          'Implement seasonal multipliers',
          'Set up automated alerts'
        ],
        reasoning: 'Seasonal demand analysis with weather correlation',
        category: 'clothing'
      },
      {
        id: 'opt-3',
        type: 'safety_stock',
        priority: 'medium',
        title: 'Optimize Safety Stock Calculations',
        description: 'Current safety stock calculations are based on static formulas. Dynamic safety stock based on demand variability will improve efficiency.',
        confidence: 87,
        affectedProducts: 89,
        estimatedSavings: 31800,
        implementationEffort: 'High',
        impact: {
          inventoryReduction: '$31,800',
          spaceUtilization: '+22%',
          carryingCosts: '-18%',
          fillRate: '99.2%'
        },
        actions: [
          'Implement variable safety stock formula',
          'Reduce safety stock for fast-moving items',
          'Increase safety stock for critical items'
        ],
        reasoning: 'Statistical analysis of demand variability patterns',
        category: 'all'
      },
      {
        id: 'opt-4',
        type: 'cost',
        priority: 'high',
        title: 'Supplier Contract Renegotiation',
        description: 'Analysis reveals opportunities to reduce procurement costs through supplier consolidation and bulk purchasing agreements.',
        confidence: 92,
        affectedProducts: 156,
        estimatedSavings: 42300,
        implementationEffort: 'Medium',
        impact: {
          costReduction: '$42,300',
          leadTimeImprovement: '2.5 days',
          qualityScore: '+15%',
          supplierRating: '4.8/5'
        },
        actions: [
          'Consolidate suppliers from 12 to 8',
          'Negotiate volume discounts',
          'Implement preferred vendor agreements'
        ],
        reasoning: 'Supplier performance and cost analysis',
        category: 'procurement'
      }
    ];

    const filteredRecommendations = type === 'all' 
      ? allRecommendations 
      : allRecommendations.filter(rec => rec.type === type);

    return {
      recommendations: filteredRecommendations,
      impactAnalysis: {
        totalPotentialSavings: filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0),
        averageConfidence: Math.round(
          filteredRecommendations.reduce((sum, rec) => sum + rec.confidence, 0) / filteredRecommendations.length
        ),
        timeToValue: '2-6 months',
        riskLevel: 'low',
        implementationComplexity: 'medium'
      },
      implementationPlan: {
        phases: [
          {
            name: 'Quick Wins',
            duration: '1-2 weeks',
            recommendations: filteredRecommendations.filter(r => r.implementationEffort === 'Low').map(r => r.id)
          },
          {
            name: 'Medium Impact',
            duration: '1-2 months',
            recommendations: filteredRecommendations.filter(r => r.implementationEffort === 'Medium').map(r => r.id)
          },
          {
            name: 'Strategic Initiatives',
            duration: '3-6 months',
            recommendations: filteredRecommendations.filter(r => r.implementationEffort === 'High').map(r => r.id)
          }
        ]
      },
      insights: [
        {
          type: 'opportunity',
          description: `${filteredRecommendations.length} optimization opportunities identified`,
          priority: 'high'
        },
        {
          type: 'savings',
          description: `Potential annual savings of $${filteredRecommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0).toLocaleString()}`,
          priority: 'high'
        }
      ],
      generatedAt: Date.now()
    };
  }

  /**
   * Generate mock seasonal forecasting data
   * TODO: Remove when backend endpoints are implemented
   */
  getMockSeasonalForecasting(params = {}) {
    const { timeHorizon = '12m', categories = null } = params;
    
    // Generate seasonal patterns based on historical retail data
    const seasonalPatterns = [
      {
        id: 'winter-electronics',
        season: 'winter',
        category: 'Electronics',
        peakMonths: ['November', 'December'],
        demandIncrease: 45,
        confidence: 94,
        historicalData: {
          year2023: { increase: 42, accuracy: 91 },
          year2024: { increase: 48, accuracy: 96 },
          year2025: { increase: 45, accuracy: 94 }
        },
        drivingFactors: ['Holiday shopping', 'Gift giving', 'Black Friday', 'End of year bonuses'],
        affectedProducts: ['Gaming Consoles', 'Smart TVs', 'Headphones', 'Smartphones'],
        recommendedActions: [
          'Increase stock levels by 40% in October',
          'Secure additional suppliers',
          'Plan promotional campaigns'
        ]
      },
      {
        id: 'spring-clothing',
        season: 'spring',
        category: 'Clothing & Fashion',
        peakMonths: ['March', 'April', 'May'],
        demandIncrease: 32,
        confidence: 87,
        historicalData: {
          year2023: { increase: 35, accuracy: 85 },
          year2024: { increase: 29, accuracy: 89 },
          year2025: { increase: 32, accuracy: 87 }
        },
        drivingFactors: ['Weather transition', 'Easter holiday', 'Spring break', 'Wedding season'],
        affectedProducts: ['Spring Jackets', 'Dresses', 'Casual Wear', 'Shoes'],
        recommendedActions: [
          'Launch spring collection early',
          'Clear winter inventory',
          'Focus on trending colors'
        ]
      },
      {
        id: 'summer-outdoors',
        season: 'summer',
        category: 'Sports & Outdoors',
        peakMonths: ['June', 'July', 'August'],
        demandIncrease: 78,
        confidence: 91,
        historicalData: {
          year2023: { increase: 75, accuracy: 88 },
          year2024: { increase: 82, accuracy: 93 },
          year2025: { increase: 78, accuracy: 91 }
        },
        drivingFactors: ['Summer vacation', 'Outdoor activities', 'Sports season', 'Pool season'],
        affectedProducts: ['Camping Gear', 'Sports Equipment', 'Pool Supplies', 'Outdoor Furniture'],
        recommendedActions: [
          'Stock up on popular outdoor items',
          'Partner with tourism businesses',
          'Plan summer promotions'
        ]
      },
      {
        id: 'autumn-home',
        season: 'autumn',
        category: 'Home & Garden',
        peakMonths: ['September', 'October'],
        demandIncrease: 28,
        confidence: 82,
        historicalData: {
          year2023: { increase: 25, accuracy: 79 },
          year2024: { increase: 31, accuracy: 84 },
          year2025: { increase: 28, accuracy: 82 }
        },
        drivingFactors: ['Back to school', 'Home preparation', 'Garden maintenance', 'Holiday prep'],
        affectedProducts: ['Home Decor', 'Gardening Tools', 'Heating Equipment', 'Storage Solutions'],
        recommendedActions: [
          'Focus on home comfort items',
          'Prepare for heating season',
          'Market organization products'
        ]
      },
      {
        id: 'holiday-gifting',
        season: 'holiday',
        category: 'All Categories',
        peakMonths: ['November', 'December'],
        demandIncrease: 156,
        confidence: 96,
        historicalData: {
          year2023: { increase: 149, accuracy: 95 },
          year2024: { increase: 163, accuracy: 97 },
          year2025: { increase: 156, accuracy: 96 }
        },
        drivingFactors: ['Christmas shopping', 'Holiday parties', 'Gift giving', 'Year-end celebrations'],
        affectedProducts: ['Gift Cards', 'Jewelry', 'Toys', 'Books', 'Food & Beverages'],
        recommendedActions: [
          'Increase inventory across all categories',
          'Enhance gift wrapping services',
          'Extend operating hours'
        ]
      }
    ];

    // Generate demand forecast periods
    const months = timeHorizon === '6m' ? 6 : timeHorizon === '12m' ? 12 : timeHorizon === '18m' ? 18 : 24;
    const forecastPeriods = [];
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const month = date.getMonth();
      const monthName = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      
      // Calculate seasonal multiplier based on patterns
      const seasonalMultiplier = this.calculateSeasonalMultiplier(month);
      const baselineDemand = 1000;
      const forecastedDemand = Math.round(baselineDemand * seasonalMultiplier);
      
      // Add some realistic variance
      const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
      const adjustedDemand = Math.round(forecastedDemand * (1 + variance));
      
      forecastPeriods.push({
        period: `${monthName} ${year}`,
        month: monthName,
        year: year,
        baseline: baselineDemand,
        forecasted: adjustedDemand,
        seasonalMultiplier: seasonalMultiplier,
        trendPercentage: ((seasonalMultiplier - 1) * 100).toFixed(1),
        confidence: Math.round(85 + Math.random() * 10), // 85-95% confidence
        factors: this.getSeasonalFactors(month),
        categories: this.getCategoryForecasts(month, baselineDemand)
      });
    }

    return {
      forecasting: {
        periods: forecastPeriods,
        overallAccuracy: 89,
        confidenceRange: '85-95%',
        lastUpdated: Date.now(),
        modelVersion: '2.1.0',
        trainingData: '5 years historical data'
      },
      patterns: seasonalPatterns.filter(pattern => 
        !categories || categories.includes(pattern.category) || pattern.category === 'All Categories'
      ),
      insights: [
        {
          type: 'trend',
          title: 'Strong Holiday Season Expected',
          description: 'Forecasting shows 156% increase in demand during November-December',
          confidence: 96,
          impact: 'high',
          actionable: true,
          recommendation: 'Begin inventory buildup in September'
        },
        {
          type: 'opportunity',
          title: 'Summer Sports Equipment Surge',
          description: 'Sports & outdoors category showing 78% seasonal increase',
          confidence: 91,
          impact: 'medium',
          actionable: true,
          recommendation: 'Partner with local sports organizations'
        },
        {
          type: 'warning',
          title: 'Winter Clothing Clearance Needed',
          description: 'Post-winter demand drops significantly, plan clearance sales',
          confidence: 88,
          impact: 'medium',
          actionable: true,
          recommendation: 'Start clearance sales in February'
        }
      ],
      recommendations: [
        {
          id: 'seasonal-1',
          title: 'Optimize Holiday Inventory',
          description: 'Increase inventory levels by 40-60% for November-December peak',
          priority: 'high',
          estimatedImpact: '$125,000 additional revenue',
          implementation: 'Begin October 1st',
          confidence: 96
        },
        {
          id: 'seasonal-2',
          title: 'Summer Outdoor Expansion',
          description: 'Expand sports and outdoor equipment selection for summer season',
          priority: 'medium',
          estimatedImpact: '$45,000 additional revenue',
          implementation: 'Begin May 1st',
          confidence: 91
        },
        {
          id: 'seasonal-3',
          title: 'Spring Fashion Focus',
          description: 'Launch targeted spring fashion campaigns in March-April',
          priority: 'medium',
          estimatedImpact: '$32,000 additional revenue',
          implementation: 'Begin February 15th',
          confidence: 87
        }
      ],
      summary: {
        overallTrend: 18.5,
        peakSeason: 'Holiday (Nov-Dec)',
        expectedIncrease: '156%',
        riskLevel: 'low',
        forecastReliability: 89,
        keyOpportunities: 3,
        seasonalImpact: 'high'
      },
      generatedAt: Date.now()
    };
  }

  /**
   * Calculate seasonal demand multiplier for a given month
   * @param {number} month - Month (0-11)
   * @returns {number} Seasonal multiplier
   */
  calculateSeasonalMultiplier(month) {
    const seasonalPatterns = {
      0: 0.75,  // January - post-holiday slowdown
      1: 0.85,  // February - gradual recovery
      2: 1.15,  // March - spring surge
      3: 1.20,  // April - spring peak
      4: 1.10,  // May - spring maintenance
      5: 1.35,  // June - summer start
      6: 1.40,  // July - summer peak
      7: 1.30,  // August - back to school
      8: 1.05,  // September - autumn start
      9: 1.10,  // October - autumn activities
      10: 1.45, // November - holiday prep
      11: 2.20  // December - holiday peak
    };
    
    return seasonalPatterns[month] || 1.0;
  }

  /**
   * Get seasonal factors for a given month
   * @param {number} month - Month (0-11)
   * @returns {Array} Seasonal factors
   */
  getSeasonalFactors(month) {
    const factorsByMonth = {
      0: ['Post-holiday recovery', 'New Year resolutions', 'January sales'],
      1: ['Valentine\'s Day', 'Winter sports', 'Indoor activities'],
      2: ['Spring preparation', 'Easter shopping', 'Garden planning'],
      3: ['Easter holiday', 'Spring cleaning', 'Wardrobe refresh'],
      4: ['Mother\'s Day', 'Graduation season', 'Wedding planning'],
      5: ['Summer vacation prep', 'Father\'s Day', 'Outdoor activities start'],
      6: ['Peak summer', 'Vacation season', 'BBQ and outdoor dining'],
      7: ['Back to school prep', 'Late summer activities', 'Vacation end'],
      8: ['Back to school', 'Fall preparation', 'Home organization'],
      9: ['Halloween prep', 'Autumn activities', 'Home comfort'],
      10: ['Thanksgiving', 'Black Friday', 'Holiday shopping starts'],
      11: ['Christmas shopping', 'Holiday parties', 'Year-end celebrations']
    };
    
    return factorsByMonth[month] || ['Seasonal variation'];
  }

  /**
   * Get category-specific forecasts for a given month
   * @param {number} month - Month (0-11)
   * @param {number} baseline - Baseline demand
   * @returns {Object} Category forecasts
   */
  getCategoryForecasts(month, baseline) {
    const categories = {
      electronics: this.calculateSeasonalMultiplier(month) * (month === 11 ? 1.5 : 1.0),
      clothing: this.calculateSeasonalMultiplier(month) * ([2,3,4].includes(month) ? 1.3 : 1.0),
      home_garden: this.calculateSeasonalMultiplier(month) * ([8,9].includes(month) ? 1.2 : 1.0),
      sports_outdoors: this.calculateSeasonalMultiplier(month) * ([5,6,7].includes(month) ? 1.6 : 1.0),
      food_beverages: this.calculateSeasonalMultiplier(month) * ([10,11].includes(month) ? 1.4 : 1.0)
    };
    
    const result = {};
    Object.entries(categories).forEach(([category, multiplier]) => {
      result[category] = Math.round(baseline * multiplier);
    });
    
    return result;
  }

  /**
   * Generate seasonal insights
   * @param {Object} forecasting - Forecasting data
   * @param {Object} patterns - Seasonal patterns
   * @returns {Array} Insights
   */
  generateSeasonalInsights(forecasting, patterns) {
    return [
      { type: 'seasonal', description: 'Seasonal forecasting analysis available' }
    ];
  }

  /**
   * Generate seasonal recommendations
   * @param {Object} forecasting - Forecasting data
   * @returns {Array} Recommendations
   */
  generateSeasonalRecommendations(forecasting) {
    return [
      { type: 'seasonal_recommendation', description: 'Review seasonal recommendations' }
    ];
  }
}

// Export singleton instance
const inventoryService = new InventoryService();

export default inventoryService;
export { InventoryService };