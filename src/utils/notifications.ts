import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AgendaEvent } from '../types/routine';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleReminder(event: AgendaEvent): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { dia, mes, ano } = event.data;
  const [horaStr, minutoStr] = event.hora.split(':');
  const trigger = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    Number(horaStr || '9'),
    Number(minutoStr || '0'),
  );

  if (trigger.getTime() <= Date.now()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lumi — lembrete',
      body: event.titulo,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });

  return id;
}

export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (Platform.OS === 'web' || !notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
