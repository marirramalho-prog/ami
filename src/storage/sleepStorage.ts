import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyLog, RitualCompletionMap, SleepSchedule } from '../types/sleep';

const SCHEDULES_KEY = '@lumi/sleep_schedules';
const COMPLETIONS_KEY = '@lumi/sleep_ritual_completions';
const LOGS_KEY = '@lumi/sleep_daily_logs';

export async function loadSchedules(): Promise<SleepSchedule[]> {
  const raw = await AsyncStorage.getItem(SCHEDULES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSchedules(schedules: SleepSchedule[]): Promise<void> {
  await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

export async function loadCompletions(): Promise<RitualCompletionMap> {
  const raw = await AsyncStorage.getItem(COMPLETIONS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveCompletions(map: RitualCompletionMap): Promise<void> {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(map));
}

export async function loadDailyLogs(): Promise<DailyLog[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveDailyLogs(logs: DailyLog[]): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}
