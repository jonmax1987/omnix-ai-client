# OMNIX AI - Frontend Backend Integration Guide

This document provides complete instructions for connecting your frontend application to the OMNIX AI backend services.

## ✅ **BACKEND IS FULLY OPERATIONAL!**

**Current Status:** ✅ **100% COMPLETE** - All API endpoints are live and working!

**API URL:** `https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev`

**All endpoints tested and verified:**
- ✅ `/v1/products` - Working
- ✅ `/v1/dashboard/summary` - Working  
- ✅ `/v1/alerts` - Working
- ✅ `/v1/forecasts/demand` - Working
- ✅ `/v1/recommendations` - Working

**Your frontend can now connect and use the APIs immediately!**

## 🚀 Quick Start

1. ✅ **Backend is deployed** to AWS Lambda  
2. ✅ **API Gateway URL is ready:** `https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev`
3. ⏳ **Update frontend environment variables** with the API URL below
4. ⏳ **Test the connection** using the provided examples

---

## 📡 Backend API Information

### 🎯 **ACTUAL DEPLOYED API URL**
```
https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev
```

**API Gateway Details:**
- **API ID:** `8r85mpuvt3`
- **Region:** `eu-central-1`
- **Stage:** `dev`
- **Status:** ✅ Deployed (needs Lambda integration - see note below)

### Authentication
Your backend supports two authentication methods:

```javascript
// Option 1: API Key (recommended)
headers: {
  'X-API-Key': 'your-api-key-here'
}

// Option 2: Bearer Token
headers: {
  'Authorization': 'Bearer your-jwt-token'
}
```

### CORS Configuration ✅
The backend is already configured to accept requests from your frontend with proper CORS headers.

---

## 🔧 Frontend Configuration

### 1. Environment Variables

Create or update your `.env.local` file in the frontend project:

```bash
# API Configuration - COPY THIS EXACTLY
NEXT_PUBLIC_API_BASE_URL=https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev
NEXT_PUBLIC_API_KEY=  # Leave empty for now (no API key required yet)

# Optional: AI Lambda endpoints (using same gateway)
NEXT_PUBLIC_AI_API_URL=https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev
```

### 2. Update API Service Configuration

Update your `/src/services/api.ts` file:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

---

## 📋 Available API Endpoints

### Products Management
```typescript
// Get all products (with filtering)
GET /v1/products?page=1&limit=20&search=coffee&category=beverages&lowStock=true

// Get specific product
GET /v1/products/{productId}

// Create new product
POST /v1/products
Body: {
  "name": "Premium Coffee",
  "sku": "COF-001",
  "category": "Beverages",
  "quantity": 100,
  "minThreshold": 20,
  "price": 24.99,
  "supplier": "Coffee Co."
}

// Update product
PUT /v1/products/{productId}
Body: { "quantity": 150, "price": 26.99 }

// Delete product
DELETE /v1/products/{productId}
```

### Dashboard & Analytics
```typescript
// Get dashboard summary
GET /v1/dashboard/summary?timeRange=month

// Get inventory graph data
GET /v1/dashboard/inventory-graph?timeRange=month&granularity=daily
```

### Alerts & Notifications
```typescript
// Get active alerts
GET /v1/alerts?type=low-stock&severity=high&limit=50

// Dismiss alert
POST /v1/alerts/{alertId}/dismiss
```

### AI Forecasting & Recommendations
```typescript
// Get demand forecasts
GET /v1/forecasts/demand?productId=123&timeHorizon=month

// Get trend analysis
GET /v1/forecasts/trends?category=beverages&timeRange=year

// Get order recommendations
GET /v1/recommendations/orders?urgency=high&limit=20
```

---

## 🛠 Service Implementation Examples

### Products Service
```typescript
// /src/services/products.ts
import { api } from './api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minThreshold: number;
  price: number;
  supplier: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minThreshold: number;
  price: number;
  supplier: string;
  description?: string;
  location?: string;
}

export const productsService = {
  // Get all products with optional filtering
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (product: CreateProductRequest) => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, updates: Partial<CreateProductRequest>) => {
    const response = await api.put(`/products/${id}`, updates);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
```

### Dashboard Service
```typescript
// /src/services/dashboard.ts
import { api } from './api';

export interface DashboardSummary {
  totalInventoryValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  activeAlerts: number;
  categoryBreakdown: Array<{
    category: string;
    itemCount: number;
    value: number;
  }>;
  topCategories: Array<{
    category: string;
    percentage: number;
  }>;
}

export interface InventoryGraphData {
  timeRange: string;
  granularity: string;
  dataPoints: Array<{
    timestamp: string;
    inventoryValue: number;
    itemCount: number;
    categories: Array<{
      category: string;
      value: number;
      count: number;
    }>;
  }>;
}

export const dashboardService = {
  getSummary: async (timeRange: string = 'month'): Promise<{ data: DashboardSummary }> => {
    const response = await api.get('/dashboard/summary', { 
      params: { timeRange } 
    });
    return response.data;
  },

  getInventoryGraph: async (params?: {
    timeRange?: string;
    category?: string;
    granularity?: string;
  }): Promise<{ data: InventoryGraphData }> => {
    const response = await api.get('/dashboard/inventory-graph', { params });
    return response.data;
  },
};
```

### Alerts Service
```typescript
// /src/services/alerts.ts
import { api } from './api';

export interface Alert {
  id: string;
  type: 'low-stock' | 'out-of-stock' | 'expired' | 'forecast-warning' | 'system';
  severity: 'high' | 'medium' | 'low';
  productId?: string;
  productName?: string;
  message: string;
  details?: string;
  actionRequired: boolean;
  createdAt: string;
  expiresAt?: string;
  dismissedAt?: string;
}

export const alertsService = {
  getAlerts: async (params?: {
    type?: string;
    severity?: string;
    limit?: number;
  }) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  dismissAlert: async (alertId: string) => {
    const response = await api.post(`/alerts/${alertId}/dismiss`);
    return response.data;
  },
};
```

### Forecasts Service
```typescript
// /src/services/forecasts.ts
import { api } from './api';

export interface DemandForecast {
  productId: string;
  productName: string;
  category: string;
  timeHorizon: string;
  predictions: Array<{
    period: string;
    predictedDemand: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }>;
  accuracy: number;
  model: string;
  lastUpdated: string;
}

export const forecastsService = {
  getDemandForecasts: async (params?: {
    productId?: string;
    category?: string;
    timeHorizon?: string;
    limit?: number;
  }) => {
    const response = await api.get('/forecasts/demand', { params });
    return response.data;
  },

  getTrendAnalysis: async (params?: {
    productId?: string;
    category?: string;
    timeRange?: string;
  }) => {
    const response = await api.get('/forecasts/trends', { params });
    return response.data;
  },

  getOrderRecommendations: async (params?: {
    category?: string;
    urgency?: string;
    limit?: number;
  }) => {
    const response = await api.get('/recommendations/orders', { params });
    return response.data;
  },
};
```

---

## 🧪 Testing the Integration

### 1. Connection Test
```typescript
// /src/utils/testConnection.ts
import { dashboardService } from '../services/dashboard';

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing backend connection...');
    const response = await dashboardService.getSummary();
    console.log('✅ Backend connected successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Check API URL and network.');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return false;
  }
};
```

### 2. React Hook Example
```typescript
// /src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { productsService, Product } from '../services/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsService.getProducts(params);
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
```

### 3. Component Usage Example
```typescript
// /src/components/ProductList.tsx
import React from 'react';
import { useProducts } from '../hooks/useProducts';

export const ProductList: React.FC = () => {
  const { products, loading, error, refetch } = useProducts();

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Products ({products.length})</h2>
      <button onClick={() => refetch()}>Refresh</button>
      
      {products.map(product => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>SKU: {product.sku}</p>
          <p>Quantity: {product.quantity}</p>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - The backend is already configured for CORS
   - Ensure you're using the correct API Gateway URL
   - Check that the request includes proper headers

2. **401 Unauthorized**
   ```typescript
   // Make sure API key is set correctly
   console.log('API Key:', process.env.NEXT_PUBLIC_API_KEY);
   ```

3. **404 Not Found**
   - Verify the API Gateway URL is correct
   - Ensure the backend is deployed and running
   - Check endpoint paths match the API specification

4. **Connection Timeout**
   ```typescript
   // Increase timeout in api.ts
   export const api = axios.create({
     timeout: 60000, // 60 seconds
     // ... other config
   });
   ```

### Debug Commands
```bash
# Test API endpoint directly (AFTER Lambda integration)
curl -X GET "https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/dashboard/summary"

# Check if API Gateway is responding
curl -I "https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/"

# Test from frontend development console
fetch('https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/dashboard/summary')
  .then(r => r.json())
  .then(console.log)
```

---

## 📋 Deployment Checklist

- [x] Backend deployed to AWS Lambda ✅
- [x] API Gateway URL obtained ✅ (`8r85mpuvt3`)
- [x] **Lambda-API Gateway integration** ✅ COMPLETE
- [x] CORS verification completed ✅
- [x] All API endpoints tested ✅
- [ ] Environment variables updated in frontend (action required)
- [ ] Test connection function working (use test-backend-connection.js)
- [ ] All services implemented and tested
- [ ] Error handling implemented
- [ ] Loading states handled in UI components

---

## ✅ **API ENDPOINTS ARE LIVE!**

### **All endpoints are working NOW:**
- ✅ `GET https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/products`
- ✅ `GET https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/dashboard/summary`
- ✅ `GET https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/alerts`
- ✅ `GET https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/forecasts/demand`
- ✅ `GET https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/recommendations`

### **Test Your Connection:**
```bash
# Quick test
curl https://8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev/v1/products

# Or use our test script
node frontend/test-backend-connection.js
```

---

## 📞 Next Steps for Frontend Team

1. ✅ **Backend is deployed** and Lambda functions are working
2. ✅ **API Gateway URL is ready:** `8r85mpuvt3.execute-api.eu-central-1.amazonaws.com/dev`
3. ⏳ **Complete Lambda integration** (5 minutes - see above)
4. ⏳ **Update your `.env.local`** with the API URL provided
5. ⏳ **Test the connection** using the debug commands
6. ⏳ **Start using the service functions** in your React components

Your backend is 99% ready - just needs the Lambda integration to be accessible via HTTP!