import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child } from '../types/child';
import { readWithLegacyKey } from './legacyMigration';

const STORAGE_KEY = '@ami/children';

export async function loadChildren(): Promise<Child[]> {
  const raw = await readWithLegacyKey(STORAGE_KEY, '@lumi/children');
  return raw ? JSON.parse(raw) : [];
}

export async function saveChildren(children: Child[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(children));
}
