import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#f0f4ff',
    100: '#d9e4ff',
    200: '#b3c5ff',
    300: '#8da6ff',
    400: '#6687ff',
    500: '#4068ff',
    600: '#3352cc',
    700: '#263d99',
    800: '#1a2966',
    900: '#0d1433',
  },
  accent: {
    50: '#f5f0ff',
    100: '#ebe0ff',
    200: '#d6c2ff',
    300: '#c2a3ff',
    400: '#ad85ff',
    500: '#9966ff',
    600: '#7a52cc',
    700: '#5c3d99',
    800: '#3d2966',
    900: '#1f1433',
  },
};

const semanticTokens = {
  colors: {
    'bg.default': {
      default: 'gray.50',
      _dark: 'gray.900',
    },
    'bg.subtle': {
      default: 'gray.100',
      _dark: 'gray.800',
    },
    'bg.muted': {
      default: 'gray.200',
      _dark: 'gray.700',
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
      default: 'gray.200',
      _dark: 'gray.700',
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

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.600',
        },
      }),
      outline: {
        borderWidth: '2px',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.subtle',
        borderRadius: 'xl',
        boxShadow: 'lg',
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
    },
  },
};

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  colors,
  semanticTokens,
  styles,
  components,
  config,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  shadows: {
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
  },
});

export default theme; 