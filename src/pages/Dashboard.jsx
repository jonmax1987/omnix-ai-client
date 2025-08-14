import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import DashboardGrid, { GridItem, DASHBOARD_LAYOUTS } from '../components/organisms/DashboardGrid';
import MetricCard from '../components/molecules/MetricCard';
import AlertCard from '../components/molecules/AlertCard';
import ChartContainer from '../components/organisms/ChartContainer';

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
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Mock data
  const metrics = [
    {
      title: 'Total Revenue',
      value: 245680,
      valueFormat: 'currency',
      change: 12.5,
      trend: 'up',
      icon: 'trending',
      iconColor: 'success',
      target: 250000,
      progress: 98.3
    },
    {
      title: 'Products in Stock',
      value: 1247,
      change: -3.2,
      trend: 'down',
      icon: 'products',
      iconColor: 'primary',
      badge: 'Live'
    },
    {
      title: 'Low Stock Alerts',
      value: 23,
      change: 8.5,
      trend: 'up',
      icon: 'warning',
      iconColor: 'warning',
      variant: 'compact'
    },
    {
      title: 'Orders Today',
      value: 89,
      change: 15.3,
      trend: 'up',
      icon: 'checkCircle',
      iconColor: 'success',
      variant: 'compact'
    }
  ];

  const recentAlerts = [
    {
      id: '1',
      severity: 'error',
      title: 'Critical Stock Level',
      message: 'iPhone 14 Pro has only 2 units remaining',
      category: 'Inventory',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      severity: 'warning',
      title: 'Supplier Delay',
      message: 'Samsung Galaxy S23 shipment delayed by 3 days',
      category: 'Supply Chain',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      severity: 'info',
      title: 'Price Update',
      message: 'Laptop prices updated for Q4 2024',
      category: 'Pricing',
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
    console.log('Exporting dashboard data...');
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
  };

  return (
    <DashboardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <DashboardHeader>
        <HeaderLeft>
          <Typography variant="h3" weight="bold" color="primary">
            Dashboard
          </Typography>
          <Typography variant="body1" color="secondary">
            Welcome back! Here's what's happening with your inventory.
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            Last updated: {lastUpdated}
          </Typography>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={loading}
            >
              <Icon name="refresh" size={16} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Icon name="download" size={16} />
              Export
            </Button>
          </QuickActions>
        </HeaderRight>
      </DashboardHeader>

      {/* Key Metrics */}
      <DashboardGrid
        {...DASHBOARD_LAYOUTS.default}
        spacing="lg"
      >
        {metrics.map((metric, index) => (
          <GridItem
            key={metric.title}
            span={index < 2 ? 2 : 1}
          >
            <MetricCard
              {...metric}
              clickable
              onClick={() => console.log('Metric clicked:', metric.title)}
              lastUpdated="2 min ago"
            />
          </GridItem>
        ))}
      </DashboardGrid>

      {/* Recent Alerts */}
      <AlertsSection>
        <AlertsHeader>
          <Typography variant="h5" weight="semibold">
            Recent Alerts
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="error" size="sm">
              {recentAlerts.filter(a => !a.read).length} new
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('View all alerts')}
            >
              View All
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
                All Clear!
              </Typography>
              <Typography variant="body2" color="secondary">
                No alerts to display at the moment.
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
            title="Inventory Value Over Time"
            description="Total inventory value trend"
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
              { id: 'current', label: 'Current Value', color: '#3B82F6' },
              { id: 'projected', label: 'Projected', color: '#10B981' }
            ]}
            lastUpdated={lastUpdated}
            loading={loading}
          >
            <MockChart color="#3B82F6">
              <Typography variant="h6" color="primary">
                Line Chart Placeholder
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={1}>
          <ChartContainer
            title="Category Breakdown"
            type="pie"
            showLegend
            legend={[
              { id: 'electronics', label: 'Electronics', color: '#3B82F6' },
              { id: 'clothing', label: 'Clothing', color: '#10B981' },
              { id: 'food', label: 'Food', color: '#F59E0B' },
              { id: 'books', label: 'Books', color: '#EF4444' }
            ]}
            exportable
          >
            <MockChart color="#10B981">
              <Typography variant="h6" color="success">
                Pie Chart Placeholder
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={2}>
          <ChartContainer
            title="Stock Levels by Location"
            description="Current stock distribution"
            type="bar"
            refreshable
            onRefresh={handleRefresh}
            exportable
            loading={loading}
          >
            <MockChart color="#F59E0B">
              <Typography variant="h6" color="warning">
                Bar Chart Placeholder
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>

        <GridItem span={2}>
          <ChartContainer
            title="Demand Forecast"
            description="AI-powered demand predictions"
            type="area"
            badge="AI"
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            showLegend
            legend={[
              { id: 'actual', label: 'Actual Demand', color: '#8B5CF6' },
              { id: 'forecast', label: 'Forecasted', color: '#06B6D4' },
              { id: 'confidence', label: 'Confidence Range', color: '#84CC16' }
            ]}
          >
            <MockChart color="#8B5CF6">
              <Typography variant="h6" color="brand">
                Area Chart Placeholder
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;