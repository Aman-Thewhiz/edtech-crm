import { extendTheme } from '@chakra-ui/react';

const colors = {
  primary: '#4a154b',
  primaryDeep: '#481a54',
  primaryPress: '#611f69',
  primaryTint: '#592466',
  onPrimary: '#ffffff',
  ink: '#1d1d1d',
  inkMute: '#696969',
  linkBlue: '#1264a3',
  linkHover: '#3860be',
  canvas: '#ffffff',
  canvasCream: '#f4ede4',
  canvasLavender: '#f9f0ff',
  hairline: '#e6e6e6',
  semanticError: '#cc4117',
  semanticSuccess: '#007a5a',
  onAubergineMute: '#d9bdde',
};

export const theme = extendTheme({
  colors: {
    brand: colors,
  },
  fonts: {
    heading: 'Salesforce-Avant-Garde, Inter, system-ui, sans-serif',
    body: 'Salesforce-Sans, Inter, system-ui, sans-serif',
  },
  radii: {
    sm: '4px',
    xl: '16px',
    pill: '90px',
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: 700,
      },
      variants: {
        solid: {
          bg: 'brand.primary',
          color: 'brand.onPrimary',
          _hover: { bg: 'brand.primaryPress' },
        },
        outline: {
          borderColor: 'brand.primary',
          color: 'brand.primary',
        },
        secondary: {
          bg: 'brand.canvasLavender',
          color: 'brand.ink',
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: '4px',
        },
      },
    },
  },
});