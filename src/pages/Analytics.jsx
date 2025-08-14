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
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [forecastPeriod, setForecastPeriod] = useState('90d');

  // Mock analytics metrics
  const metrics = [
    {
      title: 'Forecast Accuracy',
      value: 87.3,
      valueFormat: 'percentage',
      change: 2.1,
      trend: 'up',
      icon: 'trending',
      iconColor: 'success',
      badge: 'AI'
    },
    {
      title: 'Demand Volatility',
      value: 14.2,
      valueFormat: 'percentage',
      change: -3.5,
      trend: 'down',
      icon: 'analytics',
      iconColor: 'primary'
    },
    {
      title: 'Stockout Risk',
      value: 8.7,
      valueFormat: 'percentage',
      change: 1.2,
      trend: 'up',
      icon: 'warning',
      iconColor: 'warning'
    },
    {
      title: 'Inventory Turnover',
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
              Analytics & Forecasting
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="trending" size={12} />
              AI-Powered
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            Advanced analytics and demand forecasting for data-driven decisions.
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            Updated 5 minutes ago
          </Typography>
          
          <QuickActions>
            <Button variant="secondary" size="sm" onClick={handleScheduleReport}>
              <Icon name="calendar" size={16} />
              Schedule
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReportSettings}>
              <Icon name="settings" size={16} />
              Settings
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Icon name="download" size={16} />
              Export
            </Button>
            <Button variant="primary" size="sm" onClick={handleRefresh} loading={loading}>
              <Icon name="refresh" size={16} />
              Refresh
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
            Demand Forecasting
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="caption" color="tertiary">
              Forecast Period:
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
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="180d">6 months</option>
              <option value="1y">1 year</option>
            </select>
          </div>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          <GridItem span={2}>
            <ChartContainer
              title="Overall Demand Forecast"
              description="AI-powered demand predictions across all product categories"
              type="area"
              badge="AI"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              fullScreenable
              showLegend
              legend={[
                { id: 'historical', label: 'Historical Demand', color: '#3B82F6' },
                { id: 'forecast', label: 'Forecasted Demand', color: '#8B5CF6' },
                { id: 'upper', label: 'Upper Confidence', color: '#84CC16' },
                { id: 'lower', label: 'Lower Confidence', color: '#F59E0B' }
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
              title="Category Breakdown"
              description="Demand distribution by product category"
              type="doughnut"
              refreshable
              onRefresh={handleRefresh}
              exportable
              showLegend
              legend={[
                { id: 'electronics', label: 'Electronics', color: '#3B82F6' },
                { id: 'clothing', label: 'Clothing', color: '#10B981' },
                { id: 'food', label: 'Food & Beverages', color: '#F59E0B' },
                { id: 'home', label: 'Home & Garden', color: '#EF4444' },
                { id: 'books', label: 'Books', color: '#8B5CF6' }
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
              title="Seasonal Trends"
              description="Seasonal demand patterns and cycles"
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
            Inventory Analytics
          </Typography>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 3 }} spacing="lg">
          <GridItem>
            <ChartContainer
              title="Inventory Value Trend"
              description="Total inventory value over time"
              type="line"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              showLegend
              legend={[
                { id: 'value', label: 'Inventory Value', color: '#3B82F6' },
                { id: 'target', label: 'Target Level', color: '#22C55E' }
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
              title="Stock Level Distribution"
              description="Current stock levels across all products"
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
              title="Turnover Rate Analysis"
              description="Inventory turnover by category"
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
            Performance Analysis
          </Typography>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          <GridItem>
            <ChartContainer
              title="Forecast Accuracy Over Time"
              description="Historical accuracy of demand predictions"
              type="line"
              showTimeRange
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              refreshable
              onRefresh={handleRefresh}
              exportable
              badge="Performance"
              showLegend
              legend={[
                { id: 'accuracy', label: 'Forecast Accuracy', color: '#8B5CF6' },
                { id: 'target', label: 'Target Accuracy', color: '#22C55E' },
                { id: 'industry', label: 'Industry Average', color: '#94A3B8' }
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
              title="Risk Analysis"
              description="Stockout risk assessment by product category"
              type="scatter"
              refreshable
              onRefresh={handleRefresh}
              exportable
              showLegend
              legend={[
                { id: 'high', label: 'High Risk', color: '#EF4444' },
                { id: 'medium', label: 'Medium Risk', color: '#F59E0B' },
                { id: 'low', label: 'Low Risk', color: '#22C55E' }
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
              title="Sales vs Forecast Comparison"
              description="Actual sales performance compared to predictions"
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
                { id: 'actual', label: 'Actual Sales', color: '#3B82F6' },
                { id: 'forecast', label: 'Forecasted Sales', color: '#8B5CF6' },
                { id: 'variance', label: 'Variance', color: '#F59E0B' }
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
            Advanced Analytics
          </Typography>
        </SectionHeader>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          <GridItem>
            <ChartContainer
              title="Market Trends Analysis"
              description="External market factors and their impact"
              type="area"
              badge="External Data"
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
              title="Supplier Performance"
              description="Delivery reliability and quality metrics"
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