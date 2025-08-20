import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Modal from '../components/atoms/Modal';
import DataTable from '../components/organisms/DataTable';
import ABTestCreationWizard from '../components/organisms/ABTestCreationWizard';
import ABTestConfiguration from '../components/organisms/ABTestConfiguration';
import ABTestResultsVisualization from '../components/organisms/ABTestResultsVisualization';
import { useI18n } from '../hooks/useI18n';
import { useModal } from '../contexts/ModalContext';

const ABTestingContainer = styled(motion.div)`
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

const ABTestingHeader = styled.div`
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

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.subtle};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary[600]};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TestStatusBadge = styled(Badge).withConfig({
  shouldForwardProp: (prop) => prop !== 'status'
})`
  ${props => {
    switch (props.status) {
      case 'running':
        return `
          background-color: ${props.theme.colors.green[100]};
          color: ${props.theme.colors.green[700]};
        `;
      case 'draft':
        return `
          background-color: ${props.theme.colors.gray[100]};
          color: ${props.theme.colors.gray[700]};
        `;
      case 'completed':
        return `
          background-color: ${props.theme.colors.blue[100]};
          color: ${props.theme.colors.blue[700]};
        `;
      case 'paused':
        return `
          background-color: ${props.theme.colors.yellow[100]};
          color: ${props.theme.colors.yellow[700]};
        `;
      case 'cancelled':
        return `
          background-color: ${props.theme.colors.red[100]};
          color: ${props.theme.colors.red[700]};
        `;
      default:
        return '';
    }
  }}
`;

const ABTesting = () => {
  const { t } = useI18n();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState([]);
  const [configuredTest, setConfiguredTest] = useState(null);
  const [viewedTest, setViewedTest] = useState(null);

  // Mock A/B test data
  useEffect(() => {
    const mockTests = [
      {
        id: 'ab-001',
        name: 'Claude Sonnet vs Haiku Recommendation Accuracy',
        description: 'Comparing recommendation accuracy between Claude Sonnet and Haiku models',
        hypothesis: 'Claude Sonnet will improve recommendation accuracy by 15% compared to Haiku',
        status: 'running',
        testType: 'model_comparison',
        modelA: { name: 'Claude 3 Haiku', id: 'claude-haiku-3' },
        modelB: { name: 'Claude 3.5 Sonnet', id: 'claude-sonnet-3.5' },
        targetMetric: 'recommendation_accuracy',
        progress: 68,
        duration: 14,
        daysRemaining: 4,
        participants: 2847,
        conversionRateA: 12.3,
        conversionRateB: 14.7,
        significance: 89,
        confidenceInterval: '±2.1%',
        startDate: '2024-08-06',
        endDate: '2024-08-20',
        createdBy: 'John Doe',
        createdAt: '2024-08-06T10:00:00Z'
      },
      {
        id: 'ab-002',
        name: 'Response Time Optimization Test',
        description: 'Testing different AI model configurations for faster response times',
        hypothesis: 'Optimized model configuration will reduce response time by 30%',
        status: 'completed',
        testType: 'model_comparison',
        modelA: { name: 'GPT-4 Turbo', id: 'gpt-4-turbo' },
        modelB: { name: 'Claude 3 Haiku', id: 'claude-haiku-3' },
        targetMetric: 'response_time',
        progress: 100,
        duration: 21,
        daysRemaining: 0,
        participants: 5421,
        conversionRateA: 2.8,
        conversionRateB: 1.9,
        significance: 97,
        confidenceInterval: '±0.3s',
        startDate: '2024-07-15',
        endDate: '2024-08-05',
        createdBy: 'Sarah Johnson',
        createdAt: '2024-07-15T14:30:00Z'
      },
      {
        id: 'ab-003',
        name: 'Customer Satisfaction Scoring',
        description: 'A/B testing different AI models for customer satisfaction scoring',
        hypothesis: 'New scoring algorithm will improve customer satisfaction by 20%',
        status: 'draft',
        testType: 'feature_toggle',
        modelA: { name: 'Current Algorithm', id: 'current-algo' },
        modelB: { name: 'New ML Algorithm', id: 'new-ml-algo' },
        targetMetric: 'user_satisfaction',
        progress: 0,
        duration: 28,
        daysRemaining: 28,
        participants: 0,
        conversionRateA: 0,
        conversionRateB: 0,
        significance: 0,
        confidenceInterval: 'N/A',
        startDate: '2024-08-25',
        endDate: '2024-09-22',
        createdBy: 'Mike Chen',
        createdAt: '2024-08-15T09:15:00Z'
      },
      {
        id: 'ab-004',
        name: 'Inventory Prediction Model Test',
        description: 'Comparing different ML models for inventory demand prediction',
        hypothesis: 'Advanced neural network will improve prediction accuracy by 25%',
        status: 'paused',
        testType: 'model_comparison',
        modelA: { name: 'Linear Regression', id: 'linear-regression' },
        modelB: { name: 'Neural Network', id: 'neural-network' },
        targetMetric: 'prediction_accuracy',
        progress: 35,
        duration: 35,
        daysRemaining: 23,
        participants: 1205,
        conversionRateA: 78.5,
        conversionRateB: 82.1,
        significance: 34,
        confidenceInterval: '±5.2%',
        startDate: '2024-08-01',
        endDate: '2024-09-05',
        createdBy: 'Emily Rodriguez',
        createdAt: '2024-08-01T11:45:00Z'
      }
    ];

    setTimeout(() => {
      setTests(mockTests);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate statistics
  const stats = {
    totalTests: tests.length,
    runningTests: tests.filter(t => t.status === 'running').length,
    completedTests: tests.filter(t => t.status === 'completed').length,
    avgSignificance: tests.length > 0 ? 
      Math.round(tests.reduce((sum, t) => sum + t.significance, 0) / tests.length) : 0
  };

  // Handle test creation
  const handleCreateTest = useCallback(async (testConfig) => {
    try {
      console.log('Creating A/B test:', testConfig);
      
      // Generate new test ID
      const newTest = {
        ...testConfig,
        id: `ab-${String(tests.length + 1).padStart(3, '0')}`,
        progress: 0,
        participants: 0,
        conversionRateA: 0,
        conversionRateB: 0,
        significance: 0,
        confidenceInterval: 'N/A',
        daysRemaining: testConfig.duration
      };
      
      // Add to tests list
      setTests(prev => [newTest, ...prev]);
      
      // Close wizard
      closeModal('createTest');
      
      // TODO: Show success notification
      console.log('A/B test created successfully:', newTest.name);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      // TODO: Show error notification
    }
  }, [tests.length, closeModal]);

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      header: 'Test Name',
      sortable: true,
      render: (value, test) => (
        <div>
          <Typography variant="body2" weight="medium" style={{ marginBottom: '4px' }}>
            {value}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="caption" color="secondary">
              {test.testType.replace('_', ' ')}
            </Typography>
            <TestStatusBadge status={test.status} size="xs">
              {test.status}
            </TestStatusBadge>
          </div>
        </div>
      )
    },
    {
      key: 'models',
      header: 'Models',
      render: (value, test) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Typography variant="caption" color="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="a-circle" size={12} />
            {test.modelA.name}
          </Typography>
          <Typography variant="caption" color="secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="b-circle" size={12} />
            {test.modelB.name}
          </Typography>
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      render: (value, test) => (
        <div style={{ minWidth: '100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Typography variant="caption">{value}%</Typography>
            <Typography variant="caption" color="secondary">
              {test.daysRemaining > 0 ? `${test.daysRemaining}d left` : 'Complete'}
            </Typography>
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '3px', 
            overflow: 'hidden' 
          }}>
            <div
              style={{
                width: `${value}%`,
                height: '100%',
                backgroundColor: test.status === 'running' ? '#10b981' : 
                                test.status === 'completed' ? '#3b82f6' : '#6b7280',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'participants',
      header: 'Participants',
      sortable: true,
      align: 'right',
      render: (value) => (
        <Typography variant="body2" weight="medium">
          {value.toLocaleString()}
        </Typography>
      )
    },
    {
      key: 'significance',
      header: 'Significance',
      sortable: true,
      align: 'right',
      render: (value, test) => (
        <div style={{ textAlign: 'right' }}>
          <Typography 
            variant="body2" 
            weight="medium"
            color={value >= 95 ? 'success' : value >= 80 ? 'warning' : 'secondary'}
          >
            {value}%
          </Typography>
          <Typography variant="caption" color="secondary">
            {test.confidenceInterval}
          </Typography>
        </div>
      )
    },
    {
      key: 'targetMetric',
      header: 'Metric',
      render: (value, test) => (
        <div style={{ textAlign: 'right' }}>
          <Typography variant="body2" weight="medium">
            {test.conversionRateA.toFixed(1)}% / {test.conversionRateB.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="secondary">
            A / B
          </Typography>
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    {
      id: 'view',
      icon: 'eye',
      label: 'View Results',
      show: (test) => test.status === 'running' || test.status === 'completed'
    },
    {
      id: 'configure',
      icon: 'sliders',
      label: 'Configure Parameters',
      disabled: (test) => test.status === 'completed'
    },
    {
      id: 'edit',
      icon: 'edit',
      label: 'Edit Test',
      disabled: (test) => test.status === 'running' || test.status === 'completed'
    },
    {
      id: 'pause',
      icon: 'pause',
      label: 'Pause Test',
      show: (test) => test.status === 'running'
    },
    {
      id: 'resume',
      icon: 'play',
      label: 'Resume Test',
      show: (test) => test.status === 'paused'
    },
    {
      id: 'stop',
      icon: 'square',
      label: 'Stop Test',
      variant: 'error',
      show: (test) => test.status === 'running' || test.status === 'paused'
    },
    {
      id: 'duplicate',
      icon: 'copy',
      label: 'Duplicate Test'
    }
  ];

  // Bulk actions
  const bulkActions = [
    {
      id: 'pause',
      icon: 'pause',
      label: 'Pause Selected',
      variant: 'warning'
    },
    {
      id: 'stop',
      icon: 'square',
      label: 'Stop Selected',
      variant: 'error'
    },
    {
      id: 'delete',
      icon: 'trash',
      label: 'Delete Selected',
      variant: 'error'
    }
  ];

  // Handle actions
  const handleAction = useCallback((actionId, test) => {
    console.log(`Action ${actionId} on test:`, test.name);
    
    switch (actionId) {
      case 'view':
        setViewedTest(test);
        openModal('viewResults', { size: 'xl' });
        break;
      case 'configure':
        setConfiguredTest(test);
        openModal('configureTest', { size: 'xl' });
        break;
      case 'edit':
        // TODO: Open edit modal
        break;
      case 'pause':
        setTests(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'paused' } : t
        ));
        break;
      case 'resume':
        setTests(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'running' } : t
        ));
        break;
      case 'stop':
        setTests(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'completed', progress: 100 } : t
        ));
        break;
      case 'duplicate':
        // TODO: Duplicate test logic
        break;
      default:
        break;
    }
  }, []);

  const handleBulkAction = useCallback((actionId, selectedIds) => {
    console.log(`Bulk action ${actionId} on tests:`, selectedIds);
    
    switch (actionId) {
      case 'pause':
        setTests(prev => prev.map(t => 
          selectedIds.includes(t.id) && t.status === 'running' 
            ? { ...t, status: 'paused' } : t
        ));
        break;
      case 'stop':
        setTests(prev => prev.map(t => 
          selectedIds.includes(t.id) && (t.status === 'running' || t.status === 'paused')
            ? { ...t, status: 'completed', progress: 100 } : t
        ));
        break;
      case 'delete':
        setTests(prev => prev.filter(t => !selectedIds.includes(t.id)));
        break;
      default:
        break;
    }
    
    setSelectedTests([]);
  }, []);

  // Handle configuration update
  const handleConfigUpdate = useCallback((config) => {
    console.log('Configuration updated:', config);
    // Configuration is automatically updated in real-time via the callback
  }, []);

  // Handle configuration save
  const handleConfigSave = useCallback(async (config) => {
    try {
      console.log('Saving configuration for test:', configuredTest.id, config);
      
      // Update test configuration
      setTests(prev => prev.map(t => 
        t.id === configuredTest.id 
          ? { ...t, configuration: config }
          : t
      ));
      
      // Close modal
      closeModal('configureTest');
      setConfiguredTest(null);
      
      // TODO: Show success notification
      console.log('Configuration saved successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }, [configuredTest, closeModal]);

  return (
    <ABTestingContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <ABTestingHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              A/B Testing
            </Typography>
            <Badge variant="info" size="sm">
              <Icon name="flask" size={12} />
              AI Models
            </Badge>
          </div>
          <Typography variant="body1" color="secondary">
            Create and manage A/B tests for AI model performance comparison
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {loading ? 'Loading...' : `${tests.length} total tests`}
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => console.log('View analytics')}
          >
            <Icon name="bar-chart" size={16} />
            Analytics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openModal('createTest', { size: 'xl' })}
          >
            <Icon name="plus" size={16} />
            New A/B Test
          </Button>
        </HeaderRight>
      </ABTestingHeader>

      {/* Quick Stats */}
      <QuickStats>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.totalTests}</StatValue>
          <StatLabel>Total Tests</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.runningTests}</StatValue>
          <StatLabel>Running Tests</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.completedTests}</StatValue>
          <StatLabel>Completed Tests</StatLabel>
        </StatCard>
        <StatCard whileHover={{ scale: 1.02 }}>
          <StatValue>{stats.avgSignificance}%</StatValue>
          <StatLabel>Avg Significance</StatLabel>
        </StatCard>
      </QuickStats>

      {/* A/B Tests Table */}
      <DataTable
        title="A/B Test Management"
        description="Monitor and manage your A/B tests and experiments"
        data={tests}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search A/B tests..."
        sortable
        selectable
        actions={actions}
        bulkActions={bulkActions}
        pagination
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
        emptyStateTitle="No A/B Tests Found"
        emptyStateDescription="Create your first A/B test to start comparing AI model performance"
        emptyStateIcon="flask"
        onAction={handleAction}
        onBulkAction={handleBulkAction}
        onSelect={setSelectedTests}
        selectedIds={selectedTests}
        exportable
        exportFilename="ab-tests"
        exportFormats={['csv', 'xlsx']}
      />

      {/* Create Test Modal */}
      <Modal
        isOpen={isModalOpen('createTest')}
        onClose={() => closeModal('createTest')}
        title=""
        size="xl"
        padding={false}
      >
        <ABTestCreationWizard
          onTestCreate={handleCreateTest}
          onClose={() => closeModal('createTest')}
        />
      </Modal>

      {/* Configure Test Modal */}
      {configuredTest && (
        <Modal
          isOpen={isModalOpen('configureTest')}
          onClose={() => {
            closeModal('configureTest');
            setConfiguredTest(null);
          }}
          title=""
          size="xl"
          padding={false}
        >
          <ABTestConfiguration
            testId={configuredTest.id}
            initialConfig={configuredTest.configuration || {}}
            onConfigUpdate={handleConfigUpdate}
            onConfigSave={handleConfigSave}
          />
        </Modal>
      )}

      {/* View Results Modal */}
      {viewedTest && (
        <Modal
          isOpen={isModalOpen('viewResults')}
          onClose={() => {
            closeModal('viewResults');
            setViewedTest(null);
          }}
          title=""
          size="xl"
          padding={false}
        >
          <ABTestResultsVisualization
            testId={viewedTest.id}
            testData={{
              testName: viewedTest.name,
              status: viewedTest.status,
              progress: viewedTest.progress,
              duration: viewedTest.duration,
              daysRemaining: viewedTest.daysRemaining,
              participants: {
                total: viewedTest.participants,
                variantA: Math.floor(viewedTest.participants / 2),
                variantB: Math.ceil(viewedTest.participants / 2)
              },
              conversions: {
                variantA: { 
                  count: Math.floor(viewedTest.participants * viewedTest.conversionRateA / 200),
                  rate: viewedTest.conversionRateA 
                },
                variantB: { 
                  count: Math.floor(viewedTest.participants * viewedTest.conversionRateB / 200),
                  rate: viewedTest.conversionRateB 
                }
              },
              significance: {
                level: viewedTest.significance,
                pValue: viewedTest.significance >= 95 ? 0.03 : 0.11,
                confidenceInterval: viewedTest.confidenceInterval,
                status: viewedTest.significance >= 95 ? 'significant' : 
                        viewedTest.significance >= 80 ? 'approaching' : 'not_significant'
              }
            }}
            realTimeUpdates={viewedTest.status === 'running'}
          />
        </Modal>
      )}
    </ABTestingContainer>
  );
};

export default ABTesting;