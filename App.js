import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import './src/i18n';
import { requestNotificationPermissions, addNotificationResponseListener } from './src/services/notifications';

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

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected startup error' };
  }
  componentDidCatch(error) {
    console.error('App crashed during render:', error);
  }
  reset = () => {
    this.setState({ hasError: false, message: '' });
  };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.fallbackRoot}>
        <Text style={styles.fallbackTitle}>Unable to render app</Text>
        <Text style={styles.fallbackText}>{this.state.message}</Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={this.reset}>
          <Text style={styles.fallbackButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default function App() {
  const navRef = useRef(null);
  useEffect(() => {
    requestNotificationPermissions().catch((err) => {
      console.warn('Notification permission request failed:', err?.message || err);
    });
    const sub = addNotificationResponseListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navRef.current) navRef.current.navigate(screen);
    });
    return () => sub.remove();
  }, []);
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <PaperProvider theme={theme}>
          <StatusBar style="light" />
          <RootNavigator navRef={navRef} />
          <Toast />
        </PaperProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fallbackRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#f8f9fa' },
  fallbackTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, color: '#212529' },
  fallbackText: { fontSize: 14, color: '#495057', textAlign: 'center', marginBottom: 16 },
  fallbackButton: { backgroundColor: '#0d6efd', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  fallbackButtonText: { color: '#fff', fontWeight: '700' },
});
