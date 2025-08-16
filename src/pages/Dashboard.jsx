import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import DashboardGrid, { GridItem, DASHBOARD_LAYOUTS } from '../components/organisms/DashboardGrid';
import MetricCard from '../components/molecules/MetricCard';
import AlertCard from '../components/molecules/AlertCard';
import ChartContainer from '../components/organisms/ChartContainer';
import PullToRefresh from '../components/molecules/PullToRefresh';
import MobileCarousel from '../components/molecules/MobileCarousel';
import { exportDashboardReport } from '../utils/exportUtils';
import { isTouchDevice } from '../utils/mobileGestures';
import { useI18n } from '../hooks/useI18n';
import useDashboardStore from '../store/dashboardStore';

const DashboardContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    
    & > * {
      flex: 1;
    }
  }
`;

const AlertsSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const AlertsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  max-height: 400px;
  overflow-y: auto;
`;

const EmptyAlerts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
`;

// Mock chart component for demonstration
const MockChart = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, ${props => props.color}20, ${props => props.color}40);
  border-radius: ${props => props.theme.spacing[2]};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      ${props => props.color}10 10px,
      ${props => props.color}10 20px
    );
  }
`;

const Dashboard = () => {
  const { t } = useI18n();
  const [timeRange, setTimeRange] = useState('24h');
  
  // Dashboard store
  const { 
    metrics, 
    loading, 
    errors,
    realtimeData,
    fetchMetrics,
    refreshDashboard 
  } = useDashboardStore();
  
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Transform real dashboard data for display
  const displayMetrics = useMemo(() => {
    if (!metrics.inventory) return [];
    
    return [
      {
        title: t('dashboard.totalRevenue'),
        value: metrics.revenue?.current || metrics.inventory?.totalValue || 0,
        valueFormat: 'currency',
        change: metrics.revenue?.change || 0,
        trend: metrics.revenue?.trend || 'neutral',
        icon: 'trending',
        iconColor: 'success',
        target: 250000,
        progress: ((metrics.revenue?.current || 0) / 250000) * 100
      },
      {
        title: t('dashboard.totalItems'),
        value: metrics.inventory?.totalItems || 0,
        change: 0, // Backend doesn't provide change yet
        trend: 'neutral',
        icon: 'products',
        iconColor: 'primary',
        badge: t('dashboard.badges.live')
      },
      {
        title: t('dashboard.lowStock'),
        value: metrics.inventory?.lowStockItems || 0,
        change: 0, // Backend doesn't provide change yet
        trend: metrics.inventory?.lowStockItems > 10 ? 'up' : 'down',
        icon: 'warning',
        iconColor: 'warning',
        variant: 'compact'
      },
      {
        title: t('dashboard.totalOrders'),
        value: metrics.orders?.current || 0,
        change: metrics.orders?.change || 0,
        trend: metrics.orders?.trend || 'neutral',
        icon: 'checkCircle',
        iconColor: 'success',
        variant: 'compact'
      }
    ];
  }, [metrics, t]);

  const recentAlerts = [
    {
      id: '1',
      severity: 'error',
      title: t('dashboard.alertTypes.criticalStockLevel'),
      message: t('dashboard.alertMessages.criticalStock'),
      category: t('dashboard.alertCategories.inventory'),
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      severity: 'warning',
      title: t('dashboard.alertTypes.supplierDelay'),
      message: t('dashboard.alertMessages.supplierDelay'),
      category: t('dashboard.alertCategories.supplyChain'),
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      severity: 'info',
      title: t('dashboard.alertTypes.priceUpdate'),
      message: t('dashboard.alertMessages.priceUpdate'),
      category: t('dashboard.alertCategories.pricing'),
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true
    }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 1000);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    handleRefresh();
  };

  const handleExport = () => {
    const dashboardData = {
      metrics: metrics,
      alerts: recentAlerts,
      timestamp: new Date().toISOString()
    };
    
    exportDashboardReport(dashboardData, `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`, {
      title: t('common.dashboardReportTitle'),
      includeMetrics: true,
      includeAlerts: true,
      includeTimestamp: true
    });
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
  };

  const chartComponents = [
    <ChartContainer
      key="inventory-trend"
      title={t('dashboard.charts.inventoryValueTrend')}
      description={t('dashboard.charts.inventoryValueTrendDesc')}
      type="line"
      badge={t('dashboard.badges.live')}
      showTimeRange
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      refreshable
      onRefresh={handleRefresh}
      exportable
      loading={loading}
      lastUpdated={lastUpdated}
    >
      <MockChart color="#3B82F6">
        <Typography variant="h6" color="primary">
          {t('dashboard.charts.lineChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>,
    
    <ChartContainer
      key="category-breakdown"
      title={t('dashboard.charts.categoryBreakdown')}
      description={t('dashboard.charts.categoryBreakdownDesc')}
      type="pie"
      refreshable
      onRefresh={handleRefresh}
      showLegend
      legend={[
        { id: 'electronics', label: t('dashboard.categories.electronics'), color: '#3B82F6' },
        { id: 'clothing', label: t('dashboard.categories.clothing'), color: '#10B981' },
        { id: 'food', label: t('dashboard.categories.food'), color: '#F59E0B' },
        { id: 'books', label: t('dashboard.categories.books'), color: '#EF4444' }
      ]}
      exportable
    >
      <MockChart color="#10B981">
        <Typography variant="h6" color="success">
          {t('dashboard.charts.pieChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>,
    
    <ChartContainer
      key="stock-levels"
      title={t('dashboard.charts.stockLevelsByLocation')}
      description={t('dashboard.charts.stockLevelsByLocationDesc')}
      type="bar"
      refreshable
      onRefresh={handleRefresh}
      exportable
      loading={loading}
    >
      <MockChart color="#F59E0B">
        <Typography variant="h6" color="warning">
          {t('dashboard.charts.barChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>,
    
    <ChartContainer
      key="demand-forecast"
      title={t('dashboard.charts.demandForecast')}
      description={t('dashboard.charts.demandForecastDesc')}
      type="area"
      badge={t('dashboard.badges.ai')}
      showTimeRange
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      refreshable
      onRefresh={handleRefresh}
      exportable
      showLegend
      legend={[
        { id: 'actual', label: t('dashboard.chartLegends.actualDemand'), color: '#8B5CF6' },
        { id: 'forecast', label: t('dashboard.chartLegends.forecasted'), color: '#06B6D4' },
        { id: 'confidence', label: t('dashboard.chartLegends.confidenceRange'), color: '#84CC16' }
      ]}
    >
      <MockChart color="#8B5CF6">
        <Typography variant="h6" color="brand">
          {t('dashboard.charts.areaChartPlaceholder')}
        </Typography>
      </MockChart>
    </ChartContainer>
  ];

  const dashboardContent = (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <DashboardHeader>
        <HeaderLeft>
          <Typography variant="h3" weight="bold" color="primary">
            {t('dashboard.title')}
          </Typography>
          <Typography variant="body1" color="secondary">
            {t('dashboard.welcomeMessage')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {t('common.lastUpdated')}: {lastUpdated}
          </Typography>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={loading}
            >
              <Icon name="refresh" size={16} />
              {t('common.refresh')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Icon name="download" size={16} />
              {t('common.export')}
            </Button>
          </QuickActions>
        </HeaderRight>
      </DashboardHeader>

      {/* Key Metrics */}
      <DashboardGrid
        {...DASHBOARD_LAYOUTS.default}
        spacing="lg"
      >
        {displayMetrics.map((metric, index) => (
          <GridItem
            key={metric.title}
            span={index < 2 ? 2 : 1}
          >
            <MetricCard
              {...metric}
              clickable
              onClick={() => console.log('Metric clicked:', metric.title)}
              lastUpdated={`2 ${t('dashboard.minutesAgo')}`}
            />
          </GridItem>
        ))}
      </DashboardGrid>

      {/* Recent Alerts */}
      <AlertsSection>
        <AlertsHeader>
          <Typography variant="h5" weight="semibold">
            {t('alerts.title')}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="error" size="sm">
              {recentAlerts.filter(a => !a.read).length} {t('dashboard.newBadge')}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('View all alerts')}
            >
              {t('common.viewAll')}
              <Icon name="chevronRight" size={14} />
            </Button>
          </div>
        </AlertsHeader>

        {recentAlerts.length > 0 ? (
          <AlertsList>
            {recentAlerts.slice(0, 3).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AlertCard
                  {...alert}
                  dismissible={!alert.read}
                  onClick={() => handleAlertClick(alert)}
                  onDismiss={() => console.log('Dismiss alert:', alert.id)}
                />
              </motion.div>
            ))}
          </AlertsList>
        ) : (
          <EmptyAlerts>
            <Icon name="checkCircle" size={48} color="#22C55E" />
            <div>
              <Typography variant="h6" weight="medium">
                {t('dashboard.allGood')}
              </Typography>
              <Typography variant="body2" color="secondary">
                {t('dashboard.noAlerts')}
              </Typography>
            </div>
          </EmptyAlerts>
        )}
      </AlertsSection>

      {/* Charts Section */}
      <DashboardGrid
        {...DASHBOARD_LAYOUTS.default}
        spacing="lg"
      >
        <GridItem span={3}>
          <ChartContainer
            title={t('dashboard.charts.inventoryValueOverTime')}
            description={t('dashboard.charts.inventoryValueOverTimeDesc')}
            type="line"
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            fullScreenable
            showLegend
            legend={[
              { id: 'current', label: t('dashboard.chartLegends.currentValue'), color: '#3B82F6' },
              { id: 'projected', label: t('dashboard.chartLegends.projected'), color: '#10B981' }
            ]}
            lastUpdated={lastUpdated}
            loading={loading}
          >
            <MockChart color="#3B82F6">
              <Typography variant="h6" color="primary">
                {t('dashboard.charts.lineChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={1}>
          <ChartContainer
            title={t('dashboard.charts.categoryBreakdown')}
            type="pie"
            showLegend
            legend={[
              { id: 'electronics', label: t('dashboard.categories.electronics'), color: '#3B82F6' },
              { id: 'clothing', label: t('dashboard.categories.clothing'), color: '#10B981' },
              { id: 'food', label: t('dashboard.categories.food'), color: '#F59E0B' },
              { id: 'books', label: t('dashboard.categories.books'), color: '#EF4444' }
            ]}
            exportable
          >
            <MockChart color="#10B981">
              <Typography variant="h6" color="success">
                {t('dashboard.charts.pieChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={2}>
          <ChartContainer
            title={t('dashboard.charts.stockLevelsByLocation')}
            description={t('dashboard.charts.stockLevelsByLocationDesc')}
            type="bar"
            refreshable
            onRefresh={handleRefresh}
            exportable
            loading={loading}
          >
            <MockChart color="#F59E0B">
              <Typography variant="h6" color="warning">
                {t('dashboard.charts.barChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={2}>
          <ChartContainer
            title={t('dashboard.charts.demandForecast')}
            description={t('dashboard.charts.demandForecastDesc')}
            type="area"
            badge={t('dashboard.badges.ai')}
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            showLegend
            legend={[
              { id: 'actual', label: t('dashboard.chartLegends.actualDemand'), color: '#8B5CF6' },
              { id: 'forecast', label: t('dashboard.chartLegends.forecasted'), color: '#06B6D4' },
              { id: 'confidence', label: t('dashboard.chartLegends.confidenceRange'), color: '#84CC16' }
            ]}
          >
            <MockChart color="#8B5CF6">
              <Typography variant="h6" color="brand">
                {t('dashboard.charts.areaChartPlaceholder')}
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
      </DashboardGrid>
    </DashboardContainer>
  );

  // For mobile, show charts in a carousel
  if (isTouchDevice()) {
    return (
      <PullToRefresh
        onRefresh={handleRefresh}
        refreshing={loading}
        pullingText={t('dashboard.pullToRefresh')}
        refreshingText={t('dashboard.refreshingData')}
      >
        {dashboardContent}
        
        {/* Mobile Chart Carousel */}
        <div style={{ 
          marginTop: '32px', 
          height: '400px',
          display: window.innerWidth <= 768 ? 'block' : 'none'
        }}>
          <Typography variant="h5" weight="semibold" style={{ marginBottom: '16px' }}>
            {t('dashboard.chartsSection')}
          </Typography>
          <MobileCarousel
            showIndicators
            showNavigation
            showCounter
            showSwipeHint
            onSlideChange={(index) => console.log('Chart slide changed:', index)}
          >
            {chartComponents}
          </MobileCarousel>
        </div>
      </PullToRefresh>
    );
  }

  // Desktop version with pull-to-refresh
  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      refreshing={loading}
      pullingText={t('dashboard.pullToRefresh')}
      refreshingText={t('dashboard.refreshingData')}
    >
      {dashboardContent}
    </PullToRefresh>
  );
};

export default Dashboard;