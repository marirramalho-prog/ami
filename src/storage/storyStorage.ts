import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomCharacter, Story, StorySeries } from '../types/story';

const CHARACTERS_KEY = '@lumi/story_characters';
const STORIES_KEY = '@lumi/stories';
const SERIES_KEY = '@lumi/story_series';

export async function loadCharacters(): Promise<CustomCharacter[]> {
  const raw = await AsyncStorage.getItem(CHARACTERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCharacters(characters: CustomCharacter[]): Promise<void> {
  await AsyncStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
}

export async function loadStories(): Promise<Story[]> {
  const raw = await AsyncStorage.getItem(STORIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveStories(stories: Story[]): Promise<void> {
  await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
}

export async function loadSeries(): Promise<StorySeries[]> {
  const raw = await AsyncStorage.getItem(SERIES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSeries(series: StorySeries[]): Promise<void> {
  await AsyncStorage.setItem(SERIES_KEY, JSON.stringify(series));
}
