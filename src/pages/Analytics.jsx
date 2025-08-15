import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import DashboardGrid, { GridItem } from '../components/organisms/DashboardGrid';
import MetricCard from '../components/molecules/MetricCard';
import ChartContainer from '../components/organisms/ChartContainer';
import { useI18n } from '../hooks/useI18n';

const AnalyticsContainer = styled(motion.div)`
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

const AnalyticsHeader = styled.div`
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

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const MockChart = styled.div`
  width: 100%;
  height: 300px;
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

const Analytics = () => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [forecastPeriod, setForecastPeriod] = useState('90d');

  // Mock analytics metrics
  const metrics = [
    {
      title: t('analytics.metrics.forecastAccuracy'),
      value: 87.3,
      valueFormat: 'percentage',
      change: 2.1,
      trend: 'up',
      icon: 'trending',
      iconColor: 'success',
      badge: t('analytics.badges.ai')
    },
    {
      title: t('analytics.metrics.demandVolatility'),
      value: 14.2,
      valueFormat: 'percentage',
      change: -3.5,
      trend: 'down',
      icon: 'analytics',
      iconColor: 'primary'
    },
    {
      title: t('analytics.metrics.stockoutRisk'),
      value: 8.7,
      valueFormat: 'percentage',
      change: 1.2,
      trend: 'up',
      icon: 'warning',
      iconColor: 'warning'
    },
    {
      title: t('analytics.metrics.inventoryTurnover'),
      value: 12.4,
      change: 8.3,
      trend: 'up',
      icon: 'trending',
      iconColor: 'success',
      footer: 'times per year'
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Export analytics data');
  };

  const handleReportSettings = () => {
    console.log('Open report settings');
  };

  const handleScheduleReport = () => {
    console.log('Schedule automated report');
  };

  return (
    <AnalyticsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AnalyticsHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              {t('analytics.title')}
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="trending" size={12} />
              {t('analytics.aiPowered')}
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            {t('analytics.description')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {t('common.updatedMinutesAgo')}
          </Typography>
          
          <QuickActions>
            <Button variant="secondary" size="sm" onClick={handleScheduleReport}>
              <Icon name="calendar" size={16} />
              {t('analytics.schedule')}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReportSettings}>
              <Icon name="settings" size={16} />
              {t('analytics.settings')}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Icon name="download" size={16} />
              {t('common.export')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleRefresh} loading={loading}>
              <Icon name="refresh" size={16} />
              {t('common.refresh')}
            </Button>
          </QuickActions>
        </HeaderRight>
      </AnalyticsHeader>

      {/* Key Analytics Metrics */}
      <DashboardGrid columns={{ xs: 1, sm: 2, lg: 4 }} spacing="lg" style={{ marginBottom: '48px' }}>
        {metrics.map((metric) => (
          <GridItem key={metric.title}>
            <MetricCard
              {...metric}
              clickable
              onClick={() => console.log('Metric clicked:', metric.title)}
            />
          </GridItem>
        ))}
      </DashboardGrid>

      {/* Primary Forecasting Charts */}
      <div style={{ marginBottom: '48px' }}>
        <SectionHeader>
          <Typography variant="h5" weight="semibold">
            {t('analytics.sections.demandForecasting')}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="caption" color="tertiary">
              {t('analytics.forecastPeriod')}
            </Typography>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="30d">{t('analytics.periodOptions.30d')}</option>
              <option value="90d">{t('analytics.periodOptions.90d')}</option>
              <option value="180d">{t('analytics.periodOptions.180d')}</option>
              <option value="1y">{t('analytics.periodOptions.1y')}</option>
            </select>
          </div>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          <GridItem span={2}>
            <ChartContainer
              title={t('analytics.charts.overallDemandForecast')}
              description={t('analytics.charts.overallDemandForecastDesc')}
              type="area"
              badge={t('analytics.badges.ai')}
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              fullScreenable
              showLegend
              legend={[
                { id: 'historical', label: t('analytics.legends.historicalDemand'), color: '#3B82F6' },
                { id: 'forecast', label: t('analytics.legends.forecastedDemand'), color: '#8B5CF6' },
                { id: 'upper', label: t('analytics.legends.upperConfidence'), color: '#84CC16' },
                { id: 'lower', label: t('analytics.legends.lowerConfidence'), color: '#F59E0B' }
              ]}
            >
              <MockChart color="#8B5CF6">
                <Typography variant="h6" color="brand">
                  Demand Forecast Chart
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem>
            <ChartContainer
              title={t('analytics.charts.categoryBreakdown')}
              description={t('analytics.charts.categoryBreakdownDesc')}
              type="doughnut"
              refreshable
              onRefresh={handleRefresh}
              exportable
              showLegend
              legend={[
                { id: 'electronics', label: t('dashboard.categories.electronics'), color: '#3B82F6' },
                { id: 'clothing', label: t('dashboard.categories.clothing'), color: '#10B981' },
                { id: 'food', label: t('analytics.legends.foodAndBeverages'), color: '#F59E0B' },
                { id: 'home', label: t('analytics.legends.homeAndGarden'), color: '#EF4444' },
                { id: 'books', label: t('dashboard.categories.books'), color: '#8B5CF6' }
              ]}
            >
              <MockChart color="#10B981">
                <Typography variant="h6" color="success">
                  Category Distribution
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem>
            <ChartContainer
              title={t('analytics.charts.seasonalTrends')}
              description={t('analytics.charts.seasonalTrendsDesc')}
              type="line"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
            >
              <MockChart color="#F59E0B">
                <Typography variant="h6" color="warning">
                  Seasonal Analysis
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Inventory Analytics */}
      <div style={{ marginBottom: '48px' }}>
        <SectionHeader>
          <Typography variant="h5" weight="semibold">
            {t('analytics.sections.inventoryAnalytics')}
          </Typography>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 3 }} spacing="lg">
          <GridItem>
            <ChartContainer
              title={t('analytics.charts.inventoryValueTrend')}
              description={t('analytics.charts.inventoryValueTrendDesc')}
              type="line"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              showLegend
              legend={[
                { id: 'value', label: t('analytics.legends.inventoryValue'), color: '#3B82F6' },
                { id: 'target', label: t('analytics.legends.targetLevel'), color: '#22C55E' }
              ]}
            >
              <MockChart color="#3B82F6">
                <Typography variant="h6" color="primary">
                  Value Trend
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem>
            <ChartContainer
              title={t('analytics.charts.stockLevelDistribution')}
              description={t('analytics.charts.stockLevelDistributionDesc')}
              type="bar"
              refreshable
              onRefresh={handleRefresh}
              exportable
            >
              <MockChart color="#10B981">
                <Typography variant="h6" color="success">
                  Stock Distribution
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem>
            <ChartContainer
              title={t('analytics.charts.turnoverRateAnalysis')}
              description={t('analytics.charts.turnoverRateAnalysisDesc')}
              type="bar"
              refreshable
              onRefresh={handleRefresh}
              exportable
            >
              <MockChart color="#F59E0B">
                <Typography variant="h6" color="warning">
                  Turnover Rates
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Performance Metrics */}
      <div style={{ marginBottom: '48px' }}>
        <SectionHeader>
          <Typography variant="h5" weight="semibold">
            {t('analytics.sections.performanceAnalysis')}
          </Typography>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          <GridItem>
            <ChartContainer
              title={t('analytics.charts.forecastAccuracyOverTime')}
              description={t('analytics.charts.forecastAccuracyOverTimeDesc')}
              type="line"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              badge={t('analytics.badges.performance')}
              showLegend
              legend={[
                { id: 'accuracy', label: t('analytics.legends.forecastAccuracy'), color: '#8B5CF6' },
                { id: 'target', label: t('analytics.legends.targetAccuracy'), color: '#22C55E' },
                { id: 'industry', label: t('analytics.legends.industryAverage'), color: '#94A3B8' }
              ]}
            >
              <MockChart color="#8B5CF6">
                <Typography variant="h6" color="brand">
                  Accuracy Trends
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem>
            <ChartContainer
              title={t('analytics.charts.riskAnalysis')}
              description={t('analytics.charts.riskAnalysisDesc')}
              type="scatter"
              refreshable
              onRefresh={handleRefresh}
              exportable
              showLegend
              legend={[
                { id: 'high', label: t('analytics.legends.highRisk'), color: '#EF4444' },
                { id: 'medium', label: t('analytics.legends.mediumRisk'), color: '#F59E0B' },
                { id: 'low', label: t('analytics.legends.lowRisk'), color: '#22C55E' }
              ]}
            >
              <MockChart color="#EF4444">
                <Typography variant="h6" color="error">
                  Risk Assessment
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem span={2}>
            <ChartContainer
              title={t('analytics.charts.salesVsForecast')}
              description={t('analytics.charts.salesVsForecastDesc')}
              type="bar"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              fullScreenable
              showLegend
              legend={[
                { id: 'actual', label: t('analytics.legends.actualSales'), color: '#3B82F6' },
                { id: 'forecast', label: t('analytics.legends.forecastedSales'), color: '#8B5CF6' },
                { id: 'variance', label: t('analytics.legends.variance'), color: '#F59E0B' }
              ]}
            >
              <MockChart color="#3B82F6">
                <Typography variant="h6" color="primary">
                  Sales vs Forecast
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>
        </DashboardGrid>
      </div>

      {/* Advanced Analytics */}
      <div>
        <SectionHeader>
          <Typography variant="h5" weight="semibold">
            {t('analytics.sections.advancedAnalytics')}
          </Typography>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          <GridItem>
            <ChartContainer
              title={t('analytics.charts.marketTrends')}
              description={t('analytics.charts.marketTrendsDesc')}
              type="area"
              badge={t('analytics.badges.externalData')}
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
            >
              <MockChart color="#06B6D4">
                <Typography variant="h6" color="info">
                  Market Trends
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>

          <GridItem>
            <ChartContainer
              title={t('analytics.charts.supplierPerformance')}
              description={t('analytics.charts.supplierPerformanceDesc')}
              type="gauge"
              refreshable
              onRefresh={handleRefresh}
              exportable
            >
              <MockChart color="#10B981">
                <Typography variant="h6" color="success">
                  Supplier Metrics
                </Typography>
              </MockChart>
            </ChartContainer>
          </GridItem>
        </DashboardGrid>
      </div>
    </AnalyticsContainer>
  );
};

export default Analytics;