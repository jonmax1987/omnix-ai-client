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

    try {
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
    } catch (error) {
      throw this.handleInventoryError('Inventory overview fetch failed', error);
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

    try {
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
    } catch (error) {
      throw this.handleInventoryError('Inventory forecasting failed', error);
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

    try {
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

      return result;
    } catch (error) {
      throw this.handleInventoryError('Optimization recommendations fetch failed', error);
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
}

// Export singleton instance
const inventoryService = new InventoryService();

export default inventoryService;
export { InventoryService };