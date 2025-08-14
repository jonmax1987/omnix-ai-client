import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useEffect } from 'react';
import { lightTheme, darkTheme } from './styles/theme';
import useStore from './store';

// Layout components
import Header from './components/organisms/Header';
import Sidebar from './components/organisms/Sidebar';
import ErrorBoundary from './components/organisms/ErrorBoundary';

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
  const { ui = {}, toggleSidebar, setSidebarMobileOpen, setCurrentPage } = store || {};
  
  // Ensure we always have a valid theme
  if (!store) {
    return <div>Loading...</div>;
  }
  
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

  const currentTheme = ui?.theme === 'dark' ? darkTheme : lightTheme;

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
      <ErrorBoundary showError={true}>
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
            
            <ContentArea>
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
