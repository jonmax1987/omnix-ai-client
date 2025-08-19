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
  background: ${props => {
    if (props.$state === 'connected') return props.theme.colors.status.success + '10';
    if (props.$state === 'connecting' || props.$state === 'reconnecting') return props.theme.colors.status.warning + '10';
    return props.theme.colors.status.error + '10';
  }};
  border-radius: ${props => props.theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => {
      if (props.$state === 'connected') return props.theme.colors.status.success + '20';
      if (props.$state === 'connecting' || props.$state === 'reconnecting') return props.theme.colors.status.warning + '20';
      return props.theme.colors.status.error + '20';
    }};
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.$state === 'connected') return props.theme.colors.status.success;
    if (props.$state === 'connecting' || props.$state === 'reconnecting') return props.theme.colors.status.warning;
    return props.theme.colors.status.error;
  }};
  animation: ${props => 
    props.$state === 'connected' ? 'pulse 2s infinite' :
    (props.$state === 'connecting' || props.$state === 'reconnecting') ? 'blink 1s infinite' : 'none'
  };
  
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
  
  @keyframes blink {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0.3;
    }
  }
`;

const StatusText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const MetricsText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.muted};
  margin-left: ${props => props.theme.spacing[1]};
`;

const WebSocketStatus = ({ showText = true, showTooltip = true, showMetrics = false }) => {
  const { t } = useI18n();
  const [connectionState, setConnectionState] = useState('disconnected');
  const [metrics, setMetrics] = useState({});
  const [queuedMessages, setQueuedMessages] = useState(0);
  
  useEffect(() => {
    // Check if WebSocket is disabled
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      setConnectionState('disconnected');
      return;
    }
    
    // Get initial state
    setConnectionState(wsService.getConnectionState());
    setMetrics(wsService.getMetrics());
    
    // Listen to state changes using the enhanced service's event system
    const handleStateChange = ({ to }) => {
      setConnectionState(to);
    };
    
    const handleConnected = () => {
      setMetrics(wsService.getMetrics());
    };
    
    const handleDisconnected = () => {
      setMetrics(wsService.getMetrics());
    };
    
    const handleMessage = () => {
      // Update metrics when messages are received
      if (showMetrics) {
        setMetrics(wsService.getMetrics());
      }
    };
    
    // Subscribe to events
    wsService.on('state-change', handleStateChange);
    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    
    if (showMetrics) {
      wsService.on('message', handleMessage);
    }
    
    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      const currentMetrics = wsService.getMetrics();
      setMetrics(currentMetrics);
      setQueuedMessages(currentMetrics.queuedMessages || 0);
    }, 2000);
    
    return () => {
      wsService.off('state-change', handleStateChange);
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      if (showMetrics) {
        wsService.off('message', handleMessage);
      }
      clearInterval(metricsInterval);
    };
  }, [showMetrics]);
  
  const handleClick = () => {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      console.log('WebSocket is disabled');
      return;
    }
    
    if (connectionState !== 'connected') {
      wsService.connect().catch(error => {
        console.error('Failed to connect to WebSocket:', error);
      });
    }
  };
  
  const getStatusText = () => {
    const attempts = metrics.reconnectAttempts || 0;
    
    switch (connectionState) {
      case 'connected':
        return t('websocket.connected', { fallback: 'Connected' });
      case 'connecting':
        return t('websocket.connecting', { fallback: 'Connecting...' });
      case 'reconnecting':
        return t('websocket.reconnecting', { 
          attempts,
          fallback: `Reconnecting... (${attempts})` 
        });
      case 'disconnected':
      default:
        return t('websocket.disconnected', { fallback: 'Disconnected' });
    }
  };
  
  const getTooltipContent = () => {
    const attempts = metrics.reconnectAttempts || 0;
    const maxAttempts = wsService.config?.maxReconnectAttempts || 5;
    
    switch (connectionState) {
      case 'connected':
        const uptime = metrics.lastConnectedAt ? 
          Math.floor((Date.now() - metrics.lastConnectedAt) / 1000) : 0;
        return t('websocket.tooltip.connected', { 
          uptime,
          fallback: `Connected • Uptime: ${uptime}s` 
        });
      case 'connecting':
        return t('websocket.tooltip.connecting', { 
          fallback: 'Attempting to connect...' 
        });
      case 'reconnecting':
        return t('websocket.tooltip.reconnecting', { 
          attempts,
          maxAttempts,
          fallback: `Reconnecting... (${attempts}/${maxAttempts})` 
        });
      case 'disconnected':
      default:
        const hasQueued = queuedMessages > 0;
        return t('websocket.tooltip.disconnected', { 
          queuedMessages,
          hasQueued,
          fallback: hasQueued ? 
            `Disconnected • ${queuedMessages} queued messages` : 
            'Disconnected • Click to reconnect' 
        });
    }
  };
  
  const isConnected = connectionState === 'connected';
  const showRefreshIcon = connectionState === 'disconnected' && metrics.reconnectAttempts === 0;
  
  return (
    <StatusContainer 
      $state={connectionState}
      onClick={handleClick}
      title={showTooltip ? getTooltipContent() : undefined}
    >
      <StatusDot $state={connectionState} />
      {showText && <StatusText>{getStatusText()}</StatusText>}
      {showMetrics && isConnected && (
        <MetricsText>
          ↓{metrics.messagesReceived || 0} ↑{metrics.messagesSent || 0}
        </MetricsText>
      )}
      {queuedMessages > 0 && (
        <MetricsText title={`${queuedMessages} queued messages`}>
          📨{queuedMessages}
        </MetricsText>
      )}
      {showRefreshIcon && (
        <Icon name="refresh" size={16} />
      )}
    </StatusContainer>
  );
};

export default WebSocketStatus;