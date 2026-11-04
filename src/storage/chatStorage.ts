import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatConversation } from '../types/chat';
import { readWithLegacyKey } from './legacyMigration';

const CONVERSATIONS_KEY = '@ami/chat_conversations';

export async function loadConversations(): Promise<ChatConversation[]> {
  const raw = await readWithLegacyKey(CONVERSATIONS_KEY, '@lumi/chat_conversations');
  const conversas: ChatConversation[] = raw ? JSON.parse(raw) : [];
  // Mensagens salvas antes do rebranding guardavam o remetente como 'lumi'.
  return conversas.map((c) => ({
    ...c,
    mensagens: c.mensagens.map((m) => ({
      ...m,
      from: (m.from as string) === 'lumi' ? 'ami' : m.from,
    })),
  }));
}

export async function saveConversations(conversations: ChatConversation[]): Promise<void> {
  await AsyncStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}
