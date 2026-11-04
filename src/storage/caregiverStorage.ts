import AsyncStorage from '@react-native-async-storage/async-storage';
import { Caregiver } from '../types/caregiver';
import { readWithLegacyKey } from './legacyMigration';

const STORAGE_KEY = '@ami/caregivers';

export async function loadCaregivers(): Promise<Caregiver[]> {
  const raw = await readWithLegacyKey(STORAGE_KEY, '@lumi/caregivers');
  return raw ? JSON.parse(raw) : [];
}

export async function saveCaregivers(caregivers: Caregiver[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(caregivers));
}
