import { Platform } from 'react-native';

export const palette = {
    pink500: '#E91E63',
    pink300: '#F48FB1',
    pink700: '#C2185B',
    pink50: '#FCE4EC',

    white: '#FFFFFF',
    black: '#000000',

    gray50: '#F8F9FA',
    gray100: '#F5F5F5',
    gray200: '#E0E0E0',
    gray300: '#BDBDBD',
    gray500: '#9E9E9E',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#1A1D1E',

    darkSurface: '#1E1E1E',
    darkBackground: '#121212',

    success: '#00C853',
    warning: '#FFB400',
    error: '#D32F2F',
};

export const lightTheme = {
    primary: palette.pink500,
    secondary: palette.pink300,
    accent: palette.pink700,
    background: palette.white,
    surface: palette.gray50,
    surfaceHighlight: palette.pink50,
    text: palette.gray900,
    textSecondary: palette.gray700,
    border: palette.gray200,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    white: palette.white,
    black: palette.black,
    icon: palette.gray900,
    divider: palette.gray200,
};

export const darkTheme = {
    primary: palette.pink500, // Keep primary brand color
    secondary: palette.pink700,
    accent: palette.pink300,
    background: palette.darkBackground,
    surface: palette.darkSurface,
    surfaceHighlight: '#2C1A21', // Darker pinkish surface
    text: palette.gray100,
    textSecondary: palette.gray500,
    border: palette.gray800,
    success: palette.success,
    warning: palette.warning,
    error: '#EF5350',
    white: palette.white,
    black: palette.black,
    icon: palette.gray100,
    divider: palette.gray800,
};

// Default export for backward compatibility during migration
export const colors = lightTheme;

export const typography = {
    h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
    caption: { fontSize: 13, fontWeight: '400' as const },
    small: { fontSize: 11, fontWeight: '500' as const },
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    s: 6,
    m: 10,
    l: 16,
    xl: 24,
    round: 999,
};

export const shadows = {
    small: Platform.select({
        web: { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)' },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
        }
    }),
    medium: Platform.select({
        web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
        }
    }),
    large: Platform.select({
        web: { boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)' },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8,
        }
    }),
};
