import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  accent: {
    50: '#e1f5fe',
    100: '#b3e5fc',
    200: '#81d4fa',
    300: '#4fc3f7',
    400: '#29b6f6',
    500: '#03a9f4',
    600: '#039be5',
    700: '#0288d1',
    800: '#0277bd',
    900: '#01579b',
  },
};

const semanticTokens = {
  colors: {
    'bg.default': {
      default: 'gray.50',
      _dark: 'gray.900',
    },
    'bg.subtle': {
      default: 'white',
      _dark: 'gray.800',
    },
    'text.default': {
      default: 'gray.900',
      _dark: 'gray.50',
    },
    'text.muted': {
      default: 'gray.600',
      _dark: 'gray.400',
    },
    'border.default': {
      default: 'gray.100',
      _dark: 'gray.700',
    },
  },
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        transition: 'all 0.2s',
      },
      ghost: {
        _hover: {
          bg: 'brand.50',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        overflow: 'hidden',
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: 'xl',
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'brand.700',
      _dark: {
        color: 'brand.200',
      },
    },
  },
};

const styles = {
  global: (props) => ({
    body: {
      bg: 'bg.default',
      color: 'text.default',
    },
    ':root': {
      '--gradient-start': props.colorMode === 'dark' ? 'brand.800' : 'brand.50',
      '--gradient-end': props.colorMode === 'dark' ? 'accent.800' : 'accent.50',
    },
  }),
};

const userTheme = extendTheme({
  colors,
  semanticTokens,
  components,
  styles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: '"Source Sans Pro", system-ui, sans-serif',
    body: '"Open Sans", system-ui, sans-serif',
  },
  shadows: {
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },
});

export default userTheme; 

