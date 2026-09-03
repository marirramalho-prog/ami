import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatConversation } from '../types/chat';

const CONVERSATIONS_KEY = '@lumi/chat_conversations';

export async function loadConversations(): Promise<ChatConversation[]> {
  const raw = await AsyncStorage.getItem(CONVERSATIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveConversations(conversations: ChatConversation[]): Promise<void> {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}
