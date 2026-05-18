import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    card: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    danger: string;
  };
};
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const adjustColor = (hex: string, percent: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    return Math.min(255, Math.max(0, Math.round(value * (1 + percent))));
  };

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
};

const getLuminance = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastColor = (hex: string) => {
  const luminance = getLuminance(hex);
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
const generateTheme = (primaryColor: string, mode: 'light' | 'dark'): AppTheme['colors'] => {
  const isLight = mode === 'light';
  const background = isLight ? '#f8fafc' : '#030712';
  const card = isLight ? '#ffffff' : '#111827';
  const border = isLight ? '#e2e8f0' : '#1e2937';

  const text = isLight ? '#0f172a' : '#f9fafb';
  const textSecondary = isLight ? '#475569' : '#94a3b8';

  const success = isLight ? '#16a34a' : '#4ade80';
  const danger = isLight ? '#dc2626' : '#f87171';

  return {
    background,
    card,
    accent: primaryColor,
    text,
    textSecondary,
    border,
    success,
    danger,
  };
};



export const COLOR_PRESETS = [
  { name: 'آبی', primary: '#0284c7' },
  { name: 'سبز', primary: '#16a34a' },
  { name: 'بنفش', primary: '#9333ea' },
  { name: 'نارنجی', primary: '#ea580c' },
  { name: 'صورتی', primary: '#db2777' },
  { name: 'قرمز', primary: '#dc2626' },
];

const STORAGE_KEYS = {
  THEME_MODE: '@theme_mode',
  PRIMARY_COLOR: '@primary_color',
};

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => Promise<void>;
  primaryColor: string;
  colorPresets: typeof COLOR_PRESETS;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>('#0284c7');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedMode, savedColor] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR),
        ]);

        if (savedMode === 'dark' || savedMode === 'light') {
          setMode(savedMode);
        }

        if (savedColor) {
          setPrimaryColorState(savedColor);
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, newMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  const setPrimaryColor = async (color: string) => {
    setPrimaryColorState(color);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, color);
    } catch (error) {
      console.error('Failed to save primary color:', error);
    }
  };

  const theme = useMemo(() => {
    const colors = generateTheme(primaryColor, mode);
    return {
      mode,
      colors,
    };
  }, [mode, primaryColor]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      setPrimaryColor,
      primaryColor,
      colorPresets: COLOR_PRESETS,
    }),
    [theme, primaryColor],
  );

  if (isLoading) {
    return null; 
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
export const themeUtils = {
  getContrastColor,
  adjustColor,
  hexToRgb,
  rgbToHex,
  getLuminance,
};