import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('Notifications handler init failed:', error?.message || error);
  }
}

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function setBadgeCount(count) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (_) {}
}

export async function scheduleIssueAlert(openCount) {
  if (Platform.OS === 'web') return;
  if (openCount === 0) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'PIU Management',
      body: `You have ${openCount} open issue${openCount === 1 ? '' : 's'} requiring attention.`,
      data: { screen: 'Issues' },
      sound: true,
    },
    trigger: { seconds: 2 },
  });
}

export async function scheduleOfflineSyncNotification() {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Data Synced',
      body: 'Your PIU data has been refreshed in the background.',
      sound: false,
    },
    trigger: { seconds: 1 },
  });
}

export async function cancelAllNotifications() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(handler) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
