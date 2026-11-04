import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomCharacter, Story, StorySeries } from '../types/story';
import { readWithLegacyKey } from './legacyMigration';

const CHARACTERS_KEY = '@ami/story_characters';
const STORIES_KEY = '@ami/stories';
const SERIES_KEY = '@ami/story_series';

export async function loadCharacters(): Promise<CustomCharacter[]> {
  const raw = await readWithLegacyKey(CHARACTERS_KEY, '@lumi/story_characters');
  return raw ? JSON.parse(raw) : [];
}

export async function saveCharacters(characters: CustomCharacter[]): Promise<void> {
  await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
}

export async function loadStories(): Promise<Story[]> {
  const raw = await readWithLegacyKey(STORIES_KEY, '@lumi/stories');
  return raw ? JSON.parse(raw) : [];
}

export async function saveStories(stories: Story[]): Promise<void> {
  await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export async function loadSeries(): Promise<StorySeries[]> {
  const raw = await readWithLegacyKey(SERIES_KEY, '@lumi/story_series');
  return raw ? JSON.parse(raw) : [];
}

export async function saveSeries(series: StorySeries[]): Promise<void> {
  await AsyncStorage.setItem(SERIES_KEY, JSON.stringify(series));
}
