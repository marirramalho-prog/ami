import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child } from '../types/child';

const STORAGE_KEY = '@lumi/children';

export async function loadChildren(): Promise<Child[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveChildren(children: Child[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(children));
}
