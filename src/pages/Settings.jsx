import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState } from 'react';
import useUserStore from '../store/userStore';
import usePushNotifications from '../hooks/usePushNotifications';
import { useI18n } from '../hooks/useI18n';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Avatar from '../components/atoms/Avatar';
import FormField from '../components/molecules/FormField';

const SettingsContainer = styled(motion.div)`
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

const SettingsHeader = styled.div`
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

const SettingsLayout = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: ${props => props.theme.spacing[8]};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 200px 1fr;
    gap: ${props => props.theme.spacing[6]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const SettingsNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: ${props => props.theme.spacing[2]};
    border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
  }
`;

const NavItem = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background: none;
  border: none;
  border-radius: ${props => props.theme.spacing[2]};
  text-align: left;
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme.colors.background.secondary};
  }
  
  ${props => props.active && `
    background-color: ${props.theme.colors.primary[100]};
    color: ${props.theme.colors.primary[700]};
  `}
`;

const SettingsContent = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[8]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
  }
`;

const SettingsSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  padding-bottom: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ToggleField = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 44px;
  height: 24px;
  appearance: none;
  background: ${props => props.checked ? props.theme.colors.primary[500] : props.theme.colors.gray[300]};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.checked ? '22px' : '2px'};
    transition: left 0.2s;
  }
`;

const DangerZone = styled.div`
  padding: ${props => props.theme.spacing[6]};
  border: 2px solid ${props => props.theme.colors.red[200]};
  border-radius: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.red[25]};
`;

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const { preferences, setTheme, updatePreferences } = useUserStore();
  const pushNotifications = usePushNotifications();
  const { locale, changeLocale, t } = useI18n();

  // Mock user data
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@omnix.ai',
    role: 'Inventory Manager',
    company: 'OMNIX Solutions',
    phone: '+1 (555) 123-4567',
    timezone: 'UTC-5',
    language: 'en',
    avatar: null
  });

  // Settings state (local settings not in user store)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      lowStock: true,
      priceChanges: true,
      reports: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 60,
      passwordExpiry: 90
    },
    integrations: {
      apiAccess: true,
      webhooks: false,
      exportAccess: true
    }
  });

  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'warning' },
    { id: 'integrations', label: 'Integrations', icon: 'products' },
    { id: 'billing', label: 'Billing', icon: 'trending' },
    { id: 'team', label: 'Team', icon: 'users' }
  ];

  const handleSave = async () => {
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      setLoading(false);
      console.log('Settings saved');
    }, 1000);
  };

  const handleToggle = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader>
              <Typography variant="h5" weight="semibold">
                Profile Settings
              </Typography>
              <Typography variant="body2" color="secondary">
                Manage your personal information and account details.
              </Typography>
            </SectionHeader>

            <ProfileSection>
              <Avatar
                src={userData.avatar}
                name={userData.name}
                size="xl"
              />
              <ProfileInfo>
                <Typography variant="h6" weight="medium" style={{ marginBottom: '4px' }}>
                  {userData.name}
                </Typography>
                <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
                  {userData.role}
                </Typography>
                <Badge variant="primary" size="sm">
                  {userData.company}
                </Badge>
                <div style={{ marginTop: '16px' }}>
                  <Button variant="secondary" size="sm">
                    <Icon name="upload" size={16} />
                    Change Photo
                  </Button>
                </div>
              </ProfileInfo>
            </ProfileSection>

            <FieldGrid>
              <FormField
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <FormField
                label="Phone"
                name="phone"
                value={userData.phone}
                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <FormField
                label="Role"
                name="role"
                value={userData.role}
                onChange={(e) => setUserData(prev => ({ ...prev, role: e.target.value }))}
              />
              <FormField
                label="Company"
                name="company"
                value={userData.company}
                onChange={(e) => setUserData(prev => ({ ...prev, company: e.target.value }))}
              />
              <FormField
                label="Timezone"
                name="timezone"
                type="select"
                value={userData.timezone}
                options={[
                  { value: 'UTC-8', label: 'Pacific Time (UTC-8)' },
                  { value: 'UTC-7', label: 'Mountain Time (UTC-7)' },
                  { value: 'UTC-6', label: 'Central Time (UTC-6)' },
                  { value: 'UTC-5', label: 'Eastern Time (UTC-5)' }
                ]}
                onChange={(e) => setUserData(prev => ({ ...prev, timezone: e.target.value }))}
              />
            </FieldGrid>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader>
              <Typography variant="h5" weight="semibold">
                Notification Settings
              </Typography>
              <Typography variant="body2" color="secondary">
                Configure how you receive alerts and updates.
              </Typography>
            </SectionHeader>

            <SettingsSection>
              <Typography variant="h6" weight="medium" style={{ marginBottom: '16px' }}>
                Delivery Methods
              </Typography>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Email Notifications
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Receive notifications via email
                  </Typography>
                </div>
                <Toggle
                  checked={settings.notifications.email}
                  onChange={() => handleToggle('notifications', 'email')}
                />
              </ToggleField>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Push Notifications
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Browser and mobile notifications
                  </Typography>
                </div>
                <Toggle
                  checked={settings.notifications.push}
                  onChange={() => handleToggle('notifications', 'push')}
                />
              </ToggleField>
              
              {/* Push Notification Management */}
              {pushNotifications.isSupported && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  backgroundColor: pushNotifications.status === 'subscribed' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(107, 114, 128, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${
                    pushNotifications.status === 'subscribed' 
                      ? 'rgba(16, 185, 129, 0.3)' 
                      : 'rgba(107, 114, 128, 0.3)'
                  }`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <Typography variant="body2" weight="medium">
                        Browser Push Notifications
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Status: {pushNotifications.status === 'subscribed' ? 'Active' : 
                               pushNotifications.status === 'denied' ? 'Blocked' :
                               pushNotifications.status === 'default' ? 'Not configured' : 'Permission granted'}
                      </Typography>
                      {pushNotifications.error && (
                        <Typography variant="caption" color="error" style={{ display: 'block', marginTop: '4px' }}>
                          {pushNotifications.error}
                        </Typography>
                      )}
                    </div>
                    <Badge 
                      variant={pushNotifications.status === 'subscribed' ? 'success' : 'secondary'} 
                      size="sm"
                    >
                      {pushNotifications.status === 'subscribed' ? 'Active' : 
                       pushNotifications.status === 'denied' ? 'Blocked' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!pushNotifications.isSubscribed && pushNotifications.status !== 'denied' && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={pushNotifications.subscribe}
                        loading={pushNotifications.isLoading}
                      >
                        <Icon name="bell" size={14} />
                        Enable Notifications
                      </Button>
                    )}
                    
                    {pushNotifications.isSubscribed && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={pushNotifications.unsubscribe}
                          loading={pushNotifications.isLoading}
                        >
                          <Icon name="bell-off" size={14} />
                          Disable Notifications
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => pushNotifications.sendTestNotification(
                            'Test Notification', 
                            'This is a test notification from OMNIX AI'
                          )}
                        >
                          <Icon name="send" size={14} />
                          Send Test
                        </Button>
                      </>
                    )}
                    
                    {pushNotifications.status === 'denied' && (
                      <Typography variant="caption" color="secondary">
                        Notifications are blocked. Please enable them in your browser settings.
                      </Typography>
                    )}
                  </div>
                </div>
              )}
              
              {!pushNotifications.isSupported && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <Typography variant="caption" color="secondary">
                    <Icon name="warning" size={14} style={{ marginRight: '6px' }} />
                    Push notifications are not supported in this browser.
                  </Typography>
                </div>
              )}
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    SMS Notifications
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Text message alerts for critical issues
                  </Typography>
                </div>
                <Toggle
                  checked={settings.notifications.sms}
                  onChange={() => handleToggle('notifications', 'sms')}
                />
              </ToggleField>
            </SettingsSection>

            <SettingsSection>
              <Typography variant="h6" weight="medium" style={{ marginBottom: '16px' }}>
                Alert Types
              </Typography>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Low Stock Alerts
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    When products reach minimum stock levels
                  </Typography>
                </div>
                <Toggle
                  checked={settings.notifications.lowStock}
                  onChange={() => handleToggle('notifications', 'lowStock')}
                />
              </ToggleField>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Price Changes
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Supplier price updates and market changes
                  </Typography>
                </div>
                <Toggle
                  checked={settings.notifications.priceChanges}
                  onChange={() => handleToggle('notifications', 'priceChanges')}
                />
              </ToggleField>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Report Generation
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    When scheduled reports are ready
                  </Typography>
                </div>
                <Toggle
                  checked={settings.notifications.reports}
                  onChange={() => handleToggle('notifications', 'reports')}
                />
              </ToggleField>
            </SettingsSection>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader>
              <Typography variant="h5" weight="semibold">
                Application Preferences
              </Typography>
              <Typography variant="body2" color="secondary">
                Customize your application experience.
              </Typography>
            </SectionHeader>

            <FieldGrid>
              <FormField
                label="Theme"
                name="theme"
                type="select"
                value={preferences.theme}
                options={[
                  { value: 'light', label: 'Light Theme' },
                  { value: 'dark', label: 'Dark Theme' },
                  { value: 'auto', label: 'Auto (System)' }
                ]}
                onChange={(e) => setTheme(e.target.value)}
              />
              <FormField
                label="Currency"
                name="currency"
                type="select"
                value={preferences.currency}
                options={[
                  { value: 'USD', label: 'US Dollar (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' },
                  { value: 'GBP', label: 'British Pound (GBP)' },
                  { value: 'CAD', label: 'Canadian Dollar (CAD)' }
                ]}
                onChange={(e) => updatePreferences(null, { currency: e.target.value })}
              />
              <FormField
                label="Date Format"
                name="dateFormat"
                type="select"
                value={preferences.dateFormat}
                options={[
                  { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy (US)' },
                  { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy (UK)' },
                  { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (ISO)' }
                ]}
                onChange={(e) => updatePreferences(null, { dateFormat: e.target.value })}
              />
              <FormField
                label="Time Format"
                name="timeFormat"
                type="select"
                value={preferences.timeFormat}
                options={[
                  { value: '12h', label: '12-hour (AM/PM)' },
                  { value: '24h', label: '24-hour' }
                ]}
                onChange={(e) => updatePreferences(null, { timeFormat: e.target.value })}
              />
              <FormField
                label="Language"
                name="language"
                type="select"
                value={locale}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'he', label: 'עברית (Hebrew)' }
                ]}
                onChange={(e) => {
                  changeLocale(e.target.value);
                  updatePreferences(null, { language: e.target.value });
                }}
              />
            </FieldGrid>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader>
              <Typography variant="h5" weight="semibold">
                Security Settings
              </Typography>
              <Typography variant="body2" color="secondary">
                Manage your account security and access controls.
              </Typography>
            </SectionHeader>

            <SettingsSection>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Two-Factor Authentication
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Add an extra layer of security to your account
                  </Typography>
                </div>
                <Toggle
                  checked={settings.security.twoFactor}
                  onChange={() => handleToggle('security', 'twoFactor')}
                />
              </ToggleField>
            </SettingsSection>

            <FieldGrid>
              <FormField
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: Number(e.target.value) }
                }))}
                min={15}
                max={480}
                helperText="Automatically log out after inactivity"
              />
              <FormField
                label="Password Expiry (days)"
                name="passwordExpiry"
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordExpiry: Number(e.target.value) }
                }))}
                min={30}
                max={365}
                helperText="Require password change after this period"
              />
            </FieldGrid>

            <div style={{ marginTop: '24px' }}>
              <Button variant="secondary" style={{ marginRight: '8px' }}>
                Change Password
              </Button>
              <Button variant="secondary">
                Download Backup Codes
              </Button>
            </div>
          </motion.div>
        );

      case 'integrations':
        return (
          <motion.div
            key="integrations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader>
              <Typography variant="h5" weight="semibold">
                Integrations & API
              </Typography>
              <Typography variant="body2" color="secondary">
                Configure third-party integrations and API access.
              </Typography>
            </SectionHeader>

            <SettingsSection>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    API Access
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Enable REST API access for external integrations
                  </Typography>
                </div>
                <Toggle
                  checked={settings.integrations.apiAccess}
                  onChange={() => handleToggle('integrations', 'apiAccess')}
                />
              </ToggleField>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Webhooks
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Send real-time updates to external systems
                  </Typography>
                </div>
                <Toggle
                  checked={settings.integrations.webhooks}
                  onChange={() => handleToggle('integrations', 'webhooks')}
                />
              </ToggleField>
              <ToggleField>
                <div>
                  <Typography variant="body2" weight="medium">
                    Export Access
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Allow data export in various formats
                  </Typography>
                </div>
                <Toggle
                  checked={settings.integrations.exportAccess}
                  onChange={() => handleToggle('integrations', 'exportAccess')}
                />
              </ToggleField>
            </SettingsSection>

            <div style={{ marginTop: '24px' }}>
              <Button variant="primary" style={{ marginRight: '8px' }}>
                Generate API Key
              </Button>
              <Button variant="secondary">
                View Documentation
              </Button>
            </div>
          </motion.div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Typography variant="h6" color="secondary">
              Coming Soon
            </Typography>
            <Typography variant="body2" color="tertiary">
              This section is under development.
            </Typography>
          </div>
        );
    }
  };

  return (
    <SettingsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <SettingsHeader>
        <div>
          <Typography variant="h3" weight="bold" color="primary">
            {t('navigation.settings')}
          </Typography>
          <Typography variant="body1" color="secondary">
            Manage your account preferences and application settings.
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm">
            Reset to Default
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
        </div>
      </SettingsHeader>

      <SettingsLayout>
        <SettingsNav>
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon name={item.icon} size={20} />
              <Typography variant="body2" weight="medium">
                {item.label}
              </Typography>
            </NavItem>
          ))}
        </SettingsNav>

        <SettingsContent>
          {renderContent()}
          
          {activeSection === 'profile' && (
            <DangerZone>
              <Typography variant="h6" weight="semibold" color="error" style={{ marginBottom: '8px' }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginBottom: '16px' }}>
                These actions are irreversible. Please proceed with caution.
              </Typography>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
                <Button variant="secondary" size="sm">
                  Export Data
                </Button>
              </div>
            </DangerZone>
          )}
        </SettingsContent>
      </SettingsLayout>
    </SettingsContainer>
  );
};

export default Settings;