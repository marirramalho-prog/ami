import AsyncStorage from '@react-native-async-storage/async-storage';
import { Caregiver } from '../types/caregiver';

const STORAGE_KEY = '@lumi/caregivers';

export async function loadCaregivers(): Promise<Caregiver[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCaregivers(caregivers: Caregiver[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(caregivers));
}
