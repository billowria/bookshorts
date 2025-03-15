import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  secondary: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

const semanticTokens = {
  colors: {
    'bg.default': {
      default: 'primary.50',
      _dark: 'gray.900',
    },
    'bg.subtle': {
      default: 'white',
      _dark: 'gray.800',
    },
    'bg.muted': {
      default: 'primary.100',
      _dark: 'gray.700',
    },
    'text.default': {
      default: 'gray.900',
      _dark: 'gray.50',
    },
    'text.muted': {
      default: 'primary.700',
      _dark: 'primary.200',
    },
    'border.default': {
      default: 'primary.100',
      _dark: 'primary.900',
    },
  },
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'primary',
    },
    variants: {
      solid: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        transition: 'all 0.2s',
      },
      outline: {
        borderColor: 'primary.500',
        color: 'primary.500',
        _hover: {
          bg: 'primary.50',
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'primary.700',
      fontWeight: 'semibold',
      _dark: {
        color: 'primary.200',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        borderColor: 'primary.100',
        _hover: {
          borderColor: 'primary.200',
          boxShadow: 'md',
        },
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
      '--gradient-start': props.colorMode === 'dark' ? 'primary.800' : 'primary.50',
      '--gradient-end': props.colorMode === 'dark' ? 'primary.900' : 'primary.100',
    },
  }),
};

const adminTheme = extendTheme({
  colors,
  semanticTokens,
  components,
  styles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
});

export default adminTheme; 