import { colors, typography, spacing, breakpoints, animation } from './tokens.js';

export const lightTheme = {
  colors: {
    ...colors,
    background: {
      primary: colors.gray[50],
      secondary: colors.gray[100],
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      tertiary: colors.gray[400],
      inverse: '#ffffff'
    },
    border: {
      default: colors.gray[200],
      strong: colors.gray[300],
      subtle: colors.gray[100]
    },
    status: {
      success: colors.green[500],
      warning: colors.yellow[500],
      error: colors.red[500],
      info: colors.primary[500]
    }
  },
  typography,
  spacing,
  breakpoints,
  animation,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...colors,
    background: {
      primary: colors.gray[900],
      secondary: colors.gray[800],
      elevated: colors.gray[700],
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    text: {
      primary: colors.gray[50],
      secondary: colors.gray[300],
      tertiary: colors.gray[400],
      inverse: colors.gray[900]
    },
    border: {
      default: colors.gray[700],
      strong: colors.gray[600],
      subtle: colors.gray[800]
    },
    status: {
      success: colors.green[400],
      warning: colors.yellow[400],
      error: colors.red[400],
      info: colors.primary[400]
    }
  }
};