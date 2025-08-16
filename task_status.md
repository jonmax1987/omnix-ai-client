# OMNIX AI Tasks

## Foundation
- [x] Project structure (atomic design folders)
- [x] Design tokens (colors, fonts, spacing)
- [x] Theme system (light/dark mode)
- [x] i18n setup (English/Hebrew, RTL support)
- [x] Utility hooks (useApi, useLocalStorage, useDebounce)
- [x] Error boundaries
- [x] Loading states

## Atoms
- [x] Button (variants, loading states)
- [x] Input (text, number, validation)
- [x] Typography (heading, text, caption)
- [x] Icons (SVG system)
- [x] Badge (status indicators)
- [x] Avatar
- [x] Spinner

## Molecules  
- [x] Search bar (icon, clear, suggestions)
- [x] Table row (actions, selection)
- [x] Alert card (severity, dismiss)
- [x] Metric card (stats, trends)
- [x] Nav item (active states)
- [x] Form field (label, validation)
- [x] Date picker

## Organisms
- [x] Header (logo, user menu, notifications)
- [x] Sidebar (collapsible, responsive)
- [x] Data table (sort, filter, pagination)
- [x] Dashboard grid
- [x] Product form (validation)
- [x] Alert center (filtering, bulk actions)
- [x] Chart container

## Pages
- [x] Dashboard (metrics, charts, alerts)
- [x] Products (listing, search, filters)
- [x] Product detail (history, forecasts)
- [x] Alerts (management, filtering)
- [x] Recommendations (AI suggestions)
- [x] Analytics (forecasting, trends)
- [x] Settings (preferences, config)

## Charts & Visualization
- [x] Inventory value chart (time-series)
- [x] Category breakdown (pie/donut)
- [x] Stock level indicators
- [x] Demand forecasts (confidence intervals)
- [x] Trend analysis
- [x] Real-time metrics

## State & API
- [x] Zustand store setup
- [x] Products store (CRUD, filters)
- [x] Dashboard store (metrics, real-time)
- [x] Alerts store (notifications)
- [x] User store (auth, preferences)
- [x] API service layer
- [x] WebSocket integration

## Advanced Features
- [x] Global search (omnibox)
- [x] Advanced filtering (multi-criteria)
- [x] Bulk operations (multi-select)
- [x] Drag and drop
- [x] Keyboard shortcuts
- [x] Tooltips
- [x] Progressive disclosure

## Performance & A11y
- [x] Code splitting (lazy loading)
- [x] Image optimization (WebP, lazy)
- [x] Virtual scrolling
- [x] Memoization (useMemo/useCallback)
- [x] ARIA support
- [x] Keyboard navigation
- [x] Focus management

## Modern Features
- [x] Service Worker (offline)
- [x] Push notifications
- [x] PWA manifest
- [x] Dark mode
- [x] Print styles
- [x] Export (CSV, PDF)

## Animations
- [x] Page transitions (Framer Motion)
- [x] Component animations
- [x] Loading animations
- [x] Interactive feedback
- [x] Chart animations
- [x] Mobile gestures

## Testing
- [x] Unit tests (Jest/RTL)  
- [x] Component testing
- [x] Integration testing
- [x] A11y testing (axe-core)
- [x] Performance testing
- [x] Cross-browser testing
- [x] Mobile testing

## Production
- [x] Bundle optimization
- [x] Asset optimization
- [x] CDN integration
- [x] Monitoring
- [x] Analytics
- [x] Security headers
- [x] SEO

## Phase 1: API Infrastructure Updates (Critical Priority)
- [ ] Update API base URL from `/api` to `/v1` in src/services/api.js:6
- [ ] Add X-API-Key header support alongside Bearer tokens in src/services/api.js:13-32
- [ ] Enhance transformBackendResponse() to handle {data: [...]} → {products: [...]} mapping
- [ ] Configure environment variables (REACT_APP_API_KEY, REACT_APP_API_URL)
- [ ] Test API connectivity with new base URL structure
- [ ] Update CORS settings for backend integration
- [ ] Configure development proxy settings

## Phase 2: Client-Side Schema Extensions (High Priority)
- [ ] Add Product fields: barcode, unit, expirationDate, description, cost (preserve existing tags, status)
- [ ] Add Alert fields: dismissedAt, dismissedBy, expiresAt (preserve existing acknowledged, title)
- [ ] Extend DashboardSummary to include totalInventoryValue → revenue.current mapping
- [ ] Create TypeScript interfaces for new backend response formats
- [ ] Add API error response types matching backend specification
- [ ] Update product form components to handle new fields
- [ ] Update alert components to display new backend fields

## Phase 3: API Integration & Mapping (High Priority)
- [ ] Map dashboard calls: /analytics/dashboard → /dashboard/summary
- [ ] Map forecast calls: /analytics/forecast → /forecasts/demand
- [ ] Map trend calls: /analytics/trends → /forecasts/trends
- [ ] Map alert actions: acknowledge → dismiss endpoint
- [ ] Implement dual-mode stores (API + mock fallback for development)
- [ ] Add request/response logging for API integration debugging
- [ ] Enhance pagination implementation to match API spec
- [ ] Update error handling to align with API responses

## Phase 4: Enhanced Data Flow (Medium Priority)
- [ ] Connect dashboard to real API endpoints with fallback to mock data
- [ ] Integrate alerts system with backend while preserving client-side functionality
- [ ] Connect recommendations with API (map general → order recommendations)
- [ ] Implement demand forecasting data flow with confidence intervals
- [ ] Update product search and filtering to use backend parameters
- [ ] Add proper loading states for all API integrations

## Phase 5: Real-time Integration (Medium Priority)
- [ ] Configure WebSocket URL for backend compatibility
- [ ] Map backend real-time events to existing client event handlers
- [ ] Add WebSocket connection fallback for offline scenarios
- [ ] Implement real-time inventory updates
- [ ] Add live dashboard metrics updates
- [ ] Enable push notifications for critical alerts
- [ ] Test real-time recommendation updates

## Phase 6: Testing & Validation (Lower Priority)
- [ ] Update integration tests for real API endpoints
- [ ] Mock API responses for unit tests (preserve existing tests)
- [ ] Add API error scenario testing
- [ ] Update E2E tests with real data flows
- [ ] Add API performance testing
- [ ] Test authentication flows with both API key and Bearer token
- [ ] Add API connectivity health checks

## Phase 7: Environment & Deployment (Lower Priority)
- [ ] Configure production API endpoints
- [ ] Set up staging environment configuration
- [ ] Configure AWS CloudFront for API caching
- [ ] Set up proper DNS for API access
- [ ] Configure SSL certificates
- [ ] Set up monitoring for API integration
- [ ] Configure backup and failover strategies
- [ ] Update build configurations for different stages

## Backend Team Requirements (External Dependencies)
**Note: These tasks are for the backend team - not frontend implementation**

### Authentication & User Management Endpoints
- [ ] Implement /v1/auth/login endpoint
- [ ] Implement /v1/auth/logout endpoint  
- [ ] Implement /v1/auth/refresh endpoint
- [ ] Implement /v1/auth/reset-password endpoint
- [ ] Implement /v1/auth/change-password endpoint
- [ ] Implement /v1/user/profile endpoint (GET, PATCH)
- [ ] Implement /v1/user/preferences endpoint (GET, PATCH)
- [ ] Implement /v1/user/avatar upload endpoint

### Inventory Management Endpoints
- [ ] Implement /v1/inventory GET endpoint with filtering
- [ ] Implement /v1/inventory/{productId} GET endpoint
- [ ] Implement /v1/inventory/{productId}/adjust POST endpoint
- [ ] Implement /v1/inventory/transfer POST endpoint
- [ ] Implement /v1/inventory/{productId}/history GET endpoint
- [ ] Implement /v1/inventory/bulk-adjust POST endpoint

### Order Management Endpoints
- [ ] Implement /v1/orders CRUD endpoints
- [ ] Implement /v1/orders/{id}/cancel POST endpoint
- [ ] Implement /v1/orders/{id}/fulfill POST endpoint
- [ ] Implement /v1/orders/{id}/history GET endpoint
- [ ] Implement /v1/orders/statistics GET endpoint

### Settings & System Endpoints
- [ ] Implement /v1/settings GET/PATCH endpoints
- [ ] Implement /v1/settings/integrations endpoints
- [ ] Implement /v1/settings/notifications endpoints
- [ ] Implement /v1/system/health GET endpoint
- [ ] Implement /v1/system/status GET endpoint
- [ ] Implement /v1/system/metrics GET endpoint

### Enhanced Schema Support
- [ ] Add Product schema fields: tags (array), status (enum)
- [ ] Add Alert schema fields: title (string), acknowledged (boolean)
- [ ] Add User profile schema
- [ ] Add Order management schema
- [ ] Add Settings configuration schema

**Current:** Phase 5 - Frontend-Backend Integration Required
**Status:** Frontend complete, backend exists with OpenAPI spec, need integration
**Priority:** API integration → Data model alignment → Real-time features → Deployment