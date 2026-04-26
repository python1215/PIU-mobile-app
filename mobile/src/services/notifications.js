import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function setBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (_) {}
}

export async function scheduleIssueAlert(openCount) {
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
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(handler) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
