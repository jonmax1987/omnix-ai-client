import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useEffect } from 'react';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import useStore from './store';
import useUserStore from './store/userStore';

// Layout components
import Header from './components/organisms/Header';
import Sidebar from './components/organisms/Sidebar';
import ErrorBoundary from './components/organisms/ErrorBoundary';
import OfflineIndicator from './components/atoms/OfflineIndicator';
import PageTransition from './components/molecules/PageTransition';

// Debug components (development only)
import ApiDebug from './components/debug/ApiDebug';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Alerts from './pages/Alerts';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Styled components
import styled, { css } from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background?.primary || '#f8fafc'};
`;

const MainContent = styled.main.withConfig({
  shouldForwardProp: (prop) => !['sidebarCollapsed'].includes(prop),
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left ${props => props.theme?.animation?.duration?.standard || '300ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
  
  @media (min-width: ${props => props.theme?.breakpoints?.lg || '1024px'}) {
    margin-left: ${props => props.sidebarCollapsed ? '72px' : '280px'};
    
    /* RTL Support */
    [dir="rtl"] & {
      margin-left: 0;
      margin-right: ${props => props.sidebarCollapsed ? '72px' : '280px'};
      transition: margin-right ${props => props.theme?.animation?.duration?.standard || '300ms'} ${props => props.theme?.animation?.easing?.easeInOut || 'ease-in-out'};
    }
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-x: hidden;
`;

// AppContent component that uses React Router hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const { preferences, setTheme } = useUserStore();
  const { ui = {}, toggleSidebar, setSidebarMobileOpen, setCurrentPage } = store || {};
  
  // Ensure we always have a valid store
  if (!store) {
    return <div>Loading...</div>;
  }

  // System theme detection
  useEffect(() => {
    if (preferences.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = () => {
        // Don't change the user preference, just detect the system theme
        // The theme selection logic will handle 'auto' mode
      };
      
      mediaQuery.addEventListener('change', updateTheme);
      updateTheme();
      
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [preferences.theme]);
  
  // Update store when route changes
  useEffect(() => {
    const path = location.pathname.slice(1) || 'dashboard';
    setCurrentPage?.(path);
  }, [location.pathname, setCurrentPage]);
  
  // Mock notifications for demo
  const notifications = [
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'iPhone 14 Pro has only 2 units remaining',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      icon: 'warning',
      color: '#F59E0B'
    },
    {
      id: '2',
      title: 'New Order',
      message: 'Order #1234 has been placed',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      icon: 'package',
      color: '#10B981'
    },
    {
      id: '3',
      title: 'System Update',
      message: 'OMNIX AI has been updated to v2.1.0',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      icon: 'info',
      color: '#3B82F6'
    }
  ];

  // Theme selection logic
  const getTheme = () => {
    if (preferences.theme === 'dark') return darkTheme;
    if (preferences.theme === 'light') return lightTheme;
    if (preferences.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkTheme : lightTheme;
    }
    return lightTheme;
  };

  const currentTheme = getTheme();

  const handleMenuToggle = () => {
    if (window.innerWidth < 1024) {
      setSidebarMobileOpen?.(!ui.sidebarMobileOpen);
    } else {
      toggleSidebar?.();
    }
  };

  const handleUserMenuAction = (action) => {
    console.log('User menu action:', action);
    if (action === 'settings') {
      navigate('/settings');
    }
  };

  const handleNavigate = (page) => {
    navigate(`/${page}`);
    // Close sidebar on mobile after navigation
    setSidebarMobileOpen?.(false);
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
  };

  const handleNotificationClear = () => {
    console.log('Clear all notifications');
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <ErrorBoundary showError={true}>
        <OfflineIndicator />
        <AppContainer>
          <Sidebar
            collapsed={ui?.sidebarCollapsed || false}
            mobileOpen={ui?.sidebarMobileOpen || false}
            onClose={() => setSidebarMobileOpen?.(false)}
            onCollapse={toggleSidebar}
            currentPage={ui?.currentPage || 'dashboard'}
            onNavigate={handleNavigate}
          />
          
          <MainContent sidebarCollapsed={ui?.sidebarCollapsed || false}>
            <Header
              notifications={notifications}
              onMenuToggle={handleMenuToggle}
              onUserMenuAction={handleUserMenuAction}
              onNotificationClick={handleNotificationClick}
              onNotificationClear={handleNotificationClear}
              onSearch={handleSearch}
            />
            
            {/* Debug panel for development */}
            {import.meta.env.DEV && <ApiDebug />}
            
            <ContentArea>
              <PageTransition variant="default">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </PageTransition>
            </ContentArea>
          </MainContent>
        </AppContainer>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
