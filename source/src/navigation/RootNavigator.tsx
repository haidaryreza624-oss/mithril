import { NavigationContainer, DefaultTheme, DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useTheme } from '../theme/theme';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import AboutScreen from '../screens/AboutScreen';
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  About: undefined; 
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {
    theme: { mode, colors },
  } = useTheme();

  const navigationTheme: NavigationTheme = useMemo(
    () => ({
      ...(mode === 'light' ? DefaultTheme : DarkTheme),
      colors: {
        ...(mode === 'light' ? DefaultTheme.colors : DarkTheme.colors),
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        primary: colors.accent,
      },
    }),
    [mode, colors],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

