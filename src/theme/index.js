import { colors } from './colors';
import { spacing, borderRadius } from './spacing';

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography: {
    h1: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
    h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
    h3: { fontSize: 16, fontWeight: '700' },
    section: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
    body: { fontSize: 15, fontWeight: '500' },
    bodySmall: { fontSize: 13, fontWeight: '500' },
    caption: { fontSize: 11, fontWeight: '600' },
    statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
    tabLabel: { fontSize: 12, fontWeight: '600' }
  },
  shadows: {
    sm: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    }
  }
};

export * from './colors';
export * from './spacing';
