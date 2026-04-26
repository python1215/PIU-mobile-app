import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import './src/i18n';
import {
  requestNotificationPermissions,
  addNotificationResponseListener,
} from './src/services/notifications';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0d6efd',
    secondary: '#6c757d',
    surface: '#ffffff',
    background: '#f8f9fa',
  },
};

export default function App() {
  const navRef = useRef(null);

  useEffect(() => {
    requestNotificationPermissions();

    const sub = addNotificationResponseListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navRef.current) {
        navRef.current.navigate(screen);
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <RootNavigator navRef={navRef} />
        <Toast />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
