import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgendaEvent, ChecklistTemplate } from '../types/routine';

const EVENTS_KEY = '@lumi/agenda_events';
const CHECKLISTS_KEY = '@lumi/checklist_templates';

export async function loadEvents(): Promise<AgendaEvent[]> {
  const raw = await AsyncStorage.getItem(EVENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveEvents(events: AgendaEvent[]): Promise<void> {
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export async function loadChecklists(): Promise<ChecklistTemplate[]> {
  const raw = await AsyncStorage.getItem(CHECKLISTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveChecklists(templates: ChecklistTemplate[]): Promise<void> {
  await AsyncStorage.setItem(CHECKLISTS_KEY, JSON.stringify(templates));
}
