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
import DataTable from '../components/organisms/DataTable';

const RecommendationsContainer = styled(motion.div)`
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

const RecommendationsHeader = styled.div`
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
`;

const RecommendationCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[6]};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getRecommendationColor(props.priority, props.theme)};
  }
`;

const RecommendationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const RecommendationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => getRecommendationBackground(props.type, props.theme)};
  color: ${props => getRecommendationIconColor(props.type, props.theme)};
  margin-right: ${props => props.theme.spacing[4]};
  flex-shrink: 0;
`;

const RecommendationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecommendationActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[4]};
`;

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

const getRecommendationColor = (priority, theme) => {
  if (!theme || !theme.colors) {
    return '#0ea5e9'; // fallback primary-500
  }
  
  switch (priority) {
    case 'high': return theme.colors.red?.[500] || '#ef4444';
    case 'medium': return theme.colors.yellow?.[500] || '#eab308';
    default: return theme.colors.primary?.[500] || '#0ea5e9';
  }
};

const getRecommendationBackground = (type, theme) => {
  if (!theme || !theme.colors) {
    return '#f1f5f9'; // fallback gray-100
  }
  
  const backgrounds = {
    reorder: theme.colors.red?.[100] || '#fee2e2',
    pricing: theme.colors.green?.[100] || '#dcfce7',
    inventory: theme.colors.yellow?.[100] || '#fef3c7',
    demand: theme.colors.primary?.[100] || '#e0f2fe',
    supplier: (theme.colors.purple && theme.colors.purple[100]) || theme.colors.primary?.[100] || '#e0f2fe'
  };
  return backgrounds[type] || theme.colors.gray?.[100] || '#f1f5f9';
};

const getRecommendationIconColor = (type, theme) => {
  if (!theme || !theme.colors) {
    return '#475569'; // fallback gray-600
  }
  
  const colors = {
    reorder: theme.colors.red?.[600] || '#dc2626',
    pricing: theme.colors.green?.[600] || '#16a34a',
    inventory: theme.colors.yellow?.[600] || '#d97706',
    demand: theme.colors.primary?.[600] || '#0284c7',
    supplier: (theme.colors.purple && theme.colors.purple[600]) || theme.colors.primary?.[600] || '#0284c7'
  };
  return colors[type] || theme.colors.gray?.[600] || '#475569';
};

const getRecommendationIcon = (type) => {
  const icons = {
    reorder: 'warning',
    pricing: 'trending',
    inventory: 'products',
    demand: 'analytics',
    supplier: 'user'
  };
  return icons[type] || 'info';
};

const Recommendations = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  // Mock recommendations data
  const recommendations = [
    {
      id: 'REC-001',
      type: 'reorder',
      priority: 'high',
      title: 'Immediate Reorder Required',
      description: 'iPhone 14 Pro is critically low on stock and has high demand. Immediate reordering recommended to prevent stockouts.',
      impact: 'Prevent $25,000 in lost sales',
      confidence: 95,
      products: ['iPhone 14 Pro'],
      action: 'Reorder 50 units',
      estimatedValue: 25000,
      urgency: 'Within 24 hours'
    },
    {
      id: 'REC-002',
      type: 'pricing',
      priority: 'medium',
      title: 'Price Optimization Opportunity',
      description: 'Samsung Galaxy S23 pricing can be optimized based on competitor analysis and demand patterns.',
      impact: 'Increase profit margin by 12%',
      confidence: 87,
      products: ['Samsung Galaxy S23'],
      action: 'Increase price by $50',
      estimatedValue: 8400,
      urgency: 'Within 7 days'
    },
    {
      id: 'REC-003',
      type: 'inventory',
      priority: 'low',
      title: 'Inventory Rebalancing',
      description: 'Nike Air Max 90 has excess stock in one location but shortage in another. Rebalancing recommended.',
      impact: 'Optimize storage costs',
      confidence: 78,
      products: ['Nike Air Max 90'],
      action: 'Transfer 15 units',
      estimatedValue: 1200,
      urgency: 'Within 14 days'
    },
    {
      id: 'REC-004',
      type: 'demand',
      priority: 'medium',
      title: 'Seasonal Demand Preparation',
      description: 'Based on historical data, demand for MacBook Air M2 will increase by 40% in the next month.',
      impact: 'Capture seasonal demand',
      confidence: 92,
      products: ['MacBook Air M2'],
      action: 'Stock up 25 units',
      estimatedValue: 15000,
      urgency: 'Within 10 days'
    },
    {
      id: 'REC-005',
      type: 'supplier',
      priority: 'low',
      title: 'Supplier Diversification',
      description: 'Consider adding alternative suppliers for Sony WH-1000XM4 to reduce supply chain risk.',
      impact: 'Reduce supply risk',
      confidence: 73,
      products: ['Sony WH-1000XM4'],
      action: 'Contact 2 new suppliers',
      estimatedValue: 5000,
      urgency: 'Within 30 days'
    }
  ];

  // Mock metrics
  const metrics = [
    {
      title: 'Total Recommendations',
      value: recommendations.length,
      icon: 'trending',
      iconColor: 'primary',
      variant: 'compact'
    },
    {
      title: 'High Priority',
      value: recommendations.filter(r => r.priority === 'high').length,
      icon: 'warning',
      iconColor: 'error',
      variant: 'compact'
    },
    {
      title: 'Potential Savings',
      value: 54600,
      valueFormat: 'currency',
      icon: 'trending',
      iconColor: 'success',
      variant: 'compact'
    },
    {
      title: 'Avg. Confidence',
      value: 85,
      valueFormat: 'percentage',
      icon: 'checkCircle',
      iconColor: 'info',
      variant: 'compact'
    }
  ];

  const tableColumns = [
    {
      key: 'type',
      header: 'Type',
      width: '120px',
      render: (_, recommendation) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name={getRecommendationIcon(recommendation.type)} size={16} />
          <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
            {recommendation.type}
          </Typography>
        </div>
      )
    },
    {
      key: 'title',
      header: 'Recommendation',
      render: (_, recommendation) => (
        <div>
          <Typography variant="body2" weight="medium">
            {recommendation.title}
          </Typography>
          <Typography variant="caption" color="secondary">
            {recommendation.products.join(', ')}
          </Typography>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '100px',
      render: (_, recommendation) => (
        <Badge 
          variant={
            recommendation.priority === 'high' ? 'error' :
            recommendation.priority === 'medium' ? 'warning' : 'secondary'
          }
          size="sm"
        >
          {recommendation.priority}
        </Badge>
      )
    },
    {
      key: 'confidence',
      header: 'Confidence',
      width: '100px',
      align: 'right',
      render: (_, recommendation) => (
        <Typography variant="body2" weight="medium">
          {recommendation.confidence}%
        </Typography>
      )
    },
    {
      key: 'impact',
      header: 'Est. Value',
      width: '120px',
      align: 'right',
      render: (_, recommendation) => (
        <Typography variant="body2" weight="medium" color="success">
          ${recommendation.estimatedValue.toLocaleString()}
        </Typography>
      )
    },
    {
      key: 'urgency',
      header: 'Urgency',
      width: '120px',
      render: (_, recommendation) => (
        <Typography variant="caption" color="secondary">
          {recommendation.urgency}
        </Typography>
      )
    }
  ];

  const handleApplyRecommendation = (recommendation) => {
    console.log('Apply recommendation:', recommendation);
  };

  const handleDismissRecommendation = (recommendation) => {
    console.log('Dismiss recommendation:', recommendation);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleSettings = () => {
    console.log('Open AI settings');
  };

  return (
    <RecommendationsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <RecommendationsHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              AI Recommendations
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="trending" size={12} />
              AI-Powered
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            Smart insights and suggestions to optimize your inventory management.
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Button variant="secondary" size="sm" onClick={handleSettings}>
            <Icon name="settings" size={16} />
            AI Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRefresh} loading={loading}>
            <Icon name="refresh" size={16} />
            Refresh
          </Button>
        </HeaderRight>
      </RecommendationsHeader>

      {/* Key Metrics */}
      <DashboardGrid columns={{ xs: 2, sm: 2, md: 4 }} spacing="lg" style={{ marginBottom: '48px' }}>
        {metrics.map((metric) => (
          <GridItem key={metric.title}>
            <MetricCard {...metric} />
          </GridItem>
        ))}
      </DashboardGrid>

      {/* High Priority Recommendations */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Typography variant="h5" weight="semibold">
            Priority Recommendations
          </Typography>
          <Badge variant="error" size="sm">
            {recommendations.filter(r => r.priority === 'high').length} urgent
          </Badge>
        </div>

        <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
          {recommendations.filter(r => r.priority === 'high').map((recommendation) => (
            <GridItem key={recommendation.id}>
              <RecommendationCard
                priority={recommendation.priority}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <RecommendationHeader>
                  <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                    <RecommendationIcon type={recommendation.type}>
                      <Icon name={getRecommendationIcon(recommendation.type)} size={24} />
                    </RecommendationIcon>
                    <RecommendationContent>
                      <Typography variant="h6" weight="semibold" style={{ marginBottom: '8px' }}>
                        {recommendation.title}
                      </Typography>
                      <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
                        {recommendation.description}
                      </Typography>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Typography variant="caption" color="tertiary">Impact:</Typography>
                          <Typography variant="caption" weight="medium" color="success">
                            {recommendation.impact}
                          </Typography>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Typography variant="caption" color="tertiary">Confidence:</Typography>
                          <Typography variant="caption" weight="medium">
                            {recommendation.confidence}%
                          </Typography>
                        </div>
                      </div>
                    </RecommendationContent>
                  </div>
                  <Badge variant={recommendation.priority === 'high' ? 'error' : 'warning'} size="sm">
                    {recommendation.priority}
                  </Badge>
                </RecommendationHeader>
                
                <RecommendationActions>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyRecommendation(recommendation)}
                  >
                    <Icon name="checkCircle" size={16} />
                    Apply
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDismissRecommendation(recommendation)}
                  >
                    Dismiss
                  </Button>
                </RecommendationActions>
              </RecommendationCard>
            </GridItem>
          ))}
        </DashboardGrid>
      </div>

      {/* All Recommendations Table */}
      <div style={{ marginBottom: '48px' }}>
        <Typography variant="h5" weight="semibold" style={{ marginBottom: '24px' }}>
          All Recommendations
        </Typography>
        
        <DataTable
          title="AI-Generated Recommendations"
          description="Complete list of optimization suggestions"
          data={recommendations}
          columns={tableColumns}
          loading={loading}
          searchable
          searchPlaceholder="Search recommendations..."
          sortable
          pagination
          pageSize={10}
          emptyStateTitle="No recommendations available"
          emptyStateDescription="AI analysis is complete. Check back later for new suggestions."
          emptyStateIcon="trending"
          actions={[
            {
              id: 'apply',
              icon: 'checkCircle',
              label: 'Apply'
            },
            {
              id: 'dismiss',
              icon: 'close',
              label: 'Dismiss'
            },
            {
              id: 'details',
              icon: 'eye',
              label: 'View Details'
            }
          ]}
          onAction={(actionId, recommendation) => {
            if (actionId === 'apply') {
              handleApplyRecommendation(recommendation);
            } else if (actionId === 'dismiss') {
              handleDismissRecommendation(recommendation);
            }
          }}
        />
      </div>

      {/* AI Performance Chart */}
      <DashboardGrid columns={{ xs: 1, lg: 2 }} spacing="lg">
        <GridItem>
          <ChartContainer
            title="Recommendation Accuracy"
            description="AI prediction accuracy over time"
            type="line"
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            refreshable
            onRefresh={handleRefresh}
            exportable
            badge="AI"
            showLegend
            legend={[
              { id: 'accuracy', label: 'Accuracy %', color: '#3B82F6' },
              { id: 'target', label: 'Target', color: '#22C55E' }
            ]}
          >
            <MockChart color="#3B82F6">
              <Typography variant="h6" color="primary">
                Accuracy Trend
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
        
        <GridItem>
          <ChartContainer
            title="Savings Impact"
            description="Financial impact of applied recommendations"
            type="bar"
            refreshable
            onRefresh={handleRefresh}
            exportable
          >
            <MockChart color="#22C55E">
              <Typography variant="h6" color="success">
                Savings by Category
              </Typography>
            </MockChart>
          </ChartContainer>
        </GridItem>
      </DashboardGrid>
    </RecommendationsContainer>
  );
};

export default Recommendations;