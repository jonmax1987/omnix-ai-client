import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledIcon = styled(motion.svg)`
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  fill: ${props => props.color || 'currentColor'};
  flex-shrink: 0;
  transition: all ${props => props.theme.animation.duration.fast} ${props => props.theme.animation.easing.easeInOut};
  
  ${props => props.clickable && `
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
    }
  `}
`;

const icons = {
  // Navigation
  home: (
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ),
  dashboard: (
    <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2H9V7z" />
  ),
  analytics: (
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  ),
  products: (
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  ),
  alerts: (
    <path d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 8V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H8a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h2a2 2 0 002-2v-2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
  ),
  settings: (
    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
  ),

  // Actions
  plus: (
    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  ),
  minus: (
    <path d="M6 12h12" />
  ),
  edit: (
    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  ),
  delete: (
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  ),
  save: (
    <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3-3-3m3-2v12" />
  ),
  copy: (
    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  ),
  archive: (
    <path d="M5 8h14l-1 9a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8zM4 6a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM10 12h4" />
  ),

  // Interface
  search: (
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  ),
  filter: (
    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  ),
  sort: (
    <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  ),
  menu: (
    <path d="M4 6h16M4 12h16M4 18h16" />
  ),
  close: (
    <path d="M6 18L18 6M6 6l12 12" />
  ),
  chevronDown: (
    <path d="m6 9 6 6 6-6" />
  ),
  chevronUp: (
    <path d="m18 15-6-6-6 6" />
  ),
  chevronLeft: (
    <path d="m15 18-6-6 6-6" />
  ),
  chevronRight: (
    <path d="m9 18 6-6-6-6" />
  ),
  arrowUp: (
    <path d="M7 14l5-5 5 5" />
  ),
  arrowDown: (
    <path d="M7 10l5 5 5-5" />
  ),
  arrowLeft: (
    <path d="M19 12H5m7 7l-7-7 7-7" />
  ),
  arrowRight: (
    <path d="M5 12h14m-7 7l7-7-7-7" />
  ),
  refresh: (
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  ),
  download: (
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  ),
  upload: (
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  ),
  trending: (
    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  ),
  package: (
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  ),

  // Status
  check: (
    <path d="M5 13l4 4L19 7" />
  ),
  checkCircle: (
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  info: (
    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  warning: (
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  ),
  error: (
    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  bell: (
    <path d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 8V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H8a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h2a2 2 0 002-2v-2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
  ),

  // User
  user: (
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  ),
  users: (
    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  ),
  logout: (
    <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  ),

  // Business
  trending: (
    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  ),
  calendar: (
    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  ),
  clock: (
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  eye: (
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  ),
  eyeOff: (
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
  ),
  download: (
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  ),
  upload: (
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  ),
  
  // Additional missing icons
  activity: (
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  ),
  'pie-chart': (
    <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z" />
  ),
  'alert-triangle': (
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  ),
  alert: (
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  ),
  'trending-up': (
    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  ),
  'more-vertical': (
    <path d="M12 12h.01M12 6h.01M12 18h.01" />
  ),
  'grip-vertical': (
    <path d="M9 12h.01M9 6h.01M9 18h.01M15 12h.01M15 6h.01M15 18h.01" />
  ),
  x: (
    <path d="M18 6L6 18M6 6l12 12" />
  ),
  zap: (
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  ),
  tag: (
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
  ),
  tags: (
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
  ),
  'dollar-sign': (
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  ),
  'check-circle': (
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
  ),
  'check-square': (
    <path d="M9 11l3 3L22 4" />
  ),
  'chevron-down': (
    <path d="M6 9l6 6 6-6" />
  ),
  grid: (
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
  ),
  inbox: (
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
  ),
  folder: (
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2l5 2h11a2 2 0 012 2z" />
  ),
  gauge: (
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  ),
  image: (
    <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" />
  ),
  'image-off': (
    <path d="M21 21L3 3M21 15l-5-5L5 21" />
  )
};

const Icon = ({
  name,
  size = 24,
  color,
  clickable = false,
  className,
  onClick,
  ...props
}) => {
  const iconPath = icons[name];
  
  if (!iconPath) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <StyledIcon
      size={size}
      color={color}
      clickable={clickable}
      className={className}
      onClick={onClick}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={clickable ? { scale: 1.1 } : undefined}
      whileTap={clickable ? { scale: 0.9 } : undefined}
      {...props}
    >
      {iconPath}
    </StyledIcon>
  );
};

export default Icon;
export { icons };