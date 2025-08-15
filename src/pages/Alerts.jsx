import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import AlertCenter from '../components/organisms/AlertCenter';
import { useI18n } from '../hooks/useI18n';

const AlertsContainer = styled(motion.div)`
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

const AlertsHeader = styled.div`
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

const AlertsContent = styled.div`
  height: calc(100vh - 200px);
  min-height: 600px;
`;

const Alerts = () => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  // Mock alerts data
  const mockAlerts = [
    {
      id: 'ALT-001',
      severity: 'error',
      title: t('alerts.alertTitles.criticalStockLevel'),
      message: t('alerts.alertMessages.criticalStockLevel'),
      category: t('alerts.categories.inventory'),
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      archived: false
    },
    {
      id: 'ALT-002',
      severity: 'error',
      title: t('alerts.alertTitles.productOutOfStock'),
      message: t('alerts.alertMessages.productOutOfStock'),
      category: t('alerts.categories.inventory'),
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      read: false,
      archived: false
    },
    {
      id: 'ALT-003',
      severity: 'warning',
      title: t('alerts.alertTitles.supplierDelay'),
      message: t('alerts.alertMessages.supplierDelay'),
      category: t('alerts.categories.supplyChain'),
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false,
      archived: false
    },
    {
      id: 'ALT-004',
      severity: 'warning',
      title: t('alerts.alertTitles.reorderPoint'),
      message: t('alerts.alertMessages.reorderPoint'),
      category: t('alerts.categories.reorder'),
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      read: true,
      archived: false
    },
    {
      id: 'ALT-005',
      severity: 'warning',
      title: t('alerts.alertTitles.priceChange'),
      message: t('alerts.alertMessages.priceChange'),
      category: t('alerts.categories.pricing'),
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      archived: false
    },
    {
      id: 'ALT-006',
      severity: 'info',
      title: t('alerts.alertTitles.bulkOrderProcessed'),
      message: t('alerts.alertMessages.bulkOrderProcessed'),
      category: t('alerts.categories.orders'),
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
      archived: false
    },
    {
      id: 'ALT-007',
      severity: 'info',
      title: t('alerts.alertTitles.inventoryReport'),
      message: t('alerts.alertMessages.inventoryReport'),
      category: t('alerts.categories.reports'),
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      archived: false
    },
    {
      id: 'ALT-008',
      severity: 'success',
      title: t('alerts.alertTitles.stockAdjustment'),
      message: t('alerts.alertMessages.stockAdjustment'),
      category: t('alerts.categories.inventory'),
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      archived: false
    },
    {
      id: 'ALT-009',
      severity: 'info',
      title: t('alerts.alertTitles.newProduct'),
      message: t('alerts.alertMessages.newProduct'),
      category: t('alerts.categories.products'),
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: true,
      archived: false
    },
    {
      id: 'ALT-010',
      severity: 'warning',
      title: t('alerts.alertTitles.temperatureAlert'),
      message: t('alerts.alertMessages.temperatureAlert'),
      category: t('alerts.categories.warehouse'),
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      read: true,
      archived: false
    }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAlertClick = (alert) => {
    console.log('Alert clicked:', alert);
    // Navigate to related page or show details
  };

  const handleAlertAction = (action, alert) => {
    console.log('Alert action:', action, alert);
    
    switch (action) {
      case 'markRead':
        // Mark alert as read
        break;
      case 'markUnread':
        // Mark alert as unread
        break;
      case 'archive':
        // Archive alert
        break;
      case 'delete':
        // Delete alert
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action, alertIds) => {
    console.log('Bulk action:', action, alertIds);
    
    switch (action) {
      case 'markRead':
        // Mark selected alerts as read
        break;
      case 'markUnread':
        // Mark selected alerts as unread
        break;
      case 'archive':
        // Archive selected alerts
        break;
      case 'delete':
        // Delete selected alerts
        break;
      default:
        break;
    }
  };

  const handleExport = () => {
    console.log('Export alerts');
    // Export alerts to CSV or PDF
  };

  const handleSettings = () => {
    console.log('Open alert settings');
    // Open alert configuration/settings
  };

  const handleCreateRule = () => {
    console.log('Create alert rule');
    // Open dialog to create new alert rule
  };

  // Calculate statistics
  const stats = {
    total: mockAlerts.length,
    unread: mockAlerts.filter(a => !a.read && !a.archived).length,
    critical: mockAlerts.filter(a => a.severity === 'error' && !a.archived).length,
    warning: mockAlerts.filter(a => a.severity === 'warning' && !a.archived).length
  };

  return (
    <AlertsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AlertsHeader>
        <HeaderLeft>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography variant="h3" weight="bold" color="primary">
              {t('alerts.title')}
            </Typography>
            {stats.unread > 0 && (
              <Badge variant="error" size="sm">
                {stats.unread} {t('alerts.unread')}
              </Badge>
            )}
          </div>
          <Typography variant="body1" color="secondary">
            {t('alerts.description')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="caption" color="tertiary">
                {stats.total} {t('alerts.total')}
              </Typography>
              <Typography variant="caption" color="tertiary">
                •
              </Typography>
              <Typography variant="caption" color="error">
                {stats.critical} {t('alerts.critical')}
              </Typography>
              <Typography variant="caption" color="tertiary">
                •
              </Typography>
              <Typography variant="caption" color="warning">
                {stats.warning} {t('alerts.warnings')}
              </Typography>
            </div>
          </div>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateRule}
            >
              <Icon name="plus" size={16} />
              {t('alerts.createRule')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSettings}
            >
              <Icon name="settings" size={16} />
              {t('alerts.settings')}
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
      </AlertsHeader>

      <AlertsContent>
        <AlertCenter
          alerts={mockAlerts}
          loading={loading}
          showStats={true}
          showSearch={true}
          showFilters={true}
          showBulkActions={true}
          onAlertClick={handleAlertClick}
          onAlertAction={handleAlertAction}
          onBulkAction={handleBulkAction}
          onRefresh={handleRefresh}
        />
      </AlertsContent>
    </AlertsContainer>
  );
};

export default Alerts;