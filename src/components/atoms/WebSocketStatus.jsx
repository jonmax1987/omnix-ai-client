import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { wsService } from '../../services/api';
import Icon from './Icon';
import { useI18n } from '../../hooks/useI18n';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background: ${props => 
    props.$connected 
      ? props.theme.colors.status.success + '10'
      : props.theme.colors.status.error + '10'
  };
  border-radius: ${props => props.theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => 
      props.$connected 
        ? props.theme.colors.status.success + '20'
        : props.theme.colors.status.error + '20'
    };
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.$connected 
      ? props.theme.colors.status.success
      : props.theme.colors.status.error
  };
  animation: ${props => props.$connected ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 ${props => props.theme.colors.status.success + '40'};
    }
    70% {
      box-shadow: 0 0 0 10px ${props => props.theme.colors.status.success + '00'};
    }
    100% {
      box-shadow: 0 0 0 0 ${props => props.theme.colors.status.success + '00'};
    }
  }
`;

const StatusText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const WebSocketStatus = ({ showText = true, showTooltip = true }) => {
  const { t } = useI18n();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  useEffect(() => {
    const checkConnection = () => {
      // Check if WebSocket is disabled
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!wsUrl) {
        setIsConnected(false);
        return;
      }
      
      const connected = wsService.socket && wsService.socket.connected;
      setIsConnected(connected);
      setReconnectAttempts(wsService.reconnectAttempts);
    };
    
    // Check initial status
    checkConnection();
    
    // Check status periodically
    const interval = setInterval(checkConnection, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = () => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      console.log('WebSocket is disabled in production');
      return;
    }
    
    if (!isConnected) {
      wsService.connect();
    }
  };
  
  const getStatusText = () => {
    if (isConnected) {
      return t('websocket.connected');
    }
    if (reconnectAttempts > 0) {
      return t('websocket.reconnecting', { attempts: reconnectAttempts });
    }
    return t('websocket.disconnected');
  };
  
  const getTooltipContent = () => {
    if (isConnected) {
      return t('websocket.tooltip.connected');
    }
    if (reconnectAttempts > 0) {
      return t('websocket.tooltip.reconnecting', { 
        attempts: reconnectAttempts,
        maxAttempts: wsService.maxReconnectAttempts 
      });
    }
    return t('websocket.tooltip.disconnected');
  };
  
  return (
    <StatusContainer 
      $connected={isConnected} 
      onClick={handleClick}
      title={showTooltip ? getTooltipContent() : undefined}
    >
      <StatusDot $connected={isConnected} />
      {showText && <StatusText>{getStatusText()}</StatusText>}
      {!isConnected && reconnectAttempts === 0 && (
        <Icon name="refresh" size={16} />
      )}
    </StatusContainer>
  );
};

export default WebSocketStatus;