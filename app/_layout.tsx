
import '@/global.css';

import { ThemeProvider as NavThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/theme';

// Manejo de errores de Expo Router
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        {/* Barra de estado del celular */}
        <StatusBar style="dark" />

        {/* Navegación principal de Campus Mind */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FAF9FF',
            },
          }}
        >
          {/* Pantalla de bienvenida */}
          <Stack.Screen name="index" />

          {/* Inicio de sesión */}
          <Stack.Screen name="login" />

          {/* Registro de usuarios */}
          <Stack.Screen name="register" />

          {/* Recuperación de contraseña */}
          <Stack.Screen name="forgot-password" />

          {/* Home con navegación inferior */}
          <Stack.Screen name="(tabs)" />

        </Stack>
      </NavThemeProvider>
    </GestureHandlerRootView>
  );
}
