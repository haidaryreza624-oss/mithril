import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; 
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/theme/theme';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback } from 'react';

SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { theme } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* SafeAreaView ensures content does not go under notches or status bar */}
        <SafeAreaView 
          style={[styles.root, { backgroundColor: theme.colors.background }]}
          edges={['top', 'left', 'right']} 
        >
          <View
            style={[styles.root, { backgroundColor: theme.colors.background }]}
            onLayout={onLayoutRootView}
          >
            <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});